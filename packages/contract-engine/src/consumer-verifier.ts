import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ts from 'typescript';
import {
  CompilerDiagnostic,
  ConsumerReferenceLocation,
  ConsumerScanResult,
  OpenApiSchemaObject,
  TypeVerificationResult
} from './types.js';

/**
 * Scans a TypeScript source file for consumer artifacts:
 * Interfaces, type aliases, Zod schemas, React components, hooks, and property accesses
 */
export function scanSourceFileForConsumerArtifacts(
  sourceCode: string,
  filePath: string,
  targetField: string
): ConsumerReferenceLocation[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const locations: ConsumerReferenceLocation[] = [];

  function record(node: ts.Node, kind: ConsumerReferenceLocation['kind'], identifier: string) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const startPos = sourceFile.getPositionOfLineAndCharacter(line, 0);
    const endPos = sourceFile.getLineEndOfPosition(node.getStart());
    const contextSnippet = sourceCode.substring(startPos, endPos).trim();

    locations.push({
      filePath,
      line: line + 1,
      column: character + 1,
      kind,
      identifier,
      contextSnippet
    });
  }

  function visit(node: ts.Node) {
    // 1. Interface Declaration
    if (ts.isInterfaceDeclaration(node)) {
      for (const member of node.members) {
        if (ts.isPropertySignature(member)) {
          const name = member.name.getText(sourceFile).replace(/['"]/g, '');
          if (name === targetField) {
            record(member, 'interface', `${node.name.text}.${name}`);
          }
        }
      }
    }

    // 2. Type Alias
    if (ts.isTypeAliasDeclaration(node)) {
      if (node.getText(sourceFile).includes(targetField)) {
        record(node, 'type_alias', node.name.text);
      }
    }

    // 3. Property Assignment in Zod or Object
    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(sourceFile).replace(/['"]/g, '');
      if (name === targetField) {
        const isZod = node.parent?.getText(sourceFile).includes('z.');
        record(node, isZod ? 'zod_schema' : 'property_access', name);
      }
    }

    // 4. Property access: order.total_amount
    if (ts.isPropertyAccessExpression(node)) {
      if (node.name.text === targetField) {
        record(node, 'property_access', node.getText(sourceFile));
      }
    }

    // 5. React Component Function/Hook
    if (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) {
      const name = node.name ? node.name.getText(sourceFile) : 'Anonymous';
      const isHook = name.startsWith('use');
      const text = node.getText(sourceFile);

      if (text.includes(targetField)) {
        // Check if returns JSX or is hook
        if (isHook) {
          record(node, 'hook', name);
        } else if (text.includes('return') && (text.includes('</') || text.includes('/>') || text.includes('React.createElement'))) {
          record(node, 'react_component', name);
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return locations;
}

/**
 * Recursively scans all TypeScript files in frontend workspace to find all references to an endpoint or field
 */
export function scanFrontendConsumerWorkspace(
  frontendWorkspacePath: string,
  targetField: string,
  endpointPath?: string
): ConsumerScanResult {
  const srcDir = path.resolve(frontendWorkspacePath, 'src');
  const allLocations: ConsumerReferenceLocation[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const code = fs.readFileSync(fullPath, 'utf-8');
        if (code.includes(targetField) || (endpointPath && code.includes(endpointPath))) {
          const refs = scanSourceFileForConsumerArtifacts(code, fullPath, targetField);
          allLocations.push(...refs);
        }
      }
    }
  }

  walk(srcDir);

  return {
    targetField,
    endpointPath,
    totalReferences: allLocations.length,
    interfaces: allLocations.filter((l) => l.kind === 'interface'),
    zodSchemas: allLocations.filter((l) => l.kind === 'zod_schema'),
    hooks: allLocations.filter((l) => l.kind === 'hook'),
    components: allLocations.filter((l) => l.kind === 'react_component'),
    calls: allLocations.filter((l) => l.kind === 'property_access' || l.kind === 'fetch_call')
  };
}

/**
 * Parses real `tsc --noEmit` stdout/stderr output into structured compiler diagnostics
 * Matches: path/to/file.ts(line,col): error TSxxxx: Message
 */
export function parseTscDiagnostics(tscOutput: string): CompilerDiagnostic[] {
  const diagnostics: CompilerDiagnostic[] = [];
  const lines = tscOutput.split('\n');
  const regex = /^(.+)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.+)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(regex);
    if (match) {
      diagnostics.push({
        fileName: match[1].trim(),
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4].trim(),
        message: match[5].trim(),
        raw: trimmed
      });
    }
  }

  return diagnostics;
}

/**
 * Generates a temporary TypeScript contract fixture from the backend uncommitted schema,
 * writes it to the frontend consumer workspace, executes real `tsc --noEmit` and `vitest run`,
 * and parses real stdout/stderr diagnostics.
 */
export async function runFrontendContractVerification(
  frontendWorkspacePath: string,
  candidateSchema: OpenApiSchemaObject,
  options: {
    runVitest?: boolean;
    fixtureFileName?: string;
  } = {}
): Promise<TypeVerificationResult> {
  const startTime = Date.now();
  const fixtureName = options.fixtureFileName || `__pactroom_fixture_${Date.now()}.tmp.ts`;
  const fixturePath = path.resolve(frontendWorkspacePath, 'src', fixtureName);

  // Generate real TypeScript contract fixture code testing uncommitted schema
  const properties = candidateSchema.properties || {};
  const requiredFields = candidateSchema.required || [];

  const propDefinitions = Object.entries(properties)
    .map(([key, val]) => {
      let tsType = 'string';
      if (val.type === 'number' || val.type === 'integer') tsType = 'number';
      else if (val.type === 'boolean') tsType = 'boolean';
      else if (val.type === 'array') tsType = 'unknown[]';
      else if (val.type === 'object') tsType = 'Record<string, unknown>';

      const isReq = requiredFields.includes(key);
      return `  ${key}${isReq ? '' : '?'}: ${tsType};`;
    })
    .join('\n');

  const isV1Contract =
    candidateSchema.properties?.['total_amount_cents'] !== undefined ||
    candidateSchema.properties?.['pricing_breakdown'] !== undefined;

  const importStatement = isV1Contract
    ? `import { OrderResponseSchema } from './schemas/orders.js';`
    : `import { OrderSchema } from './schemas/orders.js';`;

  const fixtureCode = `// Autogenerated PactRoom contract verification fixture
${importStatement}

export interface UncommittedCandidateContract {
${propDefinitions}
}

// Compile-time static contract verification
export function verifyConsumerStaticTypes(candidate: UncommittedCandidateContract) {
  // Consumer CheckoutSummary and useOrderHistory strictly require total_amount_cents or total_amount
  ${
    isV1Contract
      ? 'const cents: number = candidate.total_amount_cents;\n  return cents;'
      : 'const total: number = candidate.total_amount;\n  return total;'
  }
}

// Runtime contract validation
export function assertContractCompatibility(candidate: UncommittedCandidateContract) {
  ${
    isV1Contract
      ? 'return OrderResponseSchema.parse(candidate);'
      : 'return OrderSchema.parse(candidate);'
  }
}
`;

  // Write temporary fixture
  fs.writeFileSync(fixturePath, fixtureCode, 'utf-8');

  let tscOutput = '';
  let tscExitCode = 0;
  let vitestOutput = '';
  let vitestExitCode = 0;
  const testFailures: string[] = [];

  try {
    // 1. Run real tsc --noEmit
    tscExitCode = await new Promise<number>((resolve) => {
      const child = spawn('npx', ['tsc', '--noEmit'], {
        cwd: frontendWorkspacePath,
        shell: true,
        env: { ...process.env, CI: 'true', FORCE_COLOR: '0' }
      });

      child.stdout.on('data', (d) => (tscOutput += d.toString()));
      child.stderr.on('data', (d) => (tscOutput += d.toString()));
      child.on('close', (code) => resolve(code ?? 0));
      child.on('error', () => resolve(1));
    });

    // 2. Optionally run real Vitest suite
    if (options.runVitest !== false) {
      vitestExitCode = await new Promise<number>((resolve) => {
        const child = spawn('npx', ['vitest', 'run'], {
          cwd: frontendWorkspacePath,
          shell: true,
          env: { ...process.env, CI: 'true', FORCE_COLOR: '0' }
        });

        child.stdout.on('data', (d) => (vitestOutput += d.toString()));
        child.stderr.on('data', (d) => (vitestOutput += d.toString()));
        child.on('close', (code) => resolve(code ?? 0));
        child.on('error', () => resolve(1));
      });

      // Parse Vitest failures
      const failMatches = vitestOutput.match(/FAIL\s+(.+)$/gm);
      if (failMatches) {
        testFailures.push(...failMatches);
      }
    }
  } finally {
    // Clean up temporary fixture
    if (fs.existsSync(fixturePath)) {
      try {
        fs.unlinkSync(fixturePath);
      } catch (err) {}
    }
  }

  const diagnostics = parseTscDiagnostics(tscOutput);
  const passed = tscExitCode === 0 && vitestExitCode === 0;

  return {
    passed,
    tscExitCode,
    vitestExitCode,
    diagnostics,
    testFailures,
    stdout: tscOutput + '\n' + vitestOutput,
    stderr: '',
    durationMs: Date.now() - startTime,
    temporaryFixturePath: fixturePath
  };
}

