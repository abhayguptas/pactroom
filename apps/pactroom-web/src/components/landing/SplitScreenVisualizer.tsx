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
  Code2,
  Lock,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export interface VisualizerStep {
  id: number;
  stepNum: string;
  label: string;
  badge: string;
  description: string;
}

const STEPS: VisualizerStep[] = [
  {
    id: 1,
    stepNum: '01',
    label: 'Uncommitted Backend Mutation',
    badge: 'Machine A (Dirty Git)',
    description: 'Backend engineer alters orders.dto.ts locally. @pact-watch extracts live OpenAPI 3.1 diff before commit.'
  },
  {
    id: 2,
    stepNum: '02',
    label: 'Cross-Machine Typecheck Failure',
    badge: 'Machine B (tsc regressed)',
    description: '@pact-verify pulls candidate contract and runs real tsc --noEmit. Catches TS2339 on CheckoutSummary.tsx:22.'
  },
  {
    id: 3,
    stepNum: '03',
    label: 'Human Approval Gate in Switch Room',
    badge: 'Switch Chamber (auto_approve: false)',
    description: '@pact-sync proposes Option A vs Option B. Requires dual developer sign-off in Slack before touching code.'
  },
  {
    id: 4,
    stepNum: '04',
    label: 'Synchronized Auto-Patch Green',
    badge: 'Both Machines (0 Errors)',
    description: 'Target repository auto-patched in-place. tsc --noEmit and Vitest re-run with 100% green exit code 0.'
  }
];

