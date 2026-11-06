#!/usr/bin/env bash
# ==============================================================================
# PactRoom Complete System & Port Cleanup Script for Ubuntu
# ==============================================================================
# Kills any orphan or zombie processes holding ports 3000, 3001, 3002,
# resets PM2 state, and clears Next.js build cache.
# ==============================================================================

echo "==> Stopping PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

echo "==> Terminating any orphan processes on ports 3000, 3001, 3002..."
for port in 3000 3001 3002; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k -9 "${port}/tcp" 2>/dev/null || true
  fi

  if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti ":${port}" 2>/dev/null || true)
    if [ -n "$PIDS" ]; then
      echo "Killing PID(s) $PIDS on port $port..."
      kill -9 $PIDS 2>/dev/null || true
    fi
  fi
done

echo "==> Clearing Next.js cache..."
rm -rf apps/pactroom-web/.next

echo "==> Checking ports 3000, 3001, 3002:"
if command -v ss >/dev/null 2>&1; then
  ss -tulpn | grep -E ':(3000|3001|3002) ' || echo "Ports 3000, 3001, 3002 are 100% clean and free!"
fi

echo "==> Cleanup complete. Run: bash deploy.sh"
