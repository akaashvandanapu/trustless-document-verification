import { NextRequest, NextResponse } from "next/server";

// Disable body parsing limit for large PDFs
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

const PROVER_URL = process.env.PROVER_URL || "http://localhost:3002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("📥 [API] Received prove request, proxying to prover...");
    console.log("📥 [API] Prover URL:", `${PROVER_URL}/prove`);
    console.log("📥 [API] Request body keys:", Object.keys(body));
    console.log("📥 [API] PDF bytes length:", body.pdf_bytes?.length || 0);
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
      const response = await fetch(`${PROVER_URL}/prove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [API] Prover error:", errorText);
        return NextResponse.json(
          { error: `Prover error: ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log("✅ [API] Proof generated successfully");
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("❌ [API] Request timeout after 5 minutes");
        return NextResponse.json(
          { error: "Request timeout - proof generation took too long" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error("❌ [API] Error proxying to prover:", error);
    console.error("❌ [API] Error details:", {
      message: error.message,
      name: error.name,
      cause: error.cause,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate proof" },
      { status: 500 }
    );
  }
}

