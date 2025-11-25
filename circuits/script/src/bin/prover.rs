use axum::{routing::post, serve, Json, Router};
use serde::{Deserialize, Serialize};
use sp1_sdk::{include_elf, ProverClient, SP1ProofWithPublicValues, SP1Stdin};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use zkpdf_lib::types::PDFCircuitInput;

pub const ZKPDF_ELF: &[u8] = include_elf!("zkpdf-program");

#[derive(Deserialize)]
struct ProofRequest {
    pdf_bytes: Vec<u8>,
    page_number: u8,
    sub_string: String,
    offset: Option<usize>,
}

#[derive(Serialize)]
struct VerifyResponse {
    valid: bool,
    error: Option<String>,
}

async fn prove(Json(body): Json<ProofRequest>) -> Json<SP1ProofWithPublicValues> {
    tracing::info!("📥 Received proof request: page={}, substring={}, pdf_bytes_len={}", 
        body.page_number, body.sub_string, body.pdf_bytes.len());

    let ProofRequest {
        pdf_bytes,
        page_number,
        sub_string,
        offset,
    } = body;

    let offset = offset.expect("Offset must be provided in the request");
    let offset_u32 = u32::try_from(offset).expect("offset does not fit in u32");

    let proof_input = PDFCircuitInput {
        pdf_bytes,
        page_number,
        offset: offset_u32,
        substring: sub_string,
    };

    let mut stdin = SP1Stdin::new();
    stdin.write(&proof_input);

    // Check if network mode is requested
    let prover_mode = std::env::var("SP1_PROVER").unwrap_or_default();
    let use_network = prover_mode == "network" && 
                      std::env::var("NETWORK_PRIVATE_KEY")
                          .unwrap_or_default()
                          .starts_with("0x");

    tracing::info!("🚀 Starting proof generation...");
    
    // Try network prover first if configured, with automatic fallback to local CPU
    let proof = if use_network {
        tracing::info!("📦 Attempting plonk proof via network prover...");
        
        // Create network client
        let network_client = ProverClient::from_env();
        tracing::info!("🔧 Setting up network prover client...");
        let (pk, _vk) = network_client.setup(ZKPDF_ELF);
        tracing::info!("✅ Network prover client setup complete");
        
        // Try network proof generation
        match network_client.prove(&pk, &stdin).plonk().run() {
            Ok(proof) => {
                tracing::info!("✅ Network proof generation successful");
                proof
            }
            Err(e) => {
                // Check if it's a recoverable error (insufficient credits, network issues)
                let error_msg = e.to_string();
                let is_recoverable = error_msg.contains("insufficient balance") ||
                                    error_msg.contains("ResourceExhausted") ||
                                    error_msg.contains("network") ||
                                    error_msg.contains("timeout") ||
                                    error_msg.contains("connection");
                
                if is_recoverable {
                    tracing::warn!("⚠️  Network prover failed: {}", error_msg);
                    tracing::info!("🔄 Falling back to local CPU proving...");
                    
                    // Create local CPU client (unset network env vars temporarily)
                    let original_prover = std::env::var("SP1_PROVER").ok();
                    let original_key = std::env::var("NETWORK_PRIVATE_KEY").ok();
                    
                    std::env::remove_var("SP1_PROVER");
                    std::env::remove_var("NETWORK_PRIVATE_KEY");
                    
                    let local_client = ProverClient::from_env();
                    tracing::info!("🔧 Setting up local CPU prover client...");
                    let (pk_local, _vk_local) = local_client.setup(ZKPDF_ELF);
                    tracing::info!("✅ Local CPU prover client setup complete");
                    tracing::info!("📦 Using core proof (local CPU fallback)");
                    
                    // Restore original env vars
                    if let Some(val) = original_prover {
                        std::env::set_var("SP1_PROVER", val);
                    }
                    if let Some(val) = original_key {
                        std::env::set_var("NETWORK_PRIVATE_KEY", val);
                    }
                    
                    // Generate proof locally
                    local_client
                        .prove(&pk_local, &stdin)
                        .run()
                        .expect("failed to generate local CPU proof")
                } else {
                    // Non-recoverable error, propagate it
                    tracing::error!("❌ Network prover failed with non-recoverable error: {}", error_msg);
                    panic!("failed to generate plonk proof: {}", e);
                }
            }
        }
    } else {
        // Use local CPU from the start
        tracing::info!("📦 Using core proof (local CPU mode)");
        let client = ProverClient::from_env();
        tracing::info!("🔧 Setting up local CPU prover client...");
        let (pk, _vk) = client.setup(ZKPDF_ELF);
        tracing::info!("✅ Local CPU prover client setup complete");
        
        client
            .prove(&pk, &stdin)
            .run()
            .expect("failed to generate proof")
    };
    
    tracing::info!("✅ Proof generation complete");

    Json(proof)
}

async fn verify(Json(proof): Json<SP1ProofWithPublicValues>) -> Json<VerifyResponse> {
    // Initialize client based on environment configuration
    // ProverClient::from_env() handles both network and local CPU modes
    let client = ProverClient::from_env();
    
    let (_pk, vk) = client.setup(ZKPDF_ELF);

    match client.verify(&proof, &vk) {
        Ok(_) => Json(VerifyResponse {
            valid: true,
            error: None,
        }),
        Err(e) => Json(VerifyResponse {
            valid: false,
            error: Some(format!("Verification failed: {}", e)),
        }),
    }
}

#[tokio::main]
async fn main() {
    sp1_sdk::utils::setup_logger();
    
    // Try to load .env from multiple locations
    // 1. Current working directory
    dotenv::dotenv().ok();
    // 2. Script directory (where .env file should be)
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            if let Some(script_dir) = exe_dir.parent().and_then(|p| p.parent()) {
                let env_path = script_dir.join("script").join(".env");
                if env_path.exists() {
                    dotenv::from_path(&env_path).ok();
                }
            }
        }
    }
    // 3. Try relative to CARGO_MANIFEST_DIR if set
    if let Ok(manifest_dir) = std::env::var("CARGO_MANIFEST_DIR") {
        let env_path = std::path::Path::new(&manifest_dir).join(".env");
        if env_path.exists() {
            dotenv::from_path(&env_path).ok();
        }
    }

    let prover = std::env::var("SP1_PROVER").unwrap_or_default();
    let key = std::env::var("NETWORK_PRIVATE_KEY").unwrap_or_default();

    // Check if network mode is requested
    if prover == "network" {
        // Validate network private key if network mode is enabled
        if !key.starts_with("0x") || key.len() <= 10 {
            eprintln!("⚠️  Warning: SP1_PROVER=network but NETWORK_PRIVATE_KEY is invalid or missing");
            eprintln!("   Falling back to local CPU proving mode");
            eprintln!("   To use network mode, set NETWORK_PRIVATE_KEY=0x... in your .env file");
        } else {
            tracing::info!("Using Succinct Prover Network mode");
        }
    } else {
        tracing::info!("Using local CPU proving mode (SP1_PROVER not set to 'network')");
        tracing::info!("To use network mode, set SP1_PROVER=network and NETWORK_PRIVATE_KEY=0x...");
    }

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/prove", post(prove))
        .route("/verify", post(verify))
        .layer(cors);

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(3002);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!("🚀 Prover server listening on {}", addr);
    tracing::info!("   POST /prove - Generate SNARK proof");
    tracing::info!("   POST /verify - Verify SNARK proof");

    let listener = TcpListener::bind(addr).await.unwrap();
    serve(listener, app.into_make_service()).await.unwrap();
}
