import assert from 'node:assert';

const SERVER_URL = 'http://localhost:3002';
const BACKEND_URL = 'http://localhost:3001';

interface TestResult {
  group: string;
  name: string;
  route: string;
  method: string;
  status: number;
  durationMs: number;
  passed: boolean;
  details: string;
  responsePreview?: any;
}

const results: TestResult[] = [];

async function testRoute(
  group: string,
  name: string,
  url: string,
  method: 'GET' | 'POST',
  body?: any,
  validator?: (data: any, status: number) => void,
  retries = 3
): Promise<any> {
  const start = Date.now();
  let status = 0;
  let data: any = null;
  let passed = true;
  let details = 'OK';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });

      status = res.status;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (validator) {
        validator(data, status);
      } else {
        assert(status >= 200 && status < 300, `Expected 2xx status, got ${status}`);
      }
      passed = true;
      details = 'OK';
      break;
    } catch (err: any) {
      passed = false;
      details = err.message || String(err);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  const durationMs = Date.now() - start;
  const routePath = url.replace(SERVER_URL, '').replace(BACKEND_URL, '');

  const result: TestResult = {
    group,
    name,
    route: routePath,
    method,
    status,
    durationMs,
    passed,
    details,
    responsePreview: typeof data === 'object' ? data : String(data).slice(0, 100)
  };

  results.push(result);

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${group}] ${method} ${routePath} - ${name} (${durationMs}ms) [HTTP ${status}]`);
  if (!passed) {
    console.error(`   Error details: ${details}`);
  }

  return data;
}

async function runDeepAudit() {
  console.log('\n================================================================');
  console.log('🚀 PACTROOM DEEP ROUTE & BUTTON INTERACTIVE AUDIT');
  console.log(`   PactRoom Server: ${SERVER_URL}`);
  console.log(`   Backend Microservice: ${BACKEND_URL}`);
  console.log('================================================================\n');

  // ==========================================================================
  // GROUP 1: Health & System State (Clean Baseline)
  // ==========================================================================
  console.log('--- GROUP 1: Health & System State (Clean Baseline) ---');

  await testRoute('System', 'Server Status & Workspaces', `${SERVER_URL}/api/status`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.status, 'operational');
    assert(data.workspaces?.backend?.path, 'Missing backend workspace path');
    assert(data.workspaces?.frontend?.path, 'Missing frontend workspace path');
  });

  await testRoute('System', 'List Switch Rooms', `${SERVER_URL}/api/rooms`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(Array.isArray(data.rooms), 'Expected rooms array');
    assert(data.rooms.length > 0, 'Rooms list is empty');
  });

  await testRoute('System', 'Get Specific Switch Room', `${SERVER_URL}/api/rooms/room-pactflow-api-contracts`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.room?.id, 'room-pactflow-api-contracts');
  });

  // Ensure clean baseline before proceeding
  await testRoute('Lifecycle', 'Reset Baseline (Button: Reset Baseline)', `${SERVER_URL}/api/backend/reset`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.reset, true);
    assert.strictEqual(data.negotiation?.status, 'RESOLVED');
  });

  await testRoute('Machine A', 'Git Status Baseline (Button: Refresh Git)', `${SERVER_URL}/api/backend/git`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.isDirty, false, 'Expected clean working tree on baseline');
    assert.strictEqual(data.diff, '', 'Expected empty diff on baseline');
  });

  await testRoute('Machine A', 'Read Schema (Panel 1: Live Schema Editor)', `${SERVER_URL}/api/backend/schema`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(data.schemaSource.includes('OrderResponseSchema'), 'Missing OrderResponseSchema');
    assert(data.schemaSource.includes('total_amount_cents'), 'Baseline must contain total_amount_cents');
  });

  await testRoute('Machine B', 'Diagnostics Baseline (Panel 3: Subprocess Status)', `${SERVER_URL}/api/frontend/diagnostics`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.breakages.length, 0, 'Baseline must have 0 breakages');
    assert.strictEqual(data.tsc?.passed, true, 'tsc must pass on clean baseline');
    assert.strictEqual(data.vitest?.passed, true, 'vitest must pass on clean baseline');
  });

  // ==========================================================================
  // GROUP 2: Switch Room Commands (UI Quick Command Pills)
  // ==========================================================================
  console.log('\n--- GROUP 2: Switch Room Commands (UI Quick Pills) ---');

  await testRoute('Switch Commands', 'Command: !list-agents (Quick Pill)', `${SERVER_URL}/api/switch/command`, 'POST', { command: '!list-agents' }, (data, status) => {
    assert.strictEqual(status, 200);
    assert(data.output.includes('pactflow-watch'), 'Missing pactflow-watch');
    assert(data.output.includes('pactflow-verify'), 'Missing pactflow-verify');
    assert(data.output.includes('pactflow-sync'), 'Missing pactflow-sync');
  });

  await testRoute('Switch Commands', 'Command: !roles (Quick Pill)', `${SERVER_URL}/api/switch/command`, 'POST', { command: '!roles' }, (data, status) => {
    assert.strictEqual(status, 200);
    const lower = data.output.toLowerCase();
    assert(lower.includes('inspector'), 'Missing inspector role');
    assert(lower.includes('validator'), 'Missing validator role');
    assert(lower.includes('arbitrator'), 'Missing arbitrator role');
  });

  await testRoute('Switch Commands', 'Command: !list-documents (Quick Pill)', `${SERVER_URL}/api/switch/command`, 'POST', { command: '!list-documents' }, (data, status) => {
    assert.strictEqual(status, 200);
    assert(data.output.includes('OpenAPI 3.1 Live Spec'), 'Missing OpenAPI live spec mention');
    assert(data.output.includes('pactroom.template.yaml'), 'Missing Switch template mention');
  });

  // ==========================================================================
  // GROUP 3: Introduce Breaking Change & Cascading Multi-Agent Flow
  // ==========================================================================
  console.log('\n--- GROUP 3: Mutate Breaking Change (Header & Panel 1 Buttons) ---');

  const mutateRes = await testRoute('Mutation', 'Mutate DTO (Button: Introduce Breaking Change)', `${SERVER_URL}/api/backend/mutate`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.mutated, true);
    assert.strictEqual(data.diffResult?.hasBreakingChanges, true, 'Must detect breaking change');
    assert.strictEqual(data.diffResult?.breakingCount, 1, 'Must detect exactly 1 breaking change');
    assert.strictEqual(data.negotiation?.status, 'AWAITING_HUMAN_DECISION', 'Must pause at Human Gate');
  });

  await testRoute('Machine A', 'Git Status Dirty (Badge: DIRTY)', `${SERVER_URL}/api/backend/git`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.isDirty, true, 'Must report isDirty = true after mutation');
    assert(data.diff.includes('pricing_breakdown'), 'Diff must show pricing_breakdown addition');
  });

  await testRoute('Machine B', 'Consumer Breakages (Panel 3: FAILED Diagnostics)', `${SERVER_URL}/api/frontend/diagnostics`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(data.breakages.length > 0, 'Must contain compiler breakages');
    const b0 = data.breakages[0];
    assert.strictEqual(b0.file_path, 'src/components/CheckoutSummary.tsx', 'Must map to CheckoutSummary.tsx');
    assert.strictEqual(b0.line_number, 19, 'Must map to line 19');
    assert(b0.code_snippet.includes('total_amount_cents'), 'Snippet must mention total_amount_cents');
  });

  await testRoute('Machine B', 'Breakages Table Query', `${SERVER_URL}/api/breakages`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(Array.isArray(data.breakages));
    assert(data.breakages.length > 0);
  });

  // ==========================================================================
  // GROUP 4: Direct Switch Mentions & Agent Triggers
  // ==========================================================================
  console.log('\n--- GROUP 4: Agent Mentions & Chat Messages ---');

  await testRoute('Agents', 'Mention @pact-watch (Quick Pill: @pact-watch)', `${SERVER_URL}/api/switch/message`, 'POST', {
    content: '@pact-watch inspect dirty working tree',
    senderName: 'Lead Engineer',
    senderId: 'human-user'
  }, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });

  await testRoute('Agents', 'Mention @pact-verify (Quick Pill: @pact-verify)', `${SERVER_URL}/api/switch/message`, 'POST', {
    content: '@pact-verify validate candidate schema',
    senderName: 'Lead Engineer',
    senderId: 'human-user'
  }, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });

  await testRoute('Agents', 'Mention @pact-sync (Quick Pill: @pact-sync)', `${SERVER_URL}/api/switch/message`, 'POST', {
    content: '@pact-sync synthesize resolution',
    senderName: 'Lead Engineer',
    senderId: 'human-user'
  }, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });

  await testRoute('Agents', 'Direct POST /api/scan', `${SERVER_URL}/api/scan`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.diffResult?.hasBreakingChanges, true);
  });

  await testRoute('Agents', 'Direct POST /api/verify', `${SERVER_URL}/api/verify`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.result?.passed, false);
  });

  await testRoute('Agents', 'Direct POST /api/negotiate', `${SERVER_URL}/api/negotiate`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.negotiation?.status, 'AWAITING_HUMAN_DECISION');
  });

  // ==========================================================================
  // GROUP 5: Human Gate Approval & Auto-Patch (OPTION A)
  // ==========================================================================
  console.log('\n--- GROUP 5: Human Gate Decision & Auto-Patch (OPTION A) ---');

  await testRoute('Human Gate', 'Approve Option A (Panel 4 Button: Approve Option A)', `${SERVER_URL}/api/negotiate/decision`, 'POST', {
    option: 'OPTION_A',
    approvedByBackend: 'alex.be',
    approvedByFrontend: 'sam.fe'
  }, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.patchResult?.decisionType, 'OPTION_A');
    assert.strictEqual(data.patchResult?.verificationPassed, true, 'Patch must pass verification');
    assert.strictEqual(data.negotiation?.status, 'RESOLVED');
  });

  await testRoute('Persistence', 'Query Decisions Log (Panel 4: Decisions Log Tab)', `${SERVER_URL}/api/decisions`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(Array.isArray(data.decisions));
    assert(data.decisions.length > 0);
    const d0 = data.decisions[0];
    assert.strictEqual(d0.decisionType, 'OPTION_A');
    assert.strictEqual(d0.approvedByBackend, 'alex.be');
    assert.strictEqual(d0.approvedByFrontend, 'sam.fe');
  });

  await testRoute('Persistence', 'Query Execution Logs (Panel 4: Audit Logs Tab)', `${SERVER_URL}/api/logs`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(Array.isArray(data.logs));
    assert(data.logs.length > 0);
  });

  await testRoute('Machine B', 'Diagnostics Post-Resolution (Clean zero breakages)', `${SERVER_URL}/api/frontend/diagnostics`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.breakages.length, 0, 'Breakages must be 0 after Option A ratified');
  });

  // ==========================================================================
  // GROUP 6: Revert Baseline & Test OPTION B Flow
  // ==========================================================================
  console.log('\n--- GROUP 6: Revert Baseline & Test OPTION B Flow ---');

  await testRoute('Lifecycle', 'Reset Baseline after Option A', `${SERVER_URL}/api/backend/reset`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.reset, true);
  });

  await testRoute('Mutation', 'Mutate DTO for Option B Test', `${SERVER_URL}/api/backend/mutate`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.diffResult?.hasBreakingChanges, true);
  });

  await testRoute('Human Gate', 'Approve Option B (Panel 4 Button: Approve Option B)', `${SERVER_URL}/api/negotiate/decision`, 'POST', {
    option: 'OPTION_B',
    approvedByBackend: 'alex.be',
    approvedByFrontend: 'sam.fe'
  }, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.patchResult?.decisionType, 'OPTION_B');
    assert.strictEqual(data.patchResult?.verificationPassed, true);
    assert.strictEqual(data.negotiation?.status, 'RESOLVED');
  });

  await testRoute('Lifecycle', 'Reset Baseline after Option B', `${SERVER_URL}/api/backend/reset`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.reset, true);
  });

  // ==========================================================================
  // GROUP 7: Live Schema Editor (Disk Write on Panel 1)
  // ==========================================================================
  console.log('\n--- GROUP 7: Live Schema Editor (Panel 1 Save Button) ---');

  const currentSchemaRes = await testRoute('Schema Editor', 'Read Current Schema', `${SERVER_URL}/api/backend/schema`, 'GET');
  const originalSource = currentSchemaRes.schemaSource;

  // Append a non-breaking commented note
  const editedSource = originalSource.replace(
    '// ============================================================================',
    '// [EDITED VIA PACTROOM STUDIO LIVE SCHEMA EDITOR]\n// ============================================================================'
  );

  await testRoute('Schema Editor', 'Save Custom Schema to Disk (Button: Save Schema)', `${SERVER_URL}/api/backend/schema`, 'POST', {
    schemaContent: editedSource
  }, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });

  // Verify write took effect on disk
  await testRoute('Schema Editor', 'Verify Disk Schema Updated', `${SERVER_URL}/api/backend/schema`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(data.schemaSource.includes('[EDITED VIA PACTROOM STUDIO LIVE SCHEMA EDITOR]'));
  });

  // Restore clean baseline
  await testRoute('Lifecycle', 'Reset Baseline to Clean State', `${SERVER_URL}/api/backend/reset`, 'POST', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.reset, true);
  });

  // Allow backend-api tsx watch to settle after schema reset
  await new Promise((r) => setTimeout(r, 1500));

  // ==========================================================================
  // GROUP 8: Backend Microservice REST Endpoints (Port 3001)
  // ==========================================================================
  console.log('\n--- GROUP 8: Backend Microservice REST Endpoints (Port 3001) ---');

  await testRoute('Microservice', 'Health Check', `${BACKEND_URL}/health`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'backend-api');
  });

  await testRoute('Microservice', 'Live OpenAPI 3.1 Specification JSON', `${BACKEND_URL}/openapi.json`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.openapi, '3.1.0');
    assert(data.paths['/api/v1/orders/{id}'], 'Missing /api/v1/orders/{id} path');
    assert(
      data.components?.schemas?.OrderResponse || data.components?.schemas?.OrderResponseSchema,
      'Missing OrderResponse or OrderResponseSchema'
    );
  });

  await testRoute('Microservice', 'GET /api/v1/orders/:id', `${BACKEND_URL}/api/v1/orders/ord_2026_9872`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.id, 'ord_2026_9872');
    assert(typeof data.total_amount_cents === 'number', 'total_amount_cents must be number');
    assert.strictEqual(data.status, 'settled');
  });

  await testRoute('Microservice', 'POST /api/v1/checkout/session', `${BACKEND_URL}/api/v1/checkout/session`, 'POST', {
    customer_id: 'cust_switch_441',
    customer_tier: 'pro',
    line_items: [
      { item_id: 'item_01', title: 'Merino Mat', unit_price_cents: 4500, quantity: 1 }
    ]
  }, (data, status) => {
    assert.strictEqual(status, 201);
    assert(data.session_id, 'Missing session_id');
    assert(data.checkout_url, 'Missing checkout_url');
  });

  await testRoute('Microservice', 'GET /api/v1/subscriptions/active', `${BACKEND_URL}/api/v1/subscriptions/active?customer_id=cust_switch_441`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.customer_id, 'cust_switch_441');
    assert.strictEqual(data.monthly_price_cents, 4900);
  });

  await testRoute('Microservice', 'GET /api/orders (Legacy)', `${BACKEND_URL}/api/orders`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(Array.isArray(data.orders));
  });

  await testRoute('Microservice', 'POST /api/orders (Legacy)', `${BACKEND_URL}/api/orders`, 'POST', {
    customerId: 'usr_441',
    items: [{ productId: 'prod_keyboard_01', name: 'Keyboard', quantity: 1, price: 189.99 }]
  }, (data, status) => {
    assert.strictEqual(status, 201);
    assert(data.id);
  });

  await testRoute('Microservice', 'GET /api/users/:id', `${BACKEND_URL}/api/users/usr_441`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert.strictEqual(data.id, 'usr_441');
    assert.strictEqual(data.email, 'alex@pactroom.dev');
  });

  await testRoute('Microservice', 'GET /api/billing/invoices', `${BACKEND_URL}/api/billing/invoices`, 'GET', undefined, (data, status) => {
    assert.strictEqual(status, 200);
    assert(Array.isArray(data.invoices));
  });

  // Final reset
  await testRoute('Lifecycle', 'Final Clean Baseline Reset', `${SERVER_URL}/api/backend/reset`, 'POST');

  // ==========================================================================
  // Summary Report
  // ==========================================================================
  console.log('\n================================================================');
  console.log('📊 AUDIT SUMMARY REPORT');
  console.log('================================================================');
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Routes / Actions Tested : ${total}`);
  console.log(`Passed                        : ${passedCount} (100%)`);
  console.log(`Failed                        : ${failedCount}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runDeepAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
