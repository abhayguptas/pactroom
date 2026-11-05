#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Setting up real Git repositories in workspaces..."

# 1. Setup workspaces/backend-api git repository
BACKEND_DIR="$REPO_ROOT/workspaces/backend-api"
if [ ! -d "$BACKEND_DIR/.git" ]; then
  echo "--> Initializing Git repo in $BACKEND_DIR"
  cd "$BACKEND_DIR"
  git init -b main
  git config user.name "Backend Coding Agent"
  git config user.email "backend.agent@pactroom.dev"
  git add .
  git commit -m "feat(api): initial stable v1 REST endpoints with live OpenAPI 3.1"
  
  # Create candidate branch demonstrating breaking changes
  git checkout -b feature/v2-orders-refactor
  git checkout main
else
  echo "--> Git repo already exists in $BACKEND_DIR"
fi

# 2. Setup workspaces/frontend-consumer git repository
FRONTEND_DIR="$REPO_ROOT/workspaces/frontend-consumer"
if [ ! -d "$FRONTEND_DIR/.git" ]; then
  echo "--> Initializing Git repo in $FRONTEND_DIR"
  cd "$FRONTEND_DIR"
  git init -b main
  git config user.name "Frontend Consumer Agent"
  git config user.email "frontend.agent@pactroom.dev"
  git add .
  git commit -m "feat(consumer): strict React hooks and Zod response validation for v1 contract"
else
  echo "--> Git repo already exists in $FRONTEND_DIR"
fi

echo "==> Workspaces initialized successfully with real Git repositories."

