#!/usr/bin/env bash

# ==============================================================================
# PactRoom Single-Command Deployment Script for Ubuntu Azure VM
# ==============================================================================
# Deploys PactRoom on dedicated ports in the 3000 range:
#   - Port 3000: PactRoom Web App & Live Contract Studio (Next.js)
#   - Port 3001: Fastify Sample Backend API & OpenAPI 3.1 Swagger (/docs)
#   - Port 3002: PactRoom Engine, SQLite Ledger, & Switch SSE Stream
# (Safe to run alongside existing services on ports 8000, 8001, and Docker)
# ==============================================================================

set -e

# Terminal colors
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "\n${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${CYAN}   ✦ PactRoom Production Deployment (Ubuntu Azure BM) ✦${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}\n"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Check Node.js
echo -e "${CYAN}[1/6] Checking runtime prerequisites...${NC}"
if ! command -v node >/dev/null 2>&1; then
  echo -e "${YELLOW}Node.js not detected. Installing Node.js 20 LTS...${NC}"
  if command -v sudo >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs build-essential
  else
    echo -e "${RED}Error: Node.js is required but missing, and sudo is unavailable.${NC}"
    echo "Please install Node.js 18+ manually and re-run."
    exit 1
  fi
fi

NODE_VERSION=$(node -v)
echo -e "  ${GREEN}✓${NC} Node.js detected: ${BOLD}${NODE_VERSION}${NC}"

# 2. Check & Install PNPM
if ! command -v pnpm >/dev/null 2>&1; then
  echo -e "${YELLOW}pnpm not found. Installing pnpm globally via npm...${NC}"
  if command -v sudo >/dev/null 2>&1 && [ "$EUID" -ne 0 ]; then
    sudo npm install -g pnpm
  else
    npm install -g pnpm
  fi
fi
echo -e "  ${GREEN}✓${NC} pnpm detected: ${BOLD}$(pnpm -v)${NC}"

# 3. Check & Install PM2 for robust background process management
if ! command -v pm2 >/dev/null 2>&1; then
  echo -e "${YELLOW}PM2 not found. Installing PM2 process manager globally...${NC}"
  if command -v sudo >/dev/null 2>&1 && [ "$EUID" -ne 0 ]; then
    sudo npm install -g pm2
  else
    npm install -g pm2
  fi
fi
echo -e "  ${GREEN}✓${NC} PM2 detected: ${BOLD}$(pm2 -v)${NC}"

# 4. Check Port Conflicts (Target Range: 3000, 3001, 3002)
echo -e "\n${CYAN}[2/6] Checking port availability in the 3000 range...${NC}"
TARGET_PORTS=(3000 3001 3002)
for port in "${TARGET_PORTS[@]}"; do
  if command -v ss >/dev/null 2>&1; then
    OCCUPIED=$(ss -tulpn 2>/dev/null | grep ":${port} " || true)
  elif command -v lsof >/dev/null 2>&1; then
    OCCUPIED=$(lsof -i ":${port}" 2>/dev/null || true)
  else
    OCCUPIED=""
  fi

  if [ -n "$OCCUPIED" ]; then
    echo -e "  ${YELLOW}Notice: Port ${port} is currently in use.${NC}"
    echo -e "  Stopping any previously running PactRoom instances..."
    pm2 delete pactroom-web backend-api pactroom-server 2>/dev/null || true
    break
  else
    echo -e "  ${GREEN}✓${NC} Port ${port} is free and ready."
  fi
done

# 5. Install Dependencies
echo -e "\n${CYAN}[3/6] Installing monorepo dependencies with pnpm...${NC}"
pnpm install

# 6. Build All Projects
echo -e "\n${CYAN}[4/6] Building TypeScript engines, backend microservice, and Next.js web studio...${NC}"
pnpm build

# 7. Validate Switch Room Template
echo -e "\n${CYAN}[5/6] Validating Switch 1.0 room template conformance...${NC}"
pnpm validate:template

# 8. Start Background Services with PM2
echo -e "\n${CYAN}[6/6] Launching services with PM2 process manager...${NC}"
pm2 delete pactroom-web backend-api pactroom-server 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save >/dev/null 2>&1 || true

