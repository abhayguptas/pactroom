'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCode2,
  Cpu,
  Database,
  ExternalLink
} from 'lucide-react';

export const EvaluatorQuickStart: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section id="evaluator-guide" className="py-20 sm:py-28 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-[11px] font-mono font-medium shadow-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Hackathon Mentors &amp; Judges Guide</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold text-neutral-900 leading-[1.12] tracking-tight">
            What Did We Build? Two Ways to Test PactRoom
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            PactRoom is not just a template. It is an end-to-end engineering platform consisting of a standard Switch Room Template and a complete deterministic AST verification engine with a 4-panel visual studio.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* SIDE-BY-SIDE ARCHITECTURE COMPARISON: TEMPLATE VS FULL PLATFORM           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 text-left">
          {/* Card 1: The Free Switch Room Template */}
          <div className="p-8 rounded-3xl bg-white border border-neutral-200/90 shadow-soft-sm flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                  Mode 01 • Open Source Template
                </span>
                <span className="text-xs font-semibold text-emerald-600 font-mono">
                  100% Free • Zero Server Setup
                </span>
              </div>

              <h3 className="text-2xl font-sans font-bold text-neutral-900 mb-2">
                Free Switch Room Template
              </h3>
              <p className="text-xs text-neutral-500 font-mono mb-4">
                pactroom.template.yaml (154 lines • Switch v1 specification)
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                Designed for teams who run Switch Console and want native multi-agent orchestration without installing any external server or dependencies.
              </p>

              <div className="space-y-3 font-mono text-xs text-neutral-700 border-t border-neutral-100 pt-5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Runs in Switch Console:</strong> Import directly via <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900">Templates &gt; Use template</code>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-Provider:</strong> Compatible with OpenCode, Codex, Claude Code, and Cursor.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Folder Picker:</strong> Promotes <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900">backend_dir</code> and <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900">frontend_dir</code> with native UI directory selectors.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safe Human Gate:</strong> Enforces <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900">auto_approve: false</code> directly in the template instructions.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
              <a
                href="#template"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-orange-600 transition-colors"
              >
                <span>Inspect pactroom.template.yaml</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <span className="text-[10px] font-mono text-neutral-400">168/168 Checks Passed</span>
            </div>
          </div>

          {/* Card 2: The Full PactRoom Platform */}
          <div className="p-8 rounded-3xl bg-neutral-900 text-white border-2 border-orange-400/50 shadow-xl flex flex-col justify-between relative overflow-hidden">
            {/* Ambient sunset glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Mode 02 • Full Monorepo Platform
                </span>
                <span className="text-xs font-semibold text-orange-400 font-mono">
                  Full Visual Studio &amp; Engine
                </span>
              </div>

              <h3 className="text-2xl font-sans font-bold text-white mb-2">
                Full PactRoom Platform
              </h3>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                Engine + Studio + SQLite + Real Express &amp; React Workspaces
              </p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                The complete visual mission control and deterministic AST compiler engine. Tested live across two developer codebases with real child process compiler verification.
              </p>

              <div className="space-y-3 font-mono text-xs text-neutral-300 border-t border-white/10 pt-5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>4-Panel Visual Studio:</strong> Real-time split-screen dashboard displaying Machine A, Switch Room, Machine B, and Human Gate.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Deterministic AST Engine:</strong> Compiles OpenAPI 3.1 directly from dirty TypeScript AST in 14ms (RFC 6901 pointers).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Real Subprocess Verification:</strong> Spawns real <code className="bg-black/50 px-1 py-0.5 rounded text-orange-300">tsc --noEmit</code> and <code className="bg-black/50 px-1 py-0.5 rounded text-orange-300">vitest run</code> on Machine B.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Two-Way Switch Bridge:</strong> Automatically mirrors alerts into real Switch / Mattermost rooms and triggers in-place patches on human approval.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Self-Initializing SQLite:</strong> Auto-creates <code className="bg-black/50 px-1 py-0.5 rounded text-orange-300">pactroom.db</code> storing all audit records, approver signatures, and execution telemetry.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between relative z-10">
              <Link
                href="/studio"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-300 hover:text-white transition-colors"
              >
                <span>Launch Visual Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[10px] font-mono text-neutral-400">57/57 Tests Passed</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 60-SECOND REPRODUCTION / TEST FLIGHT RUNBOOK                              */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-[#F8F9FA] border border-neutral-200/90 shadow-soft-md p-6 sm:p-10 text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-sans font-bold text-neutral-900">
                  Evaluator 60-Second Test Flight
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Step-by-step commands to clone, run, and verify the entire platform locally.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                Tested on macOS &amp; Linux
              </span>
            </div>
          </div>

          {/* Steps Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-soft-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    STEP 01
                  </span>
                  <button
                    onClick={() => copyToClipboard('git clone https://github.com/abhayguptas/pactroom.git pactroom && cd pactroom && pnpm install', 'step1')}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                    title="Copy command"
                  >
                    {copiedCmd === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <h4 className="text-sm font-sans font-bold text-neutral-900 mb-1">
                  Clone &amp; Install Monorepo
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                  PactRoom is fully self-contained with pnpm workspaces. Zero external databases required.
                </p>
              </div>
              <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`git clone https://github.com/abhayguptas/pactroom.git pactroom
cd pactroom && pnpm install`}
              </pre>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-soft-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    STEP 02
                  </span>
                  <button
                    onClick={() => copyToClipboard('pnpm dev', 'step2')}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                    title="Copy command"
                  >
                    {copiedCmd === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <h4 className="text-sm font-sans font-bold text-neutral-900 mb-1">
                  Launch Visual Studio &amp; Engine
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                  Concurrently boots Next.js web (3000), protocol bridge (3002), and backend API (3001).
                </p>
              </div>
              <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`pnpm dev
# Studio: http://localhost:3000/studio
# Engine: http://localhost:3002`}
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-soft-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    STEP 03
                  </span>
                  <button
                    onClick={() => copyToClipboard('pnpm test', 'step3')}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                    title="Copy command"
                  >
                    {copiedCmd === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <h4 className="text-sm font-sans font-bold text-neutral-900 mb-1">
                  Run Automated Test Suites
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                  Executes 57 unit, compiler, and E2E lifecycle tests + 168 template checks.
                </p>
              </div>
              <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`pnpm test
pnpm run validate:template
# 100% PASS across all packages`}
              </pre>
            </div>
          </div>

          {/* Live Collaborative Chat Bridge Card */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200 shadow-soft-sm text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <h4 className="text-sm font-sans font-bold text-neutral-900">
                  Live Switch Console &amp; Mattermost Collaborative Room Bridge
                </h4>
              </div>
              <a
                href={process.env.NEXT_PUBLIC_MATTERMOST_URL || 'http://localhost:60015'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-full border border-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <span>Open Mattermost Room (:60015)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Connect both developers across laptops with zero cloud setup! Machine 1 runs Switch Console; Machine 2 navigates to <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-neutral-800">http://&lt;MACHINE_1_IP&gt;:60015</code> and joins <code className="bg-white/80 px-1.5 py-0.5 rounded font-mono text-neutral-800">#pactroom-api-contracts</code>. When Machine 1 saves a breaking change in their editor, <code className="text-sky-800 font-mono font-semibold">@pactroom-watch</code> and <code className="text-emerald-800 font-mono font-semibold">@pactroom-verify</code> post live compiler diagnostics into the room, and typing <strong className="text-neutral-900">&quot;Approve Option A&quot;</strong> in chat ratifies and executes the auto-patch engine!
            </p>
          </div>

          {/* Interactive Test Walkthrough (What Happens in Studio) */}
          <div className="mt-8 p-6 rounded-2xl bg-white border border-neutral-200 shadow-soft-sm">
            <h4 className="text-sm font-sans font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulate a Live Breaking Contract Refactoring:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans text-neutral-600">
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-neutral-200/80">
                <div className="font-bold text-neutral-900 mb-1">1. Click &quot;Mutate DTO&quot;</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  In Panel 1, click <strong className="text-rose-600">Introduce Breaking Change</strong>. Simulates uncommitted refactoring of <code className="font-mono text-neutral-800">orders.dto.ts</code> on Machine A.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-neutral-200/80">
                <div className="font-bold text-neutral-900 mb-1">2. AST Engine Flags Diff</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Panel 1 detects the dirty tree in 14ms. Panel 2 Switch Room broadcasts the diff and addresses <code className="font-mono text-neutral-800">@pact-verify</code>.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-neutral-200/80">
                <div className="font-bold text-neutral-900 mb-1">3. Machine B Catches TS2339</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Panel 3 executes real <code className="font-mono text-neutral-800">tsc --noEmit</code>, pinning exact line 22 in <code className="font-mono text-neutral-800">CheckoutSummary.tsx</code>.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FAFAF8] border border-neutral-200/80">
                <div className="font-bold text-neutral-900 mb-1">4. Human Gate Ratification</div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  In Panel 4, click <strong className="text-neutral-900">Approve Option A</strong>. Auto-patches disk, re-runs compiler tests (100% PASS), and writes to SQLite ledger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

