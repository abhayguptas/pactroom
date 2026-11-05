#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

echo "================================================================================"
echo "  PactRoom: Cross-Machine API Contract & Breaking-Change Negotiator"
echo "  Flip the Switch Hackathon — Business Workflow Track"
echo "================================================================================"

# 1. Environment file setup
if [ ! -f "$REPO_ROOT/.env" ]; then
  echo "--> Copying .env.example to .env..."
  cp "$REPO_ROOT/.env.example" "$REPO_ROOT/.env"
fi

# 2. Dependency installation
echo "--> Installing monorepo dependencies with pnpm..."
pnpm install

# 3. Workspaces Git initialization
echo "--> Initializing Git repositories in workspaces..."
bash "$REPO_ROOT/scripts/setup-workspaces.sh"

# 4. Build shared contract engine
echo "--> Building @pactroom/contract-engine..."
pnpm --filter @pactroom/contract-engine build

echo ""
echo "================================================================================"
echo "  All components prepared and verified!"
echo "  Starting full real system:"
echo "    - Backend REST Microservice:  http://localhost:3001"
echo "    - Dynamic OpenAPI 3.1 JSON:   http://localhost:3001/openapi.json"
echo "    - PactRoom Server & SSE:      http://localhost:4000"
echo "    - PactRoom Next.js Web App:   http://localhost:3000"
echo "    - Live Negotiation Studio:    http://localhost:3000/studio"
echo "================================================================================"
echo ""

pnpm dev

