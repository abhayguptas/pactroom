import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const rootDir = path.resolve(__dirname, '../../../');

export interface ResolvedWorkspaces {
  backend: string;
  frontend: string;
  backendDir: string;
  frontendDir: string;
  backendSchemasDir: string;
}

export function getDiscoveredWorkspaces(): ResolvedWorkspaces {
  if (process.env.NODE_ENV === 'test') {
    const backend = 'workspaces/backend-api';
    const frontend = 'workspaces/frontend-consumer';
    const backendDir = path.resolve(rootDir, backend);
    const frontendDir = path.resolve(rootDir, frontend);
    return {
      backend,
      frontend,
      backendDir,
      frontendDir,
      backendSchemasDir: path.resolve(backendDir, 'src/schemas')
    };
  }

  let be = process.env.BACKEND_WORKSPACE || process.env.BACKEND_DIR;
  let fe = process.env.FRONTEND_WORKSPACE || process.env.FRONTEND_DIR;

  const isDefaultOrRelativeBe = !be || be === 'workspaces/backend-api' || be.includes('workspaces/backend-api');
  const isDefaultOrRelativeFe = !fe || fe === 'workspaces/frontend-consumer' || fe.includes('workspaces/frontend-consumer');

  if (isDefaultOrRelativeBe || isDefaultOrRelativeFe) {
    try {
      if (isDefaultOrRelativeBe) {
        const foundBe = execSync(
          `PGPASSWORD=gcUuJleU2slnHIxlKIPzXpOD73xmuGZ3 psql -h 127.0.0.1 -p 60016 -U postgres -d switch -t -A -c "SELECT definition->>'directory' FROM agent_definitions WHERE definition->>'directory' LIKE '%backend%' ORDER BY updated_at DESC LIMIT 1;"`,
          { timeout: 1500, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
        ).trim();
        if (foundBe && fs.existsSync(foundBe)) {
          be = foundBe;
          process.env.BACKEND_WORKSPACE = be;
          process.env.BACKEND_DIR = be;
        }
      }
      if (isDefaultOrRelativeFe) {
        const foundFe = execSync(
          `PGPASSWORD=gcUuJleU2slnHIxlKIPzXpOD73xmuGZ3 psql -h 127.0.0.1 -p 60016 -U postgres -d switch -t -A -c "SELECT definition->>'directory' FROM agent_definitions WHERE definition->>'directory' LIKE '%frontend%' ORDER BY updated_at DESC LIMIT 1;"`,
          { timeout: 1500, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
        ).trim();
        if (foundFe && fs.existsSync(foundFe)) {
          fe = foundFe;
          process.env.FRONTEND_WORKSPACE = fe;
          process.env.FRONTEND_DIR = fe;
        }
      }
    } catch {}
  }

  const backend = be || 'workspaces/backend-api';
  const frontend = fe || 'workspaces/frontend-consumer';
  const backendDir = path.isAbsolute(backend) ? backend : path.resolve(rootDir, backend);
  const frontendDir = path.isAbsolute(frontend) ? frontend : path.resolve(rootDir, frontend);

  return {
    backend,
    frontend,
    backendDir,
    frontendDir,
    backendSchemasDir: path.resolve(backendDir, 'src/schemas')
  };
}

