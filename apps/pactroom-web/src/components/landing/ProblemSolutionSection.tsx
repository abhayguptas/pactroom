'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  GitPullRequest,
  Laptop,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Lock
} from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section id="problem-solution" className="py-20 sm:py-28 relative overflow-hidden bg-neutral-900 text-white">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-orange-300 text-[11px] font-mono font-medium border border-white/10 mb-4">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
            <span>The Silent Multi-Agent Blindspot</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold leading-[1.12] tracking-tight">
            Solo AI Coding Agents Are Blind to Other Developer Laptops
          </h2>
          <p className="mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
            When your backend agent refactors an API contract on an uncommitted branch, your frontend teammate&apos;s agent has no way of knowing. Here is why existing developer workflows fail.
          </p>
        </div>

        {/* 3-Column Problem Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-left">
          {/* Box 1: Uncommitted Local Drift */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm relative group hover:border-rose-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
              <Laptop className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-1">
              Machine A • Backend Engineer
            </div>
            <h3 className="text-lg font-sans font-bold text-white mb-2">
              Dirty Working Tree Drift
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Alex refactors <code className="text-rose-300 font-mono">total_amount_cents</code> into nested <code className="text-rose-300 font-mono">pricing_breakdown</code>. The changes are uncommitted on local disk. Git HEAD is clean, and no commit has been pushed.
            </p>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-rose-300">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Git remote &amp; CI see 0 changes</span>
            </div>
          </div>

          {/* Box 2: Solo AI Tools Are Isolated */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm relative group hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-1">
              Solo AI Coding Agents
            </div>
            <h3 className="text-lg font-sans font-bold text-white mb-2">
              The Cross-Host Blindspot
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Claude Code, Cursor, or OpenCode running on Machine A can only inspect Machine A&apos;s filesystem. They cannot reach Machine B&apos;s frontend repo across local subnets or corporate firewalls.
            </p>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-amber-300">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Zero cross-machine coordination</span>
            </div>
          </div>

          {/* Box 3: Downstream Breakage */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm relative group hover:border-rose-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-semibold mb-1">
              Machine B • Frontend Engineer
            </div>
            <h3 className="text-lg font-sans font-bold text-white mb-2">
              Broken Builds 3 Hours Later
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Sam on Machine B spends the afternoon writing components against the old contract. When Alex finally pushes, GitHub Actions CI breaks. Both engineers waste half a day in emergency Slack threads.
            </p>
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] font-mono text-rose-300">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>20-40 min CI cycle latency</span>
            </div>
          </div>
        </div>

        {/* The PactRoom Solution Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-neutral-800/40 border border-orange-500/30 text-left relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-[11px] font-mono font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>The Solution: PactRoom + Switch Protocol</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
                Deterministic Contract Negotiation in a Shared Switch Room
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                PactRoom uses the Switch room protocol to connect the local backend agent (<code className="text-orange-300 font-mono">@pact-watch</code>) with the local frontend agent (<code className="text-emerald-300 font-mono">@pact-verify</code>). It AST-diffs uncommitted schemas in 14ms, runs real <code className="text-emerald-300 font-mono">tsc --noEmit</code> on Machine B, and strictly holds patches behind a two-key human gate (<code className="text-amber-300 font-mono">auto_approve: false</code>).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full lg:w-auto">
              <a
                href="#evaluator-guide"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-xs transition-all shadow-md text-center"
              >
                Evaluator Test Guide
              </a>
              <a
                href="/studio"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-all shadow-md text-center"
              >
                Launch Studio →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

