'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Laptop,
  Terminal,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  GitBranch,
  Radio,
  FileCode,
  ShieldCheck,
  Check,
  Zap,
  Users,
  Code2
} from 'lucide-react';

export interface VisualizerStep {
  id: number;
  label: string;
  badge: string;
  description: string;
}

const STEPS: VisualizerStep[] = [
  {
    id: 1,
    label: '1. Uncommitted Backend Mutation',
    badge: 'Machine A (Dirty Git)',
    description: 'Backend engineer alters orders.dto.ts on an unpushed local branch. @pact-watch diffs live OpenAPI 3.1.'
  },
  {
    id: 2,
    label: '2. Cross-Machine Typecheck Failure',
    badge: 'Machine B (tsc regressed)',
    description: '@pact-verify pulls candidate contract and runs real tsc --noEmit. Catches TS2339 on CheckoutSummary.tsx:22.'
  },
  {
    id: 3,
    label: '3. Human Approval Gate in Switch Room',
    badge: 'Switch Chamber (auto_approve: false)',
    description: '@pact-sync proposes Option A vs Option B. Requires dual developer sign-off in Slack before touching code.'
  },
  {
    id: 4,
    label: '4. Synchronized Auto-Patch Green',
    badge: 'Both Machines (0 Errors)',
    description: 'Target repository auto-patched in-place. tsc --noEmit and Vitest re-run with 100% green exit code 0.'
  }
];

