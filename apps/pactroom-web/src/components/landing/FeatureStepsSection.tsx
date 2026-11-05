'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Check,
  GitBranch,
  Terminal,
  ShieldCheck,
  Radio,
  FileCode,
  ArrowRight,
  Laptop,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const FeatureStepsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extract' | 'verify' | 'patch'>('verify');

  return (
    <section id="features" className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* PART 1: "See how PactRoom can streamline your work day" (EXACT LINDY ROW)  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-28">
          {/* Left Column: Editorial Value Proposition & Checklist */}
          <div className="lg:col-span-5 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-medium shadow-sm mb-6">
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Key Features</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-sans font-bold text-neutral-900 leading-[1.12] tracking-tight">
              See how PactRoom can streamline your work day.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              Early detection and real cross-machine verification before broken code reaches CI or breaks your teammates.
            </p>

            <div className="mt-10 pt-8 border-t border-neutral-200">
              <h3 className="text-lg font-sans text-neutral-900 font-bold mb-2">
                Tell it what to do. It&apos;s done.
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                Refactor a DTO field, update a database model, or introduce a breaking payload. PactRoom handles the cross-machine back-and-forth so you can move on with your day.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-neutral-700 font-medium">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart Pre-Commit AST Schema Diffing</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cross-Machine Subprocess Verification (<code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">tsc</code> + <code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">vitest</code>)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Two-Key Human Approval Gate (<code className="font-mono text-xs bg-neutral-100 px-1 py-0.5 rounded">auto_approve: false</code>)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Atomic Non-Destructive Auto-Patching & Rollback</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Soft Pastel Container housing Interactive App Card */}
          <div className="lg:col-span-7">
            <div className="bg-[#EEF2F6] rounded-3xl p-6 sm:p-8 border border-neutral-200/70 shadow-soft-md">
              <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-md p-6 text-left">
                {/* App Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold text-sm">✦</span>
                    <span className="font-semibold text-xs text-neutral-800">PactRoom Live Verification Schedule</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg text-[10px] font-medium text-neutral-600">
                    <button
                      onClick={() => setActiveTab('extract')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'extract' ? 'bg-white text-neutral-900 shadow-sm font-semibold' : 'hover:text-neutral-900'}`}
                    >
                      Machine A (Watch)
                    </button>
                    <button
                      onClick={() => setActiveTab('verify')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'verify' ? 'bg-white text-neutral-900 shadow-sm font-semibold' : 'hover:text-neutral-900'}`}
                    >
                      Machine B (Verify)
                    </button>
                    <button
                      onClick={() => setActiveTab('patch')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'patch' ? 'bg-white text-neutral-900 shadow-sm font-semibold' : 'hover:text-neutral-900'}`}
                    >
                      Switch Room (Gate)
                    </button>
                  </div>
                </div>

                {/* Interactive State Content */}
                <div className="py-6">
                  {activeTab === 'extract' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">Local Git Working Tree Inspector</span>
                        <span className="text-sky-600 font-mono text-[11px] font-medium">workspaces/backend-api</span>
                      </div>
                      <div className="bg-[#F8F9FA] rounded-xl border border-neutral-200 p-4 font-mono text-xs text-neutral-700 space-y-1.5 overflow-x-auto">
                        <div className="text-neutral-400"># Extracting OpenAPI 3.1 contract from dirty disk...</div>
                        <div className="text-rose-600">- total_amount_cents: number</div>
                        <div className="text-emerald-600">+ pricing_breakdown: &#123; amount_minor: number, tax_minor: number &#125;</div>
                        <div className="text-neutral-500">Diff detected in 14ms. Notification dispatched to Switch room.</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'verify' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">Child Process Compiler Diagnostics</span>
                        <span className="text-rose-600 font-mono text-[11px] font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">2 Failures Discovered</span>
                      </div>
                      <div className="bg-[#F8F9FA] rounded-xl border border-neutral-200 p-4 font-mono text-xs text-neutral-700 space-y-1.5 overflow-x-auto">
                        <div className="text-neutral-400">$ tsc --noEmit --project workspaces/frontend-consumer/tsconfig.json</div>
                        <div className="text-rose-600 font-semibold">src/components/CheckoutSummary.tsx(22,39): error TS2339: Property &apos;total_amount_cents&apos; does not exist on type &apos;OrderResponse&apos;.</div>
                        <div className="text-neutral-500">Vitest contract test failed: orders.test.ts (exit code 1)</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'patch' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">Immutable Switch Room Decisions</span>
                        <span className="text-emerald-600 font-mono text-[11px] font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Option B Ratified</span>
                      </div>
                      <div className="bg-[#F8F9FA] rounded-xl border border-neutral-200 p-4 font-mono text-xs text-neutral-700 space-y-1.5 overflow-x-auto">
                        <div className="text-neutral-400"># Human Gate Decision Record (SQLite)</div>
                        <div>Option: &quot;B_SYNC_FRONTEND_PATCH&quot;</div>
                        <div>Approved by: Alex (Backend Lead) &amp; Sam (Frontend Lead)</div>
                        <div className="text-emerald-600">Patch applied cleanly to CheckoutSummary.tsx. Compiler re-verified: 0 Errors.</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* App Card Bottom Stats */}
                <div className="pt-4 border-t border-neutral-100 grid grid-cols-3 gap-4 text-left">
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Discovery Speed</div>
                    <div className="text-sm font-bold text-neutral-800 font-mono">14 ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Human Approval</div>
                    <div className="text-sm font-bold text-amber-700 font-mono">Required</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 uppercase font-semibold">Cloud Egress</div>
                    <div className="text-sm font-bold text-emerald-700 font-mono">0 bytes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART 2: "Three Simple Steps" (EXACT LINDY 3-CARD ROW)                     */}
        {/* ========================================================================= */}
        <div id="three-steps" className="pt-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-sans font-bold text-neutral-900 leading-[1.12] tracking-tight">
              Three Simple Steps
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-600">
              How PactRoom connects local developer agents over the Switch Agent Protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 Card: Connect Your Tools */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-soft-sm p-7 text-left hover:border-neutral-300 transition-all group">
              <div className="h-44 rounded-xl bg-[#F8F9FA] border border-neutral-100 flex items-center justify-center p-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-sky-600 font-mono font-bold text-xs">
                    Machine A
                  </div>
                  <div className="h-0.5 w-10 bg-orange-400/60" />
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold">
                    ✦
                  </div>
                  <div className="h-0.5 w-10 bg-orange-400/60" />
                  <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-emerald-600 font-mono font-bold text-xs">
                    Machine B
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-sans text-neutral-900 font-bold mb-2">
                Connect Your Tools
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Import <code className="font-mono text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">pactroom.template.yaml</code> into Switch Console or mirror into Slack in seconds.
              </p>
            </div>

            {/* Step 2 Card: Learns from your feedback */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-soft-sm p-7 text-left hover:border-neutral-300 transition-all group">
              <div className="h-44 rounded-xl bg-[#F8F9FA] border border-neutral-100 flex flex-col justify-center p-4 mb-6 font-mono text-[11px] text-neutral-700 space-y-2">
                <div className="bg-white border border-neutral-200 rounded-lg p-2 text-sky-700 shadow-soft-sm">
                  ✓ @pact-watch: OpenAPI 3.1 diff extracted
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-2 text-rose-700 shadow-soft-sm">
                  ✗ @pact-verify: TS2339 failure discovered
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-2 text-amber-700 shadow-soft-sm">
                  ⏳ @pact-sync: Option B awaiting human sign-off
                </div>
              </div>
              <h3 className="text-lg font-sans text-neutral-900 font-bold mb-2">
                Learns from your feedback
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Decisions are saved over time to adjust to your team&apos;s architectural preferences, backward-compatibility rules, and priorities.
              </p>
            </div>

            {/* Step 3 Card: Works anywhere, 24/7 */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-soft-sm p-7 text-left hover:border-neutral-300 transition-all group">
              <div className="h-44 rounded-xl bg-[#F8F9FA] border border-neutral-100 flex flex-col justify-center items-center p-4 mb-6">
                <div className="w-full max-w-[200px] bg-white border border-neutral-200 rounded-xl p-3 shadow-soft-sm text-left font-mono text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>#api-contracts</span>
                    <span className="text-emerald-600 font-bold">ACTIVE</span>
                  </div>
                  <div className="text-neutral-800 font-sans font-semibold text-xs">
                    Human Approved Option B
                  </div>
                  <div className="text-emerald-700">
                    ✓ useOrderSummary.tsx patched
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-sans text-neutral-900 font-bold mb-2">
                Works anywhere, 24/7
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Communicate directly inside tasks, share contract diffs, and collaborate with zero scattered messages across channels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
