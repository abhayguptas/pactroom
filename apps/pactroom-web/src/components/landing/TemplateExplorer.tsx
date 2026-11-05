'use client';

import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Info,
  ShieldAlert,
  Zap,
  Terminal,
  Sparkles
} from 'lucide-react';

export const TEMPLATE_YAML_CONTENT = `version: 1

params:
  team:
    type: string
    description: Lowercase alphanumeric slug prefix for every agent and room name this creates.
    pattern: "^[a-z0-9]+$"
    default: "pactflow"

  provider:
    type: provider
    description: Which coding agent backs the agents. The first one installed is chosen.
    default: [claude, codex, opencode]

  backend_location:
    type: location
    description: Where {team}-watch runs (Backend developer laptop).
    default: local

  frontend_location:
    type: location
    description: Where {team}-verify runs (Frontend developer laptop).
    default: local

  backend_dir:
    type: directory
    description: Absolute or relative directory of the backend repository to monitor.
    default: workspaces/backend-api

  frontend_dir:
    type: directory
    description: Absolute or relative directory of the frontend repository to test against.
    default: workspaces/frontend-consumer

  bridge:
    type: bridge
    description: Where the room is mirrored (Slack, Discord, Teams, Telegram, or Mattermost).
    default: [$first]
    required: false

agents:
  - name: "{team}-watch"
    description: "Inspects uncommitted local backend changes, diffs OpenAPI schemas, and flags breaking changes in the room."
    addressing: anyone
    provider: "{provider}"
    location: "{backend_location}"
    directory: "{backend_dir}"
    instructions: |
      You are the local backend contract watcher on Machine A.
      You have read access to the local backend git repository on this workstation.
      Your responsibility:
      1. Inspect uncommitted schema diffs in real time before code is pushed.
      2. When an API DTO, route, or response schema changes, broadcast the exact contract diff into the Switch room.
      3. Tag @{team}-verify and summarize breaking changes with zero guessing.

  - name: "{team}-verify"
    description: "Validates contract diffs against the frontend consumer codebase using tsc --noEmit and Vitest."
    addressing: owner-agents
    provider: "{provider}"
    location: "{frontend_location}"
    directory: "{frontend_dir}"
    instructions: |
      You are the frontend consumer validation agent on Machine B.
      You operate in workspaces/frontend-consumer on this developer's workstation.
      Your responsibility:
      1. When @{team}-watch flags a candidate API contract diff, test it against the consumer codebase.
      2. Run child process checks: tsc --noEmit and vitest run.
      3. Report exact failure stdout, breaking file paths, and compiler diagnostics back to the Switch room.

  - name: "{team}-sync"
    description: "Synthesizes non-destructive resolution plans, enforces human approval gates, and applies clean patches."
    addressing: owner-agents
    provider: "{provider}"
    location: "{backend_location}"
    directory: "{backend_dir}"
    instructions: |
      You are the cross-machine contract synchronizer and resolution synthesizer.
      Your responsibility:
      1. When @{team}-verify confirms breakages, synthesize two distinct resolution options:
         - Option A: Backward-compatible backend adapter on Machine A.
         - Option B: Synchronized consumer patch on Machine B.
      2. STRICT HUMAN AUTHORIZATION GATE:
         auto_approve: false
         You must NEVER apply patches to disk or commit changes until BOTH human backend and frontend leads explicitly reply with APPROVE in the Switch room.
      3. Record the ratified binding contract in the immutable Switch room decision log.

room:
  name: "{team}-api-contracts"
  bridge: "{bridge}"
  agents:
    - "{team}-watch"
    - "{team}-verify"
    - "{team}-sync"
  aliases:
    "{team}-watch": watch
    "{team}-verify": verify
    "{team}-sync": sync
  rules:
    - "No agent may write code patches without explicit human approval from both backend and frontend owners."
    - "All reported breakages must include real terminal output and exact source line numbers."
  instructions: |
    Operational Protocol:
    1. Machine A Watcher (@{team}-watch) inspects local git diffs and notifies the room of contract mutations.
    2. Zero guessing: All diffs and error reports must be backed by real files on disk and real child process runs.
    3. Mandatory Human Approval Gate: No agent may write code patches, edit schemas, or merge branches without explicit sign-off from both backend and frontend human engineers.
    4. Verified Green Invariant: A negotiation is only concluded when both backend and frontend achieve a 0-error TypeScript compilation and passing Vitest test suites.

kickoff: |
  @{team}-watch, @{team}-verify, and @{team}-sync: Welcome to your shared PactRoom negotiation chamber!

  Please introduce yourselves:
  - State your exact role and machine location.
  - Confirm the working directory you monitor.
  - Explicitly state what you will NEVER do without human approval.

  Then, {team}-watch, inspect the local backend working directory for uncommitted contract diffs and report your status.`;

