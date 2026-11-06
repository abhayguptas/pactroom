'use client';

import React, { useState, useRef } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  Info,
  ShieldAlert,
  Zap,
  Terminal,
  Sparkles,
  ArrowRight,
  Lock,
  Laptop,
  CheckCircle2,
  Code2
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
  const [copiedCli, setCopiedCli] = useState(false);
  const [activeCallout, setActiveCallout] = useState<'watch' | 'verify' | 'sync' | 'params'>('sync');
  const [runMode, setRunMode] = useState<'switch-only' | 'full-platform'>('switch-only');
  const codeViewerRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(TEMPLATE_YAML_CONTENT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCli = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
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

  const scrollToSection = (section: 'watch' | 'verify' | 'sync' | 'params') => {
    setActiveCallout(section);
    const targetLineNumber =
      section === 'params' ? 18 : section === 'watch' ? 57 : section === 'verify' ? 71 : 85;
    const targetElement = document.getElementById(`yaml-line-${targetLineNumber}`);
    if (targetElement && codeViewerRef.current) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section id="template" className="relative py-20 sm:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
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

        {/* ========================================================================= */}
        {/* ROW 1: EQUALIZED TWO-COLUMN STAGE (5:7 Split with Aligned Heights)        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
          {/* Left Column: Interactive Architecture Highlights (5 cols, h-full) */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full p-6 sm:p-7 rounded-3xl bg-white border border-neutral-200/90 shadow-xl text-left">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shadow-soft-sm">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-bold text-neutral-900">
                      Architecture Highlights
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-sans">
                      Click any agent to jump to its YAML declaration
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                  3 Agents
                </span>
              </div>

              {/* Agent Navigator Pills */}
              <div className="mt-4 space-y-2.5">
                {/* 1. {team}-watch */}
                <button
                  type="button"
                  onClick={() => scrollToSection('watch')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all active:scale-[0.99] ${
                    activeCallout === 'watch'
                      ? 'bg-sky-50/90 border-sky-300 ring-2 ring-sky-200/60 shadow-soft-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-sky-300 hover:bg-sky-50/40 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      1. &#123;team&#125;-watch
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                      addressing: anyone
                    </span>
                  </div>
                  <div className="text-xs text-neutral-900 font-semibold mt-1">
                    Backend Contract Watcher
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Runs on <code className="text-sky-800 font-mono">&#123;backend_location&#125;</code> inside <code className="text-sky-800 font-mono">&#123;backend_dir&#125;</code>. Uses git diff and OpenAPI AST extractor to detect uncommitted drift.
                  </p>
                </button>

                {/* 2. {team}-verify */}
                <button
                  type="button"
                  onClick={() => scrollToSection('verify')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all active:scale-[0.99] ${
                    activeCallout === 'verify'
                      ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-200/60 shadow-soft-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      2. &#123;team&#125;-verify
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                      addressing: owner-agents
                    </span>
                  </div>
                  <div className="text-xs text-neutral-900 font-semibold mt-1">
                    Frontend Impact Verifier
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Runs on <code className="text-emerald-800 font-mono">&#123;frontend_location&#125;</code> inside <code className="text-emerald-800 font-mono">&#123;frontend_dir&#125;</code>. Runs real <code className="text-emerald-800 font-mono">tsc --noEmit</code> and Vitest suites.
                  </p>
                </button>

                {/* 3. {team}-sync */}
                <button
                  type="button"
                  onClick={() => scrollToSection('sync')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all active:scale-[0.99] ${
                    activeCallout === 'sync'
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200/60 shadow-soft-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-amber-300 hover:bg-amber-50/40 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      3. &#123;team&#125;-sync
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold">
                      auto_approve: false
                    </span>
                  </div>
                  <div className="text-xs text-neutral-900 font-semibold mt-1">
                    Human Authorization Gatekeeper
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Strictly enforces human approval gate. Proposes Option A vs Option B in the room. Zero patches applied without two-key human sign-off.
                  </p>
                </button>

                {/* 4. params */}
                <button
                  type="button"
                  onClick={() => scrollToSection('params')}
                  className={`w-full p-3.5 rounded-2xl text-left border transition-all active:scale-[0.99] ${
                    activeCallout === 'params'
                      ? 'bg-violet-50/90 border-violet-300 ring-2 ring-violet-200/60 shadow-soft-sm'
                      : 'bg-[#FBFBFA] border-neutral-200/80 hover:border-violet-300 hover:bg-violet-50/40 text-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-violet-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      4. params &amp; bridge: $first
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-semibold">
                      Parametric Slug
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                    Parametric team slug prefixes all 3 agents and room. <code className="text-violet-800 font-mono">bridge: $first</code> mirrors room traffic seamlessly to Slack, Discord, or Mattermost.
                  </p>
                </button>
              </div>
            </div>

            {/* Bottom Status / Runtime Invariant */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Switch 1.0 Spec Invariant</span>
              </span>
              <span>100% Validated YAML</span>
            </div>
          </div>

          {/* Right Column: Code Viewer (7 cols, h-full, exactly matching height) */}
          <div className="lg:col-span-7 flex flex-col h-full rounded-3xl border border-neutral-200/90 bg-white shadow-xl overflow-hidden text-left">
            {/* Viewer Header */}
            <div className="px-5 py-3.5 bg-[#FAFAF8] border-b border-neutral-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-orange-500" />
                <span className="font-mono text-xs font-semibold text-neutral-800">
                  pactroom.template.yaml
                </span>
                <span className="text-[10px] font-mono text-neutral-500 px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200/60 font-medium">
                  141 lines • 4.8 KB
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-soft-sm active:scale-95"
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
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-black text-xs font-mono text-white font-medium shadow-sm transition-colors active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-white/80" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Syntax-Highlighted YAML Viewer Container (Flexible Height) */}
            <div
              ref={codeViewerRef}
              className="flex-1 p-5 font-mono text-xs leading-relaxed min-h-[460px] max-h-[540px] overflow-y-auto overflow-x-auto text-neutral-700 bg-white selection:bg-orange-100 scroll-smooth"
            >
              <pre className="text-[11px] font-mono leading-relaxed">
                {TEMPLATE_YAML_CONTENT.split('\n').map((line, idx) => {
                  const lineNum = idx + 1;
                  const isComment = line.trim().startsWith('#');
                  const isKey = line.includes(':') && !isComment;
                  const isRootSection =
                    line.startsWith('params:') ||
                    line.startsWith('agents:') ||
                    line.startsWith('room:') ||
                    line.startsWith('kickoff:');

                  // Active highlight range depending on active callout
                  const isHighlighted =
                    (activeCallout === 'params' && lineNum >= 18 && lineNum <= 55) ||
                    (activeCallout === 'watch' && lineNum >= 57 && lineNum <= 70) ||
                    (activeCallout === 'verify' && lineNum >= 71 && lineNum <= 84) ||
                    (activeCallout === 'sync' && lineNum >= 85 && lineNum <= 101);

                  return (
                    <div
                      key={idx}
                      id={`yaml-line-${lineNum}`}
                      className={`px-1.5 py-0.5 rounded flex items-start transition-colors ${
                        isHighlighted
                          ? 'bg-amber-50/70 border-l-2 border-amber-400 text-neutral-900'
                          : isRootSection
                          ? 'bg-neutral-50 font-bold text-neutral-900'
                          : 'hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <span className="w-8 shrink-0 text-neutral-400 select-none text-[10px] text-right pr-3 font-mono">
                        {lineNum}
                      </span>
                      <span
                        className={
                          isComment
                            ? 'text-neutral-400 italic'
                            : isKey
                            ? isRootSection
                              ? 'text-neutral-950 font-bold'
                              : 'text-neutral-900 font-semibold'
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

        {/* ========================================================================= */}
        {/* ROW 2: FULL-WIDTH HOW TO RUN PACTROOM DOCK (12 cols, Elegant Terminal UI) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 text-white p-6 sm:p-8 shadow-xl text-left">
          {/* Top Dock Header & Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-sans font-bold text-white flex items-center gap-2">
                  <span>How to Run PactRoom</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-normal">
                    Two Execution Modes
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Deploy natively with Switch Console or launch the interactive 4-panel visual development studio.
                </p>
              </div>
            </div>

            {/* Mode Selector Toggle Pills */}
            <div className="flex p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setRunMode('switch-only')}
                className={`py-1.5 px-3.5 rounded-lg text-center transition-all font-medium ${
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
                className={`py-1.5 px-3.5 rounded-lg text-center transition-all font-medium ${
                  runMode === 'full-platform'
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                2. Full Visual Studio
              </button>
            </div>
          </div>

          {/* Mode 1: Switch Console Only */}
          {runMode === 'switch-only' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Left Column: Switch Console Web UI */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                    Option A • Switch Console Web UI
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                    Zero Server Setup
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-neutral-300 space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-orange-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Open Switch Console &rarr; Templates &rarr; <strong>&quot;Use template&quot;</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-orange-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Choose coding agent provider: <code className="text-orange-300 font-mono text-[11px]">[OpenCode, Codex, Claude Code, Cursor]</code></span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-orange-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Select <code className="text-neutral-200 font-mono text-[11px]">backend_dir</code> &amp; <code className="text-neutral-200 font-mono text-[11px]">frontend_dir</code> via native folder picker</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-800 text-orange-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <span>Click <strong>&quot;Create all&quot;</strong> &rarr; Room <code className="text-emerald-400 font-mono text-[11px]">#pactflow-api-contracts</code> becomes active</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Switch CLI Single Command */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                    Option B • Switch CLI Command
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCli('switch run --template ./pactroom.template.yaml --team pactflow')
                    }
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copiedCli ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-neutral-300" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs space-y-2">
                  <div className="text-neutral-400 text-[11px]"># Run template directly with Switch CLI</div>
                  <div className="text-sky-300 font-semibold text-xs leading-relaxed select-all">
                    switch run --template ./pactroom.template.yaml --team pactflow
                  </div>
                  <div className="pt-2 text-[11px] text-neutral-400 font-sans border-t border-white/5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Switch orchestrates the 3 agents natively. No external server required.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Full Visual Studio */}
          {runMode === 'full-platform' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {/* Left Column: Quickstart Commands */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                    Step 1 • Clone &amp; Launch Stack
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-neutral-400 border border-white/10">
                    Full Platform
                  </span>
                </div>
                <pre className="p-4 rounded-2xl bg-black/50 border border-white/10 text-neutral-200 overflow-x-auto text-xs font-mono leading-relaxed">
{`# 1. Clone repository
git clone https://github.com/abhayguptas/pactroom.git pactroom
cd pactroom && pnpm install

# 2. Launch 4-Panel Studio & Switch Protocol Bridge
pnpm dev`}
                </pre>
              </div>

              {/* Right Column: Runtime Topology & Auto SQLite */}
              <div className="space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Step 2 • Endpoints &amp; SQLite Registry
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Self-Initializing
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 font-mono text-xs space-y-2 text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Web Contract Studio:</span>
                    <a
                      href="http://localhost:3000/studio"
                      target="_blank"
                      rel="noreferrer"
                      className="text-orange-400 hover:underline"
                    >
                      http://localhost:3000/studio
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Engine &amp; SQLite DB:</span>
                    <span className="text-neutral-200">http://localhost:3002</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Fastify Microservice:</span>
                    <span className="text-neutral-200">http://localhost:3001</span>
                  </div>
                  <div className="pt-2 text-[11px] text-neutral-400 font-sans border-t border-white/5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span><code className="text-emerald-400 font-mono text-[11px]">pactroom.db</code> creates and migrates itself automatically on first boot.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