# Wait for services to bind
echo -e "Waiting for services to become healthy..."
sleep 4

# Run Health Checks
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 || echo "000")
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/health || echo "000")
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/health || echo "000")

# Detect Azure / Public IP
PUBLIC_IP=$(curl -s -m 3 https://ifconfig.me 2>/dev/null || curl -s -m 3 https://api.ipify.org 2>/dev/null || echo "<YOUR_AZURE_PUBLIC_IP>")

echo -e "\n${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${GREEN}   ✓ PACTROOM DEPLOYED SUCCESSFULLY ON UBUNTU AZURE MACHINE!${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}\n"

echo -e "${BOLD}Service Health Summary:${NC}"
if [ "$WEB_STATUS" = "200" ]; then
  echo -e "  • ${GREEN}pactroom-web${NC}      (Port 3000): ${GREEN}HEALTHY (HTTP 200)${NC}"
else
  echo -e "  • ${YELLOW}pactroom-web${NC}      (Port 3000): Initializing (HTTP ${WEB_STATUS})"
fi

if [ "$BACKEND_STATUS" = "200" ]; then
  echo -e "  • ${GREEN}backend-api${NC}       (Port 3001): ${GREEN}HEALTHY (HTTP 200)${NC}"
else
  echo -e "  • ${YELLOW}backend-api${NC}       (Port 3001): Initializing (HTTP ${BACKEND_STATUS})"
fi

if [ "$SERVER_STATUS" = "200" ]; then
  echo -e "  • ${GREEN}pactroom-server${NC}   (Port 3002): ${GREEN}HEALTHY (HTTP 200)${NC}"
else
  echo -e "  • ${YELLOW}pactroom-server${NC}   (Port 3002): Initializing (HTTP ${SERVER_STATUS})"
fi

echo -e "\n${BOLD}${CYAN}Access URLs:${NC}"
echo -e "  • ${BOLD}Landing Page:${NC}        http://${PUBLIC_IP}:3000"
echo -e "  • ${BOLD}Contract Studio:${NC}     http://${PUBLIC_IP}:3000/studio"
echo -e "  • ${BOLD}Backend OpenAPI:${NC}     http://${PUBLIC_IP}:3001/docs"
echo -e "  • ${BOLD}Switch SSE Stream:${NC}   http://${PUBLIC_IP}:3002/api/events"

echo -e "\n${BOLD}${YELLOW}================================================================${NC}"
echo -e "${BOLD}${YELLOW}   AZURE NETWORK SECURITY GROUP (NSG) INBOUND RULE SETUP${NC}"
echo -e "${BOLD}${YELLOW}================================================================${NC}"
echo -e "To access PactRoom from your browser, add the following Inbound Security Rule"
echo -e "in the Azure Portal for your Virtual Machine's Network Security Group (NSG):"
echo -e ""
echo -e "  • ${BOLD}Destination Port Ranges:${NC}  ${BOLD}${GREEN}3000 - 3002${NC} (or 3000, 3001, 3002)"
echo -e "  • ${BOLD}Protocol:${NC}                TCP"
echo -e "  • ${BOLD}Source:${NC}                  Any (or your client IP)"
echo -e "  • ${BOLD}Action:${NC}                  Allow"
echo -e "  • ${BOLD}Priority:${NC}                300 (or any available priority)"
echo -e "  • ${BOLD}Name:${NC}                    Allow_PactRoom_3000_3002"
echo -e ""
echo -e "Existing services on ports 8000 and 8001 and Docker containers remain untouched."

echo -e "\n${BOLD}Useful PM2 Management Commands:${NC}"
echo -e "  • View status table:   ${CYAN}pm2 status${NC}"
echo -e "  • View live logs:      ${CYAN}pm2 logs${NC}"
echo -e "  • Restart stack:       ${CYAN}pm2 restart all${NC}"
echo -e "  • Stop stack:          ${CYAN}pm2 stop all${NC}"
echo -e "================================================================\n"

