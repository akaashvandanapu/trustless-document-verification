import { NextRequest, NextResponse } from "next/server";

const PROVER_URL = process.env.PROVER_URL || "http://localhost:3002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("📥 [API] Received verify request, proxying to prover...");
    
    const response = await fetch(`${PROVER_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API] Prover error:", errorText);
      return NextResponse.json(
        { error: `Prover error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ [API] Proof verified successfully");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("❌ [API] Error proxying to prover:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify proof" },
      { status: 500 }
    );
  }
}