export const SplitScreenVisualizer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B'>('B');
  const [hasUserApproved, setHasUserApproved] = useState<boolean>(false);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 4) {
          return 1;
        }
        return prev + 1;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setIsPlaying(false);
  };

  const handleOptionSelect = (opt: 'A' | 'B') => {
    setSelectedOption(opt);
    setHasUserApproved(true);
    setCurrentStep(4);
    setIsPlaying(false);
  };

  return (
    <div id="visualizer" className="relative w-full py-16 scroll-mt-24">
      {/* Visualizer Container Card (Crisp Lindy White Card) */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white shadow-xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-neutral-200 bg-[#FAFAF8]">
          {/* Left: Section Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="h-4 w-[1px] bg-neutral-200 mx-1" />
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold text-neutral-800">
                PactRoom Live Multi-Machine Simulation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Switch Protocol v1.0
              </span>
            </div>
          </div>

          {/* Right: Step Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-mono text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-soft-sm"
              title={isPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCurrentStep(1);
                setHasUserApproved(false);
              }}
              className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors shadow-soft-sm"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Scrubber Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200 bg-[#F5F5F3] text-xs font-mono">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`p-3.5 text-left transition-all relative border-r border-neutral-200 last:border-r-0 ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:bg-[#ECECE9] hover:text-neutral-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStepIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-500"
                  />
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold ${
                      isActive
                        ? 'text-orange-600'
                        : isCompleted
                        ? 'text-emerald-600'
                        : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {step.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Context Banner */}
        <div className="px-6 py-2.5 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between text-xs text-neutral-700 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-orange-700 font-semibold">Active State:</span>
            <span>{STEPS[currentStep - 1].description}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-neutral-500 text-[11px]">
            <span>Step {currentStep} of 4</span>
          </div>
        </div>

        {/* 3-COLUMN SPLIT-SCREEN WORKBENCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 min-h-[580px]">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: MACHINE A — BACKEND LAPTOP (4 Columns)                       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-white text-left">
            <div>
              {/* Machine A Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold text-sm text-neutral-800">Machine A (Backend)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                  macOS • Claude Code
                </span>
              </div>

              {/* Agent & Git Metadata */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono bg-[#F8F9FA] p-2.5 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-neutral-700 font-semibold">feat/pricing-v2</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentStep >= 1 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-amber-700 font-semibold">
                    {currentStep === 4 ? 'SYNCED & CLEAN' : 'DIRTY (Uncommitted)'}
                  </span>
                </div>
              </div>

              {/* Agent Identity */}
              <div className="mt-3 text-xs font-mono text-neutral-600 flex items-center justify-between">
                <span className="text-sky-700 flex items-center gap-1 font-semibold">
                  <span>@pact-watch</span>
                  <span className="text-[10px] text-neutral-400 font-normal">(addressing: anyone)</span>
                </span>
                <span className="text-[10px] text-neutral-500">workspaces/backend-api</span>
              </div>

              {/* Code Editor Diff Window */}
              <div className="mt-3 rounded-xl border border-sky-200 bg-[#F8FAFC] overflow-hidden shadow-inner">
                <div className="px-3 py-1.5 bg-[#F1F5F9] border-b border-sky-100 flex items-center justify-between text-[11px] font-mono text-neutral-600">
                  <span className="text-sky-800 font-semibold flex items-center gap-1.5">
                    <FileCode className="w-3 h-3 text-sky-600" />
                    <span>src/routes/orders.dto.ts</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">OpenAPI 3.1 DTO</span>
                </div>

                <div className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-neutral-800">
                  <div className="text-neutral-400">// OrderResponseSchema definition</div>
                  <div className="text-sky-700 font-semibold">export const OrderResponseSchema = z.object&#123;</div>
                  <div className="pl-3 text-neutral-700">id: z.string().uuid(),</div>

                  {/* Dynamic Diff Content based on step and option */}
                  {currentStep === 4 && selectedOption === 'A' ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-emerald-50 border-l-2 border-emerald-500 pl-3 py-1 my-1"
                    >
                      <div className="text-emerald-700 font-semibold">
                        + pricing_breakdown: z.object(&#123; ... &#125;),
                      </div>
                      <div className="text-amber-700 text-[10px]">
                        + /** @deprecated Backward-compatible alias */
                      </div>
                      <div className="text-emerald-700 font-semibold">
                        + total_amount_cents: z.number().optional(),
                      </div>
                    </motion.div>
                  ) : currentStep >= 1 ? (
                    <div className="my-1">
                      <div className="bg-rose-50 text-rose-700 border-l-2 border-rose-400 pl-3 py-0.5 line-through">
                        - total_amount_cents: z.number(),
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 pl-3 py-0.5">
                        + pricing_breakdown: z.object(&#123;
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 pl-6 py-0.5">
                        + amount_minor: z.number(),
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 pl-6 py-0.5">
                        + currency_code: z.string()
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 pl-3 py-0.5">
                        + &#125;),
                      </div>
                    </div>
                  ) : (
                    <div className="pl-3 text-neutral-700">total_amount_cents: z.number(),</div>
                  )}

                  <div className="pl-3 text-neutral-700">status: z.enum([&quot;PENDING&quot;, &quot;PAID&quot;])</div>
                  <div className="text-sky-700 font-semibold">&#125;);</div>
                </div>
              </div>
            </div>

            {/* Bottom Status Box */}
            <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-neutral-200 text-[11px] font-mono">
              <div className="text-neutral-500 flex items-center justify-between mb-1.5">
                <span>Watcher Telemetry</span>
                <span className="text-sky-700 font-semibold">git diff: 1 file modified</span>
              </div>
              <div className="text-neutral-700 text-[10px] leading-tight">
                {currentStep === 1 && (
                  <span className="text-amber-700 font-semibold">
                    ⚡ @pact-watch identified breaking change: &quot;total_amount_cents&quot; removed from GET /api/v1/orders/:id. Broadcasting to Switch room.
                  </span>
                )}
                {currentStep === 2 && (
                  <span className="text-neutral-500">
                    ⏳ Waiting for @pact-verify cross-machine impact assessment...
                  </span>
                )}
                {currentStep === 3 && (
                  <span className="text-amber-800 font-semibold">
                    ✋ Human Approval Gate locked: Backend branch holding uncommitted changes.
                  </span>
                )}
                {currentStep === 4 && (
                  <span className="text-emerald-700 font-semibold">
                    ✅ Contract Ratified! Zero breaking changes remaining across repositories.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER COLUMN: SWITCH ROOM — #api-contracts (Slack / Mattermost) (4 Cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[#FCFCFA] relative text-left">
            <div className="absolute top-2 right-4">
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
                Switch Agent Protocol
              </span>
            </div>

            <div>
              {/* Room Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                  <span className="font-semibold text-sm text-neutral-800">Switch Room</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>#pactflow-api-contracts</span>
                </div>
              </div>

              {/* Multi-bridge badges */}
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-neutral-500 bg-white p-2 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-neutral-400" />
                  <span>Bridge: Slack #api-contracts</span>
                </div>
                <span className="text-sky-700 font-semibold">3 Agents + 2 Humans</span>
              </div>

              {/* Chat Thread Messages Stream */}
              <div className="mt-3 space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {/* Step 1 Message: Watcher alert */}
                <div className="p-3 rounded-xl bg-white border border-sky-200 text-xs shadow-soft-sm">
                  <div className="flex items-center justify-between font-mono text-[10px] text-sky-700 mb-1">
                    <span className="font-bold">@pact-watch</span>
                    <span className="text-neutral-400">18:42:01</span>
                  </div>
                  <p className="text-neutral-700 text-[11px] leading-relaxed">
                    🚨 <strong>BREAKING CONTRACT PROPOSED</strong> on local Machine A (branch: <code className="text-sky-800 bg-sky-50 px-1 py-0.5 rounded">feat/pricing-v2</code>).
                    Route <code className="text-amber-800 font-semibold">GET /api/v1/orders/:id</code> removed <code className="text-rose-700 line-through">total_amount_cents</code>.
                    cc: <span className="text-emerald-700 font-semibold">@pact-verify</span>.
                  </p>
                </div>

                {/* Step 2 Message: Verifier report */}
                {currentStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-white border border-rose-200 text-xs shadow-soft-sm"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-rose-700 mb-1">
                      <span className="font-bold flex items-center gap-1">
                        <span>@pact-verify</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                          CRITICAL FAILURE
                        </span>
                      </span>
                      <span className="text-neutral-400">18:42:04</span>
                    </div>
                    <p className="text-neutral-700 text-[11px] leading-relaxed font-mono">
                      ❌ Machine B Frontend Regressed!
                      <br />
                      <span className="text-rose-700 font-semibold">
                        tsc --noEmit: TS2339 in CheckoutSummary.tsx:22
                      </span>
                      <br />
                      Vitest: 1 contract test failed.
                    </p>
                  </motion.div>
                )}

                {/* Step 3 Message: Synchronizer Human Approval Gate */}
                {currentStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-300 text-xs shadow-soft-sm"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-amber-800 mb-1">
                      <span className="font-bold">@pact-sync</span>
                      <span className="text-amber-900 text-[9px] px-1.5 py-0.5 rounded bg-amber-200 font-mono font-semibold">
                        auto_approve: false
                      </span>
                    </div>
                    <p className="text-neutral-800 text-[11px] leading-relaxed mb-2 font-medium">
                      ⚠️ <strong>HUMAN APPROVAL REQUIRED</strong> before modifying any code repository:
                    </p>

                    {/* Interactive Selection Buttons */}
                    <div className="space-y-1.5 font-mono text-[10px]">
                      <button
                        onClick={() => handleOptionSelect('A')}
                        className={`w-full p-2 text-left rounded-lg border transition-all ${
                          selectedOption === 'A'
                            ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-sm'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-sky-300'
                        }`}
                      >
                        <div className="font-semibold text-sky-800 flex items-center justify-between">
                          <span>Option A: Backend Adapter</span>
                          {selectedOption === 'A' && <Check className="w-3.5 h-3.5 text-sky-700 font-bold" />}
                        </div>
                        <span className="text-neutral-500 text-[9px]">
                          Keep total_amount_cents as computed getter alias on Machine A.
                        </span>
                      </button>

                      <button
                        onClick={() => handleOptionSelect('B')}
                        className={`w-full p-2 text-left rounded-lg border transition-all ${
                          selectedOption === 'B'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                            : 'bg-white border-neutral-200 text-neutral-700 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-semibold text-emerald-800 flex items-center justify-between">
                          <span>Option B: Frontend Synchronized Patch</span>
                          {selectedOption === 'B' && <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" />}
                        </div>
                        <span className="text-neutral-500 text-[9px]">
                          Auto-patch CheckoutSummary.tsx on Machine B with fallback computation.
                        </span>
                      </button>
                    </div>

                    <div className="mt-2 text-[10px] text-amber-900 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      <span>Approved by: @alex.be (Backend) &amp; @sam.fe (Frontend)</span>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 Message: Ratified resolution */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs shadow-soft-sm"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-emerald-800 mb-1">
                      <span className="font-bold">@pact-sync</span>
                      <span className="text-neutral-400">18:42:12</span>
                    </div>
                    <p className="text-emerald-950 text-[11px] leading-relaxed font-mono">
                      🎉 <strong>CONTRACT RATIFIED &amp; SEALED</strong>
                      <br />
                      Applied Option {selectedOption}. Ran local <code className="text-emerald-800 font-bold">tsc --noEmit</code> (0 errors) and <code className="text-emerald-800 font-bold">vitest run</code> (100% passed).
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Room Channel Stats */}
            <div className="mt-4 p-2.5 rounded-xl bg-white border border-neutral-200 flex items-center justify-between text-[11px] font-mono text-neutral-500">
              <span className="text-neutral-600">Decision Log</span>
              <span className="text-emerald-700 font-semibold">pactroom.db: 4 transactions recorded</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: MACHINE B — FRONTEND LAPTOP (4 Columns)                     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-white text-left">
            <div>
              {/* Machine B Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-sm text-neutral-800">Machine B (Frontend)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  macOS • Codex / OpenCode
                </span>
              </div>

              {/* Agent & Consumer Metadata */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono bg-[#F8F9FA] p-2.5 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-neutral-700 font-semibold">main</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentStep === 1
                        ? 'bg-neutral-400'
                        : currentStep === 2 || currentStep === 3
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      currentStep === 1
                        ? 'text-neutral-500'
                        : currentStep === 2 || currentStep === 3
                        ? 'text-rose-700'
                        : 'text-emerald-700'
                    }`}
                  >
                    {currentStep === 1
                      ? 'IDLE (Clean)'
                      : currentStep === 2 || currentStep === 3
                      ? 'COMPILATION BROKEN'
                      : 'PASSED (0 Errors)'}
                  </span>
                </div>
              </div>

              {/* Agent Identity */}
              <div className="mt-3 text-xs font-mono text-neutral-600 flex items-center justify-between">
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <span>@pact-verify</span>
                  <span className="text-[10px] text-neutral-400 font-normal">(addressing: owner-agents)</span>
                </span>
                <span className="text-[10px] text-neutral-500">workspaces/frontend-consumer</span>
              </div>

              {/* Consumer React Component Window */}
              <div className="mt-3 rounded-xl border border-emerald-200 bg-[#F8FAFC] overflow-hidden shadow-inner">
                <div className="px-3 py-1.5 bg-[#F1F5F9] border-b border-emerald-100 flex items-center justify-between text-[11px] font-mono text-neutral-600">
                  <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 text-emerald-600" />
                    <span>src/components/CheckoutSummary.tsx</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">React Consumer</span>
                </div>

                <div className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto text-neutral-800">
                  <div className="text-neutral-400">// Checkout summary contract access</div>
                  <div className="text-emerald-800 font-semibold">export const CheckoutSummary = (&#123; order &#125;) =&gt; &#123;</div>

                  {currentStep >= 2 && currentStep < 4 ? (
                    <div className="my-1.5 bg-rose-50 border-l-2 border-rose-500 p-2 rounded-r">
                      <div className="text-rose-700 font-semibold">
                        const total = formatCurrency(order.total_amount_cents);
                      </div>
                      <div className="text-rose-600 text-[10px] mt-1">
                        💥 TS2339: Property &apos;total_amount_cents&apos; does not exist on type &apos;OrderResponse&apos;.
                      </div>
                    </div>
                  ) : currentStep === 4 && selectedOption === 'B' ? (
                    <div className="my-1.5 bg-emerald-50 border-l-2 border-emerald-500 p-2 rounded-r">
                      <div className="text-emerald-800 font-semibold">
                        + const total = formatCurrency(
                      </div>
                      <div className="text-emerald-800 pl-4">
                        + order.pricing_breakdown?.amount_minor ?? order.total_amount_cents
                      </div>
                      <div className="text-emerald-800">
                        + );
                      </div>
                    </div>
                  ) : (
                    <div className="pl-3 text-neutral-700">
                      const total = formatCurrency(order.total_amount_cents);
                    </div>
                  )}

                  <div className="pl-3 text-neutral-700">return &lt;div&gt;&#123;total&#125;&lt;/div&gt;;</div>
                  <div className="text-emerald-800 font-semibold">&#125;;</div>
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Box */}
            <div className="mt-4 p-3 rounded-xl bg-[#F8F9FA] border border-neutral-200 text-[11px] font-mono">
              <div className="text-neutral-500 flex items-center justify-between mb-1.5">
                <span>Compiler Diagnostic</span>
                <span className="text-emerald-700 font-semibold">tsc: exit code 0</span>
              </div>
              <div className="text-neutral-700 text-[10px] leading-tight">
                {currentStep < 2 && (
                  <span className="text-neutral-500">
                    Watching for incoming contract diffs from Switch room.
                  </span>
                )}
                {(currentStep === 2 || currentStep === 3) && (
                  <span className="text-rose-700 font-semibold">
                    🚨 1 compilation error &amp; 1 Vitest suite failed. Build blocked before commit.
                  </span>
                )}
                {currentStep === 4 && (
                  <span className="text-emerald-700 font-semibold">
                    ✅ All 9 Vitest contract tests passing. Code is ready to ship.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
