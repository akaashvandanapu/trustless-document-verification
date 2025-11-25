# PDF Verification Core

A unified Rust crate that combines PDF text extraction and digital signature verification. Provides a simple interface for verifying that specific text appears in signed PDF documents.

## 🎯 **Overview**

The `core` crate combines the functionality of `extractor` and `signature-validator` to provide a unified interface for PDF verification. It verifies both the digital signature and the presence of specific text at exact positions within the document.

## 🚀 **Quick Start**

```rust
use core::{verify_text, PdfVerificationResult};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Read PDF file
    let pdf_bytes = std::fs::read("signed_document.pdf")?;

    // Verify text at specific position
    let result = verify_text(pdf_bytes, 0, "Important Document", 100)?;

    if result.substring_matches {
        println!("✅ Text found at position 100 on page 1");
        println!("Signature valid: {}", result.signature.is_valid);
        println!("Signer: {}", result.signature.signer_info);
    } else {
        println!("❌ Text not found at specified position");
    }

    Ok(())
}
```

## 📋 **Main Interface**

### Primary Function

```rust
pub fn verify_text(
    pdf_bytes: Vec<u8>,
    page_number: u8,
    sub_string: &str,
    offset: usize,
) -> Result<PdfVerificationResult, String>
```

**Parameters:**

- `pdf_bytes`: Raw PDF file bytes
- `page_number`: Page number (0-indexed) to search
- `sub_string`: Text to search for
- `offset`: Byte offset within the page text

**Returns:**

- `Ok(PdfVerificationResult)`: Combined verification result
- `Err(String)`: Error if verification fails

### Verification Result Structure

```rust
pub struct PdfVerificationResult {
    pub substring_matches: bool,           // Text found at exact position
    pub signature: PdfSignatureResult,     // Signature verification details
}

pub struct PdfSignatureResult {
    pub is_valid: bool,                    // Signature validity
    pub message_digest: Vec<u8>,           // Extracted message digest
    pub public_key: Vec<u8>,               // Signer's public key
    pub signer_info: String,               // Signer information
    pub signing_time: Option<String>,      // Signing timestamp
    pub signature_algorithm: String,       // Used algorithm
}
```

## 🔍 **Verification Process**

The `verify_text` function performs a comprehensive verification:

### 1. **Signature Verification**

- Verifies PDF digital signature authenticity
- Checks content integrity using ByteRange
- Validates cryptographic signatures

### 2. **Text Extraction**

- Extracts text from all PDF pages
- Handles various font encodings
- Processes compressed streams

### 3. **Position Verification**

- Checks if `sub_string` appears at exact `offset`
- Validates text positioning within specified page
- Returns boolean result for proof systems

## 📝 **Usage Examples**

### Basic Text Verification

```rust
use core::verify_text;

let pdf_bytes = std::fs::read("document.pdf")?;
let result = verify_text(pdf_bytes, 0, "Sample Text", 50)?;

if result.substring_matches {
    println!("Text found at position 50 on page 1");
    println!("Signature valid: {}", result.signature.is_valid);
}
```

### Multi-Page Verification

```rust
use core::verify_text;

fn verify_document_structure(pdf_bytes: Vec<u8>) -> Result<(), String> {
    // Check title on first page
    let title_result = verify_text(pdf_bytes.clone(), 0, "Document Title", 0)?;
    if !title_result.substring_matches {
        return Err("Title not found on first page".to_string());
    }

    // Check signature on last page
    let signature_result = verify_text(pdf_bytes, 2, "Digitally signed", 200)?;
    if !signature_result.substring_matches {
        return Err("Signature not found on last page".to_string());
    }

    println!("Document structure verified successfully");
    Ok(())
}
```

## 🧪 **Testing**

### Public Tests

Run the basic test suite:

```bash
cargo test -p core
```

### Private Tests

Run tests with sample PDFs:

```bash
cargo test -p core --features private_tests
```

## ⚠️ **Limitations**

### Supported Features

- ✅ Combined signature and text verification
- ✅ Exact position matching
- ✅ Multi-page document support
- ✅ Standard PDF structures
- ✅ Common font encodings

### Unsupported Features

- ❌ Regex-based text search
- ❌ Image or graphics verification
- ❌ Form field verification

## 🤝 **Contributing**

When contributing to the core crate:

- Keep dependencies minimal
- Ensure ZK-VM compatibility
- Add tests for new verification patterns
- Document any breaking changes
- Maintain performance for simple PDFs

## 📄 **License**

This crate is licensed under the same terms as the parent repository.
