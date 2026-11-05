'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Lock,
  Layers,
  Terminal
} from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  return (
    <section id="comparison" className="py-20 sm:py-28 relative overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-medium shadow-sm mb-6">
          <Sparkles className="w-3 h-3 text-orange-400" />
          <span>Open Source Access &amp; Future GTM Roadmap</span>
        </div>

        {/* Serif Headline (Lindy Typography) */}
        <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-sans font-bold text-neutral-900 leading-[1.12] tracking-tight max-w-3xl mx-auto">
          Built for Hackathon • Engineered for Scale
        </h2>

        <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          The entire PactRoom codebase is <strong>100% Free &amp; Open Source</strong> for the Flip the Switch Hackathon. Below is how our local architecture compares with solo coding tools and our planned commercial cloud roadmap.
        </p>

        {/* 3 Architecture / Tier Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto items-stretch">
          {/* Card 1: Solo Local Agents */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft-sm p-8 flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  Existing Status Quo
                </span>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  Isolated
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-sans font-bold text-neutral-900 tracking-tight">
                  Solo Agents
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Single-machine coding tools (Claude Code alone, Cursor alone, GitHub Copilot).
              </p>

              <div className="mt-6 py-2 px-3 rounded-xl bg-neutral-50 text-[11px] font-mono text-neutral-600 border border-neutral-100">
                Single machine boundaries
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-4 font-mono">
                  Capabilities &amp; Blindspots
                </div>
                <div className="space-y-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Single-machine filesystem edits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>Prompt-based refactoring</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-neutral-400">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Blind to other developer laptops</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-neutral-400">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>No cross-machine compiler checks</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-neutral-400">
                    <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Zero shared room decision records</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 text-[11px] font-mono text-neutral-400">
              Breakages discovered only post-merge
            </div>
          </div>

          {/* Card 2: PactRoom Open Source (Featured with Warm Sunset Peach Glow like Lindy) */}
          <div className="relative bg-white rounded-3xl border-2 border-orange-300 shadow-xl p-8 flex flex-col justify-between overflow-hidden">
            {/* Sunset Glow in Card Bottom */}
            <div className="absolute inset-0 pointer-events-none sunset-glow-card opacity-80" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider font-mono">
                  Hackathon Edition
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-mono">
                  100% FREE &amp; OPEN
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-sans font-bold text-neutral-900 tracking-tight">
                  PactRoom Monorepo
                </span>
              </div>
              <p className="text-xs text-neutral-600 mt-2 font-medium leading-relaxed">
                Full deterministic AST engine + 4-panel visual studio + self-hosted SQLite.
              </p>

              <Link
                href="/studio"
                className="mt-6 w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-xs flex items-center justify-center transition-all shadow-md group"
              >
                <span>Launch Live Studio (Free)</span>
                <Sparkles className="w-3.5 h-3.5 text-orange-400 ml-1.5 group-hover:rotate-12 transition-transform" />
              </Link>

              <div className="mt-8 pt-6 border-t border-neutral-200/80">
                <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-600 mb-4 font-mono">
                  Included in This Repository:
                </div>
                <div className="space-y-3 text-xs text-neutral-800 font-medium">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                    <span>Pre-commit AST schema diffing (<code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[10.5px]">14ms</code>)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                    <span>Real cross-machine <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[10.5px]">tsc</code> &amp; <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[10.5px]">vitest</code> checks</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                    <span>Two-key human approval gate (<code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[10.5px]">auto_approve: false</code>)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                    <span>Immutable SQLite audit ledger (<code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[10.5px]">pactroom.db</code>)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                    <span>Zero cloud code egress (100% local on disk)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-orange-200/80 text-[11px] font-mono text-orange-800 relative z-10 flex items-center justify-between">
              <span>License: MIT • Open Source</span>
              <span className="font-bold">57/57 Tests Passing</span>
            </div>
          </div>

          {/* Card 3: Enterprise Cloud (Future GTM Roadmap) */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft-sm p-8 flex flex-col justify-between hover:border-neutral-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  Future Roadmap
                </span>
                <span className="text-[10px] font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded font-semibold border border-violet-100">
                  Phase 2 / 3
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-sans font-bold text-neutral-900 tracking-tight">
                  PactRoom Cloud
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Hosted mesh relay, Developer CLI/SDK, and centralized team contract governance.
              </p>

              <div className="mt-6 py-2 px-3 rounded-xl bg-violet-50 text-[11px] font-mono text-violet-800 border border-violet-100">
                Aspirational Target: $49/seat/mo
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-4 font-mono">
                  Planned Cloud Capabilities
                </div>
                <div className="space-y-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>PactRoom CLI &amp; SDK (<code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-[10.5px]">npx pactroom init</code>)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>Hosted cloud mesh (no local network required)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>Team API keys &amp; subscription metering</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>Enterprise SSO &amp; multi-repo RBAC</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span>Automated SOC2 audit compliance export</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 text-[11px] font-mono text-neutral-400">
              Actively in development for enterprise teams
            </div>
          </div>
        </div>

        {/* Informative Clarification Note for Evaluators */}
        <div className="mt-12 max-w-4xl mx-auto p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-soft-sm text-left">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-sans font-bold text-neutral-900">
                Why is there no login or SDK package yet?
              </h4>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed font-normal">
                During this hackathon cycle, we prioritized <strong>zero-dependency local execution, zero cloud code egress, and real child-process AST verification</strong> over SaaS billing barriers. Evaluators can clone the repo and run 100% of the platform without creating an account or sending source code to a third-party server. In Phase 2, we will publish the <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">@pactroom/cli</code> npm package with automated Switch workspace path discovery and team API keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