export const TemplateExplorer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeCallout, setActiveCallout] = useState<'watch' | 'verify' | 'sync' | 'params'>('sync');
  const [runMode, setRunMode] = useState<'switch-only' | 'full-platform'>('switch-only');

  const handleCopy = () => {
    navigator.clipboard.writeText(TEMPLATE_YAML_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([TEMPLATE_YAML_CONTENT], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = 'pactroom.template.yaml';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section id="template" className="relative py-20 sm:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-medium shadow-sm mb-4">
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Switch Specification v1.0</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold text-neutral-900 leading-[1.12] tracking-tight">
            Switch Room Template Explorer
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            Strictly compliant with Switch v0.31 conventions and modeled on <code className="text-neutral-900 bg-neutral-100 px-1 py-0.5 rounded font-mono">triage-pair.template.yaml</code>. Zero config required: spin up with any team slug in seconds.
          </p>
        </div>

        {/* Template Interactive Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Callouts & Parameter Explanations (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="p-6 rounded-3xl bg-white border border-neutral-200/80 shadow-soft-sm">
              <h3 className="text-base font-sans font-bold text-neutral-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-orange-500" />
                <span>Architecture Highlights</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Click any agent below to inspect how Switch enforces roles, addressing boundaries, and human authorization.
              </p>

              {/* Callout Selectors */}
              <div className="mt-4 space-y-2">
                {/* 1. {team}-watch */}
                <button
                  onClick={() => setActiveCallout('watch')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    activeCallout === 'watch'
                      ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-sky-300 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-sky-800">
                      1. &#123;team&#125;-watch
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-medium">
                      addressing: anyone
                    </span>
                  </div>
                  <div className="text-xs text-neutral-800 font-semibold mt-1">
                    Backend Contract Watcher
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Runs on <code className="text-sky-800">&#123;backend_location&#125;</code> inside <code className="text-sky-800">&#123;backend_dir&#125;</code>. Uses git diff and OpenAPI AST extractor to detect uncommitted schema drift.
                  </p>
                </button>

                {/* 2. {team}-verify */}
                <button
                  onClick={() => setActiveCallout('verify')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    activeCallout === 'verify'
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-emerald-300 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-emerald-800">
                      2. &#123;team&#125;-verify
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      addressing: owner-agents
                    </span>
                  </div>
                  <div className="text-xs text-neutral-800 font-semibold mt-1">
                    Frontend Impact Verifier
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Runs on <code className="text-emerald-800">&#123;frontend_location&#125;</code> inside <code className="text-emerald-800">&#123;frontend_dir&#125;</code>. Runs real <code className="text-emerald-800">tsc --noEmit</code> and Vitest test suites.
                  </p>
                </button>

                {/* 3. {team}-sync */}
                <button
                  onClick={() => setActiveCallout('sync')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    activeCallout === 'sync'
                      ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-amber-300 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-amber-900">
                      3. &#123;team&#125;-sync
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                      auto_approve: false
                    </span>
                  </div>
                  <div className="text-xs text-neutral-800 font-semibold mt-1">
                    Human Authorization Gatekeeper
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Strictly enforces human approval gate. Proposes Option A vs Option B in the room. Zero patches applied without two-key human sign-off.
                  </p>
                </button>

                {/* 4. params */}
                <button
                  onClick={() => setActiveCallout('params')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                    activeCallout === 'params'
                      ? 'bg-violet-50/80 border-violet-300 shadow-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-violet-300 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-violet-800">
                      4. params &amp; bridge: $first
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-medium">
                      Parametric Slug
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Parametric team slug prefixes all 3 agents and room. <code className="text-violet-800">bridge: $first</code> mirrors room traffic seamlessly to Slack, Discord, or Mattermost.
                  </p>
                </button>
              </div>
            </div>

            {/* How to Run: Two Operating Modes Card */}
            <div className="p-5 rounded-3xl bg-neutral-900 text-white font-mono text-xs shadow-md space-y-3">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="flex items-center gap-1.5 text-orange-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span className="font-semibold text-white">How to Run PactRoom</span>
                </span>
                <span className="text-[10px] text-neutral-400">Two Modes</span>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex p-1 rounded-xl bg-black/50 border border-white/10 text-[11px] gap-1">
                <button
                  type="button"
                  onClick={() => setRunMode('switch-only')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors font-medium ${
                    runMode === 'switch-only'
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  1. Switch Console Only
                </button>
                <button
                  type="button"
                  onClick={() => setRunMode('full-platform')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-colors font-medium ${
                    runMode === 'full-platform'
                      ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  2. Full Visual Studio
                </button>
              </div>

              {runMode === 'switch-only' ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    <strong>Zero server setup.</strong> Import <code className="text-orange-300">pactroom.template.yaml</code> directly into your local or cloud Switch Console:
                  </p>
                  <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-neutral-200 overflow-x-auto text-[10.5px] leading-relaxed">
{`# Option A: In Switch Console Web UI
1. Open Switch Console -> Templates -> "Use template"
2. Choose provider: [OpenCode, Codex, Claude Code, Cursor]
3. Select backend_dir & frontend_dir via native picker
4. Click "Create all" -> Room #pactflow-api-contracts active!

# Option B: Via Switch CLI
switch run --template ./pactroom.template.yaml --team pactflow`}
                  </pre>
                  <div className="text-[10px] text-neutral-400 font-sans">
                    ✓ Switch orchestrates the 3 agents natively. No external server required.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    <strong>Full Mission Control.</strong> Includes 4-panel visual studio, live AST OpenAPI diffing, and embedded self-initializing SQLite:
                  </p>
                  <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-neutral-200 overflow-x-auto text-[10.5px] leading-relaxed">
{`# 1. Clone & install
git clone https://github.com/sandbox-quantum/switch.git pactroom
cd pactroom && pnpm install

# 2. Launch Visual Studio & Engine (SQLite auto-initializes)
pnpm dev
# -> Web Studio: http://localhost:3000/studio
# -> Engine & SQLite DB: http://localhost:4000`}
                  </pre>
                  <div className="text-[10px] text-neutral-400 font-sans">
                    ✓ <code className="text-emerald-400">pactroom.db</code> creates itself automatically. Zero database config.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Viewer (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-neutral-200/90 bg-white shadow-xl overflow-hidden text-left">
            {/* Viewer Header */}
            <div className="px-5 py-3.5 bg-[#FAFAF8] border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-orange-500" />
                <span className="font-mono text-xs font-semibold text-neutral-800">
                  pactroom.template.yaml
                </span>
                <span className="text-[10px] font-mono text-neutral-500 px-2 py-0.5 rounded bg-neutral-100">
                  141 lines • 4.8 KB
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-soft-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy YAML</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-black text-xs font-mono text-white font-medium shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-white/80" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Syntax-Highlighted YAML Viewer Container */}
            <div className="p-5 font-mono text-xs leading-relaxed max-h-[580px] overflow-y-auto overflow-x-auto text-neutral-700 bg-white selection:bg-orange-100">
              <pre className="text-[11px] font-mono leading-relaxed">
                {TEMPLATE_YAML_CONTENT.split('\n').map((line, idx) => {
                  const isComment = line.trim().startsWith('#');
                  const isKey = line.includes(':') && !isComment;
                  const isParam = line.startsWith('params:') || line.startsWith('agents:') || line.startsWith('room:');

                  return (
                    <div
                      key={idx}
                      className={`hover:bg-[#F8F9FA] px-1 py-0.5 rounded flex items-start ${
                        isParam ? 'bg-orange-50/50 font-bold text-orange-900' : ''
                      }`}
                    >
                      <span className="w-8 shrink-0 text-neutral-400 select-none text-[10px] text-right pr-3">
                        {idx + 1}
                      </span>
                      <span
                        className={
                          isComment
                            ? 'text-neutral-400 italic'
                            : isKey
                            ? 'text-neutral-900'
                            : 'text-neutral-600'
                        }
                      >
                        {line}
                      </span>
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