export const SplitScreenVisualizer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B'>('B');
  const [activeTab, setActiveTab] = useState<'machineA' | 'machineB' | 'terminal'>('machineA');

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 4) return 1;
        return prev + 1;
      });
    }, 5500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync active code tab with current step
  useEffect(() => {
    if (currentStep === 1) {
      setActiveTab('machineA');
    } else if (currentStep === 2) {
      setActiveTab('machineB');
    } else if (currentStep === 4) {
      setActiveTab('machineB');
    }
  }, [currentStep]);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setIsPlaying(false);
  };

  const handleOptionSelect = (opt: 'A' | 'B') => {
    setSelectedOption(opt);
    setCurrentStep(4);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedOption('B');
    setActiveTab('machineA');
    setIsPlaying(true);
  };

  return (
    <div id="visualizer" className="relative w-full py-16 scroll-mt-24">
      {/* Visualizer Shell (High-End Linear / Stripe Standard) */}
      <div className="rounded-3xl border border-neutral-200/90 bg-white shadow-xl overflow-hidden">
        {/* Top Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-neutral-200 bg-[#FAFAF8]">
          {/* Left: Product Sub-badge & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shadow-soft-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wider">
                  Live Interactive Simulation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Two Laptops • One Switch Room
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                Observe cross-machine contract negotiation and automatic repair before git push.
              </p>
            </div>
          </div>

          {/* Right: Scrubber Play/Pause Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-all shadow-soft-sm active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-orange-600" />
                  <span>Pause Demo</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Play Demo</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors shadow-soft-sm active:scale-95"
              title="Reset Simulation"
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
                className={`p-4 text-left transition-all relative border-r border-neutral-200 last:border-r-0 ${
                  isActive
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:bg-[#ECECE9] hover:text-neutral-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeScrubberIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500"
                  />
                )}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-neutral-400">
                    STEP {step.stepNum}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  )}
                </div>
                <div
                  className={`font-semibold text-xs leading-snug line-clamp-1 ${
                    isActive
                      ? 'text-neutral-900'
                      : isCompleted
                      ? 'text-neutral-700'
                      : 'text-neutral-500'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-1">
                  {step.badge}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Context Bar */}
        <div className="px-6 py-2.5 bg-orange-50/40 border-b border-orange-100/80 flex items-center justify-between text-xs text-neutral-700 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-orange-800 font-bold">Phase {currentStep} of 4:</span>
            <span className="text-neutral-800 font-medium">
              {STEPS[currentStep - 1].description}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-neutral-400 text-[11px]">
            <span>Click any step to inspect state</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DUAL-PANE WORKBENCH (Spacious 7:5 Split)                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 min-h-[580px]">
          {/* ======================================================================= */}
          {/* LEFT PANE: CODE & DIAGNOSTIC WORKSPACE (7 Columns, ~650px wide)        */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white text-left overflow-hidden">
            <div>
              {/* Workspace Tab Switcher */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 bg-[#FAFAF8]">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {/* Tab 1: Machine A */}
                  <button
                    onClick={() => setActiveTab('machineA')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === 'machineA'
                        ? 'bg-white text-sky-800 border border-sky-200 shadow-soft-sm'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-sky-600" />
                    <span>Machine A: orders.dto.ts</span>
                    {currentStep >= 1 && currentStep < 4 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>

                  {/* Tab 2: Machine B */}
                  <button
                    onClick={() => setActiveTab('machineB')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === 'machineB'
                        ? 'bg-white text-emerald-800 border border-emerald-200 shadow-soft-sm'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Machine B: CheckoutSummary.tsx</span>
                    {currentStep === 2 || currentStep === 3 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    ) : currentStep === 4 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>

                  {/* Tab 3: Terminal Logs */}
                  <button
                    onClick={() => setActiveTab('terminal')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeTab === 'terminal'
                        ? 'bg-white text-neutral-800 border border-neutral-200 shadow-soft-sm'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Compiler Output</span>
                  </button>
                </div>

                {/* Git Branch Badge */}
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
                  <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                  <span>
                    {activeTab === 'machineA' ? 'feat/pricing-v2' : 'main'}
                  </span>
                </div>
              </div>

              {/* Code Window Area */}
              <div className="p-5 font-mono text-[13px] leading-relaxed bg-[#FFFFFF] overflow-x-auto min-h-[380px]">
                {/* --------------------------------------------------------------- */}
                {/* VIEW 1: MACHINE A (BACKEND DTO)                                */}
                {/* --------------------------------------------------------------- */}
                {activeTab === 'machineA' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 text-xs pb-3 mb-2 border-b border-neutral-100 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-700 font-semibold">
                          workspaces/backend-api/src/routes/orders.dto.ts
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono">
                          OpenAPI 3.1 DTO
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {currentStep === 4 ? 'Synced & Clean' : 'Uncommitted Local Change'}
                      </span>
                    </div>

                    <div className="text-neutral-400">// OrderResponseSchema definition for GET /api/v1/orders/:id</div>
                    <div className="text-neutral-800">
                      <span className="text-violet-600 font-semibold">export const</span>{' '}
                      <span className="text-sky-700 font-bold">OrderResponseSchema</span> = z.object({'{'}
                    </div>
                    <div className="pl-6 text-neutral-700">id: z.string().uuid(),</div>

                    {/* Diff lines dynamically shown based on step & option */}
                    {currentStep === 4 && selectedOption === 'A' ? (
                      <div className="bg-emerald-50/70 border-l-4 border-emerald-500 pl-4 py-1.5 my-1.5 rounded-r">
                        <div className="text-emerald-800 font-semibold">
                          + pricing_breakdown: z.object({'{ ... }'}),
                        </div>
                        <div className="text-amber-800 text-xs mt-0.5">
                          + /** @deprecated Backward-compatible getter alias */
                        </div>
                        <div className="text-emerald-800 font-semibold">
                          + total_amount_cents: z.number().optional(),
                        </div>
                      </div>
                    ) : currentStep >= 1 ? (
                      <div className="my-1.5 space-y-0.5">
                        <div className="bg-rose-50 text-rose-700 border-l-4 border-rose-400 pl-4 py-0.5 line-through">
                          - total_amount_cents: z.number(),
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 pl-4 py-0.5 font-semibold">
                          + pricing_breakdown: z.object({'{'}
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 pl-8 py-0.5">
                          + amount_minor: z.number(),
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 pl-8 py-0.5">
                          + currency_code: z.string()
                        </div>
                        <div className="bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 pl-4 py-0.5 font-semibold">
                          + {'}'}),
                        </div>
                      </div>
                    ) : (
                      <div className="pl-6 text-neutral-700">total_amount_cents: z.number(),</div>
                    )}

                    <div className="pl-6 text-neutral-700">
                      status: z.enum([&quot;PENDING&quot;, &quot;PAID&quot;, &quot;SHIPPED&quot;])
                    </div>
                    <div className="text-neutral-800">{'}'});</div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* VIEW 2: MACHINE B (FRONTEND CONSUMER)                          */}
                {/* --------------------------------------------------------------- */}
                {activeTab === 'machineB' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-neutral-400 text-xs pb-3 mb-2 border-b border-neutral-100 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-700 font-semibold">
                          workspaces/frontend-consumer/src/components/CheckoutSummary.tsx
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                          React Consumer
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                          currentStep === 2 || currentStep === 3
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : currentStep === 4
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {currentStep === 2 || currentStep === 3
                          ? 'Compilation Error TS2339'
                          : currentStep === 4
                          ? 'Auto-Patched & Clean'
                          : 'Idle (Clean)'}
                      </span>
                    </div>

                    <div className="text-neutral-400">// Order summary component reading API response</div>
                    <div className="text-neutral-800">
                      <span className="text-violet-600 font-semibold">export const</span>{' '}
                      <span className="text-emerald-700 font-bold">CheckoutSummary</span> = ({'{ order }'}: CheckoutProps) =&gt; {'{'}
                    </div>

                    {/* Step 2 & 3: Compilation Error Callout */}
                    {currentStep >= 2 && currentStep < 4 ? (
                      <div className="my-2 space-y-1.5">
                        <div className="bg-rose-50 text-rose-800 border-l-4 border-rose-500 pl-4 py-1.5 rounded-r">
                          <div className="font-semibold">
                            const total = formatCurrency(order.total_amount_cents);
                          </div>
                        </div>
                        {/* Inline Senior Compiler Diagnostic */}
                        <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs font-mono space-y-1">
                          <div className="flex items-center gap-2 font-bold text-rose-700">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>TypeScript Diagnostic (tsc --noEmit)</span>
                          </div>
                          <div className="text-rose-800 pl-6">
                            error TS2339: Property &apos;total_amount_cents&apos; does not exist on type &apos;OrderResponse&apos;.
                          </div>
                          <div className="text-neutral-600 pl-6 text-[11px]">
                            Did you mean &apos;pricing_breakdown&apos;? PactRoom detected this before git commit.
                          </div>
                        </div>
                      </div>
                    ) : currentStep === 4 && selectedOption === 'B' ? (
                      /* Step 4 (Option B): Clean Patched Code */
                      <div className="my-2 bg-emerald-50/80 border-l-4 border-emerald-500 pl-4 py-2 rounded-r space-y-1">
                        <div className="text-emerald-900 font-semibold">
                          + const total = formatCurrency(
                        </div>
                        <div className="text-emerald-800 pl-4">
                          + order.pricing_breakdown?.amount_minor ?? order.total_amount_cents
                        </div>
                        <div className="text-emerald-900 font-semibold">
                          + );
                        </div>
                      </div>
                    ) : (
                      <div className="pl-6 text-neutral-700">
                        const total = formatCurrency(order.total_amount_cents);
                      </div>
                    )}

                    <div className="pl-6 text-neutral-700">
                      return &lt;div className=&quot;checkout-total&quot;&gt;{'{total}'}&lt;/div&gt;;
                    </div>
                    <div className="text-neutral-800">{'}'};</div>
                  </div>
                )}

                {/* --------------------------------------------------------------- */}
                {/* VIEW 3: TERMINAL & TEST RUNNER OUTPUT                          */}
                {/* --------------------------------------------------------------- */}
                {activeTab === 'terminal' && (
                  <div className="bg-neutral-900 text-neutral-200 p-4 rounded-xl font-mono text-xs space-y-2 border border-neutral-800 shadow-inner">
                    <div className="flex items-center justify-between text-neutral-400 pb-2 border-b border-neutral-800 text-[11px]">
                      <span>Machine B Terminal Session • zsh</span>
                      <span>tsc --noEmit &amp;&amp; vitest</span>
                    </div>

                    {currentStep < 2 ? (
                      <div className="text-neutral-400">
                        $ git status<br />
                        On branch main. Your branch is up to date with &apos;origin/main&apos;.<br />
                        nothing to commit, working tree clean.
                      </div>
                    ) : currentStep === 2 || currentStep === 3 ? (
                      <div className="space-y-1.5 text-neutral-300">
                        <div className="text-neutral-400">$ pnpm tsc --noEmit</div>
                        <div className="text-rose-400 font-semibold">
                          src/components/CheckoutSummary.tsx:22:38 - error TS2339: Property &apos;total_amount_cents&apos; does not exist on type &apos;OrderResponse&apos;.
                        </div>
                        <div className="text-rose-400 pl-4">
                          22 const total = formatCurrency(order.total_amount_cents);<br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;~~~~~~~~~~~~~~~~~~
                        </div>
                        <div className="text-neutral-400 pt-2">$ pnpm vitest run</div>
                        <div className="text-rose-400">
                          FAIL tests/contracts/order-contract.test.ts (1 failed, 8 passed)
                        </div>
                        <div className="text-amber-300 text-[11px] pt-1">
                          Build halted by PactRoom verification hook. Exit code 1.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-neutral-300">
                        <div className="text-neutral-400">$ pnpm tsc --noEmit</div>
                        <div className="text-emerald-400 font-semibold">
                          ✔ TypeScript compilation successful (0 errors, 0 warnings).
                        </div>
                        <div className="text-neutral-400 pt-2">$ pnpm vitest run</div>
                        <div className="text-emerald-400">
                          PASS tests/contracts/order-contract.test.ts (9/9 passed in 44ms)
                        </div>
                        <div className="text-emerald-300 text-[11px] pt-1">
                          ✔ All cross-machine contracts ratified. Build green (Exit code 0).
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status Drawer */}
            <div className="p-4 bg-[#FAFAF8] border-t border-neutral-200 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentStep === 4
                      ? 'bg-emerald-500'
                      : currentStep === 2 || currentStep === 3
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="font-semibold text-neutral-800">
                  {currentStep === 1 && 'Machine A: OpenAPI 3.1 Contract Diff Generated'}
                  {currentStep === 2 && 'Machine B: 1 Compilation Failure Caught Locally'}
                  {currentStep === 3 && 'Switch Chamber: Holding Uncommitted Backend Branch'}
                  {currentStep === 4 && 'Consensus Reached: 0 Breaking Changes Remaining'}
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                Local-first • Pre-push
              </span>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT PANE: SWITCH ROOM CONSENSUS CHAMBER (5 Columns, ~500px wide)     */}
          {/* ======================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#FCFCFA] text-left">
            <div>
              {/* Room Top Header */}
              <div className="p-3.5 border-b border-neutral-200 bg-[#FAFAF8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-violet-600" />
                  <span className="font-semibold text-xs text-neutral-800 font-mono uppercase tracking-wider">
                    Switch Room
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 font-semibold">
                    #pactflow-api-contracts
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Slack &amp; Discord Bridged</span>
                </div>
              </div>

              {/* Chat Thread Messages Stream */}
              <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
                {/* Step 1 Message: Watcher alert */}
                <div className="p-3.5 rounded-2xl bg-white border border-sky-200 shadow-soft-sm text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-sky-700 mb-1.5">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      @pact-watch (Machine A)
                    </span>
                    <span className="text-neutral-400">18:42:01</span>
                  </div>
                  <p className="text-neutral-800 text-xs leading-relaxed font-sans">
                    Uncommitted schema mutation detected in <code className="bg-sky-50 text-sky-800 px-1 py-0.5 rounded font-mono text-[11px]">orders.dto.ts</code> on branch <code className="bg-neutral-100 text-neutral-800 px-1 py-0.5 rounded font-mono text-[11px]">feat/pricing-v2</code>.
                  </p>
                  <div className="mt-2 text-[11px] font-mono bg-sky-50/60 border border-sky-100 rounded-lg p-2 text-sky-900">
                    GET /api/v1/orders/:id: removed <span className="line-through text-rose-600">total_amount_cents</span>, added <span className="text-emerald-700 font-semibold">pricing_breakdown</span>.
                  </div>
                </div>

                {/* Step 2 Message: Verifier report */}
                {currentStep >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-soft-sm text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-rose-700 mb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        @pact-verify (Machine B)
                      </span>
                      <span className="text-neutral-400">18:42:04</span>
                    </div>
                    <p className="text-neutral-800 text-xs leading-relaxed font-sans">
                      Ran <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[11px]">tsc --noEmit</code> against candidate schema. Discovered 1 critical breakage in frontend codebase.
                    </p>
                    <div className="mt-2 text-[11px] font-mono bg-rose-50/70 border border-rose-200 rounded-lg p-2 text-rose-900">
                      TS2339 in CheckoutSummary.tsx:22. Consumer expecting total_amount_cents.
                    </div>
                  </motion.div>
                )}

                {/* Step 3 Message: Synchronizer Human Approval Gate */}
                {currentStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 shadow-soft-sm text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-amber-900 mb-2">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        @pact-sync (Arbitrator)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-950 font-bold">
                        auto_approve: false
                      </span>
                    </div>

                    <p className="text-neutral-900 text-xs font-medium leading-relaxed mb-3">
                      Human approval required. Choose resolution plan before touching any code:
                    </p>

                    {/* Interactive Selection Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleOptionSelect('A')}
                        className={`w-full p-2.5 text-left rounded-xl border transition-all active:scale-[0.98] ${
                          selectedOption === 'A'
                            ? 'bg-white border-sky-400 ring-2 ring-sky-200 shadow-sm'
                            : 'bg-white/80 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-900 text-xs">
                          <span>Option A: Backend Backward-Compat Alias</span>
                          {selectedOption === 'A' && (
                            <Check className="w-4 h-4 text-sky-600 font-bold" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                          Keep total_amount_cents as computed getter alias on Machine A.
                        </p>
                      </button>

                      <button
                        onClick={() => handleOptionSelect('B')}
                        className={`w-full p-2.5 text-left rounded-xl border transition-all active:scale-[0.98] ${
                          selectedOption === 'B'
                            ? 'bg-white border-emerald-400 ring-2 ring-emerald-200 shadow-sm'
                            : 'bg-white/80 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-900 text-xs">
                          <span>Option B: Frontend Synchronized Patch</span>
                          {selectedOption === 'B' && (
                            <Check className="w-4 h-4 text-emerald-600 font-bold" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 font-sans mt-0.5">
                          Auto-patch CheckoutSummary.tsx on Machine B to read new structure.
                        </p>
                      </button>
                    </div>

                    <div className="mt-3 text-[10px] text-amber-900 flex items-center gap-1.5 font-mono">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Approved by: @alex.be (Backend) &amp; @sam.fe (Frontend)</span>
                    </div>
                  </motion.div>
                )}

                {/* Step 4 Message: Ratified resolution */}
                {currentStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-soft-sm text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-emerald-800 mb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        @pact-sync • Ratified
                      </span>
                      <span className="text-neutral-400">18:42:12</span>
                    </div>
                    <p className="text-emerald-950 text-xs leading-relaxed font-sans">
                      Contract ratified via <strong>Option {selectedOption}</strong>. Automated patch applied in-place. Re-ran <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono text-[11px]">tsc --noEmit</code> (0 errors) and <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono text-[11px]">vitest</code> (9/9 passing).
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Room Channel Stats */}
            <div className="p-3.5 border-t border-neutral-200 bg-white flex items-center justify-between text-xs font-mono text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span>3 Agents • 2 Human Engineers</span>
              </span>
              <span className="text-emerald-700 font-semibold">
                pactroom.db: 4 signed events
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
