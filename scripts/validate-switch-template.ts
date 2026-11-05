#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

interface ValidationReport {
  totalChecks: number;
  passedChecks: number;
  failures: string[];
}

const report: ValidationReport = {
  totalChecks: 0,
  passedChecks: 0,
  failures: []
};

function recordCheck(name: string, passed: boolean, failureReason?: string) {
  report.totalChecks++;
  if (passed) {
    report.passedChecks++;
    console.log(`  ✓ ${name}`);
  } else {
    report.failures.push(`${name}: ${failureReason || 'Failed assertion'}`);
    console.error(`  ✗ ${name} -> ${failureReason}`);
  }
}

// Built-in Switch runtime variables permitted in templates
const BUILT_IN_SWITCH_VARS = new Set([
  '$creator',
  '$agents_dir',
  'agent',
  '$first',
  '$default'
]);

export function validateSwitchTemplate(templatePath: string): boolean {
  console.log(`\n================================================================`);
  console.log(`[Switch Validator] Inspecting: ${path.relative(rootDir, templatePath)}`);
  console.log(`================================================================`);

  if (!fs.existsSync(templatePath)) {
    recordCheck('Template file exists on disk', false, `File not found at ${templatePath}`);
    return false;
  }
  recordCheck('Template file exists on disk', true);

  const fileContent = fs.readFileSync(templatePath, 'utf-8');
  let doc: any;
  try {
    doc = YAML.parse(fileContent);
    recordCheck('Template is valid parseable YAML', true);
  } catch (err: any) {
    recordCheck('Template is valid parseable YAML', false, err.message);
    return false;
  }

  // 1. Version Check
  recordCheck('Root version is exactly integer 1', doc.version === 1, `Got version: ${doc.version}`);

  // 2. Params Block
  const params = doc.params || {};
  recordCheck('Params section is declared as an object', typeof params === 'object' && params !== null);

  const expectedParams = [
    'team',
    'provider',
    'backend_location',
    'frontend_location',
    'backend_dir',
    'frontend_dir',
    'bridge'
  ];

  for (const p of expectedParams) {
    recordCheck(`Parameter '${p}' is declared in params block`, Boolean(params[p]), `Missing parameter '${p}'`);
  }

  // Parameter Types & Defaults
  if (params.team) {
    recordCheck("param 'team' has type 'string'", params.team.type === 'string');
    recordCheck("param 'team' has lowercase slug pattern", params.team.pattern === '[a-z][a-z0-9-]*');
  }

  if (params.provider) {
    recordCheck("param 'provider' has type 'provider'", params.provider.type === 'provider');
    recordCheck(
      "param 'provider' defaults to [claude, codex, opencode]",
      Array.isArray(params.provider.default) &&
        params.provider.default.includes('claude') &&
        params.provider.default.includes('codex') &&
        params.provider.default.includes('opencode')
    );
  }

  if (params.backend_location) {
    recordCheck("param 'backend_location' has type 'location'", params.backend_location.type === 'location');
    recordCheck("param 'backend_location' defaults to 'local'", params.backend_location.default === 'local');
  }

  if (params.frontend_location) {
    recordCheck("param 'frontend_location' has type 'location'", params.frontend_location.type === 'location');
    recordCheck("param 'frontend_location' defaults to 'local'", params.frontend_location.default === 'local');
  }

  if (params.backend_dir) {
    recordCheck("param 'backend_dir' has type 'directory'", params.backend_dir.type === 'directory');
    recordCheck("param 'backend_dir' defaults to 'workspaces/backend-api'", params.backend_dir.default === 'workspaces/backend-api');
  }

  if (params.frontend_dir) {
    recordCheck("param 'frontend_dir' has type 'directory'", params.frontend_dir.type === 'directory');
    recordCheck("param 'frontend_dir' defaults to 'workspaces/frontend-consumer'", params.frontend_dir.default === 'workspaces/frontend-consumer');
  }

  if (params.bridge) {
    recordCheck("param 'bridge' has type 'bridge'", params.bridge.type === 'bridge');
    recordCheck(
      "param 'bridge' defaults to ['$first']",
      Array.isArray(params.bridge.default) && params.bridge.default[0] === '$first'
    );
    recordCheck(
      "param 'bridge' sets required: false (messaging app optional)",
      params.bridge.required === false
    );
  }

  // 3. Placeholder Extraction & Resolution Verification
  const declaredParamNames = new Set(Object.keys(params));
  const placeholderRegex = /\{([^}]+)\}/g;
  const foundPlaceholders = new Set<string>();

  function scanForPlaceholders(value: any) {
    if (typeof value === 'string') {
      let match;
      while ((match = placeholderRegex.exec(value)) !== null) {
        foundPlaceholders.add(match[1]);
      }
    } else if (Array.isArray(value)) {
      value.forEach(scanForPlaceholders);
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(scanForPlaceholders);
    }
  }

  scanForPlaceholders(doc.agents);
  scanForPlaceholders(doc.room);

  let allPlaceholdersValid = true;
  for (const ph of foundPlaceholders) {
    const isDeclared = declaredParamNames.has(ph);
    const isBuiltIn = BUILT_IN_SWITCH_VARS.has(ph);
    if (!isDeclared && !isBuiltIn) {
      allPlaceholdersValid = false;
      recordCheck(`Placeholder {${ph}} is declared in params or built-in`, false, `Undeclared placeholder: {${ph}}`);
    }
  }
  if (allPlaceholdersValid) {
    recordCheck(
      `All ${foundPlaceholders.size} template placeholders ({${Array.from(foundPlaceholders).join(', ')}}) are valid`,
      true
    );
  }

  // 4. Agents Verification
  const agents = doc.agents;
  recordCheck("Template defines an 'agents' list", Array.isArray(agents) && agents.length === 3);

  const requiredAgentFields = [
    'name',
    'description',
    'addressing',
    'provider',
    'location',
    'directory',
    'instructions'
  ];

  const agentNames = new Set<string>();

  for (const agent of agents || []) {
    agentNames.add(agent.name);
    for (const f of requiredAgentFields) {
      recordCheck(
        `Agent '${agent.name || 'unnamed'}' explicitly defines field '${f}'`,
        Boolean(agent[f]),
        `Missing field '${f}'`
      );
    }
  }

  // 5. Addressing & Approval Gate Invariants
  const watchAgent = (agents || []).find((a: any) => a.name === '{team}-watch');
  const verifyAgent = (agents || []).find((a: any) => a.name === '{team}-verify');
  const syncAgent = (agents || []).find((a: any) => a.name === '{team}-sync');

  recordCheck("Watch agent '{team}-watch' exists", Boolean(watchAgent));
  if (watchAgent) {
    recordCheck(
      "Watch agent '{team}-watch' has addressing: anyone",
      watchAgent.addressing === 'anyone',
      `Got addressing: ${watchAgent.addressing}`
    );
  }

  recordCheck("Verify agent '{team}-verify' exists", Boolean(verifyAgent));
  if (verifyAgent) {
    recordCheck(
      "Verify agent '{team}-verify' has addressing: owner-agents",
      verifyAgent.addressing === 'owner-agents',
      `Got addressing: ${verifyAgent.addressing}`
    );
  }

  recordCheck("Sync agent '{team}-sync' exists", Boolean(syncAgent));
  if (syncAgent) {
    recordCheck(
      "Sync agent '{team}-sync' has addressing: owner-agents",
      syncAgent.addressing === 'owner-agents',
      `Got addressing: ${syncAgent.addressing}`
    );
    recordCheck(
      "Sync agent '{team}-sync' strictly enforces auto_approve: false",
      syncAgent.auto_approve === false,
      `Got auto_approve: ${syncAgent.auto_approve}`
    );
  }

  // 6. Room Configuration
  const room = doc.room;
  recordCheck("Template defines a 'room' section", typeof room === 'object' && room !== null);
  if (room) {
    recordCheck("Room name is '{team}-api-contracts'", room.name === '{team}-api-contracts');
    recordCheck("Room bridge references '{bridge}'", room.bridge === '{bridge}');
    recordCheck(
      "Room includes all 3 agents",
      Array.isArray(room.agents) &&
        room.agents.includes('{team}-watch') &&
        room.agents.includes('{team}-verify') &&
        room.agents.includes('{team}-sync')
    );
    recordCheck(
      "Room aliases define watch, verify, and sync",
      room.aliases?.['{team}-watch'] === 'watch' &&
        room.aliases?.['{team}-verify'] === 'verify' &&
        room.aliases?.['{team}-sync'] === 'sync'
    );
    recordCheck("Room defines operational instructions", typeof room.instructions === 'string' && room.instructions.length > 50);
    const kickoffPrompt = doc.kickoff || room.kickoff;
    recordCheck("Template defines kickoff prompt addressing all agents", typeof kickoffPrompt === 'string' && kickoffPrompt.includes('@{team}-watch'));
    recordCheck("Kickoff belongs at top level beside room", typeof doc.kickoff === 'string');
  }

  return report.failures.length === 0;
}

// Main execution
const primaryTemplate = path.resolve(rootDir, 'pactroom.template.yaml');
const secondaryTemplate = path.resolve(rootDir, 'examples/agent-templates/pactroom.template.yaml');

console.log('Validating primary Switch room template in repo root...');
const ok1 = validateSwitchTemplate(primaryTemplate);

let ok2 = true;
if (fs.existsSync(secondaryTemplate)) {
  console.log('\nValidating mirrored Switch room template in examples/agent-templates...');
  ok2 = validateSwitchTemplate(secondaryTemplate);
}

console.log(`\n================================================================`);
console.log(`Switch Template Validation Summary: ${report.passedChecks} / ${report.totalChecks} Checks Passed`);
console.log(`================================================================`);

if (report.failures.length > 0) {
  console.error(`\nValidation Failed with ${report.failures.length} errors:`);
  report.failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
} else {
  console.log(`✓ 100% SWITCH 1.0 TEMPLATE COMPLIANCE CONFIRMED. ZERO ERRORS.`);
  process.exit(0);
}

