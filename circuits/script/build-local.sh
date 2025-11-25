#!/bin/bash
# Build script for local CPU proving mode
# Run this in Ubuntu/WSL: bash build-local.sh

set -e

echo "🔧 Building prover server with local CPU proving mode..."
echo ""

# Verify .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one for local mode..."
    cat > .env << 'EOF'
# Local CPU proving - no network required
RUST_LOG=info
PORT=3001
# Don't set SP1_PROVER or NETWORK_PRIVATE_KEY - using local CPU mode
EOF
    echo "✅ Created .env file"
fi

# Verify .env doesn't have network settings
if grep -q "SP1_PROVER=network" .env 2>/dev/null; then
    echo "⚠️  Warning: .env contains SP1_PROVER=network"
    echo "   This will use network mode. For local mode, remove that line."
fi

echo ""
echo "📦 Building prover server..."
echo "   This may take 10-30 minutes on first build"
echo ""

# Build the prover
cargo run --release --bin prover

