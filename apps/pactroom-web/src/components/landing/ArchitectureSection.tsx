'use client';

import React from 'react';
import {
  Layers,
  Laptop,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Database,
  Sparkles
} from 'lucide-react';

export const ArchitectureSection: React.FC = () => {
  return (
    <section id="architecture" className="relative py-20 sm:py-28 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-medium shadow-sm mb-4">
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>Under the Hood</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold text-neutral-900 leading-[1.12] tracking-tight">
            The 3-Pillar Cross-Machine Architecture
          </h2>
          <p className="mt-4 text-neutral-600 text-sm sm:text-base leading-relaxed font-normal">
            Engineered from first principles to preserve source code privacy, eliminate false positives through real compiler execution, and enforce strict human approval gates.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* ========================================================================= */}
          {/* PILLAR 1: LOCAL AGENT EXECUTION MESH (Sky Pastel)                         */}
          {/* ========================================================================= */}
          <div className="p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-soft-sm flex flex-col justify-between hover:border-neutral-300 transition-all group">
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                  <Laptop className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  Pillar 01 • Local Mesh
                </span>
              </div>

              <h3 className="text-xl font-sans font-bold text-neutral-900 group-hover:text-sky-700 transition-colors">
                Dual Workstation Local Agent Mesh
              </h3>
              <p className="mt-3 text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Coding agents (Claude Code and Codex / OpenCode) run directly inside local developer repositories on Machine A and Machine B. Zero source code leaves the developer&apos;s machine.
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs text-neutral-700 border-t border-neutral-100 pt-5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Uncommitted Diff Inspection:</strong> Detects dirty schema mutations before <code className="text-sky-800 bg-sky-50 px-1 py-0.5 rounded">git commit</code> or <code className="text-sky-800 bg-sky-50 px-1 py-0.5 rounded">git push</code>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Live OpenAPI 3.1 Extraction:</strong> Extracts live routes and Zod/Pydantic DTOs directly from live TypeScript source.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Subprocess Execution:</strong> Runs real <code className="text-sky-800 bg-sky-50 px-1 py-0.5 rounded">tsc --noEmit</code> and Vitest child processes on Machine B.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 text-[11px] font-mono text-sky-700 flex items-center justify-between">
              <span>Location: Local Developer Machines</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PILLAR 2: SWITCH ROOM PROTOCOL & MULTI-BRIDGE (Warm Peach / Amber)        */}
          {/* ========================================================================= */}
          <div className="p-8 rounded-3xl bg-white border-2 border-orange-200/90 shadow-soft-md flex flex-col justify-between relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-200/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                  Pillar 02 • Switch Room
                </span>
              </div>

              <h3 className="text-xl font-sans font-bold text-neutral-900 group-hover:text-orange-700 transition-colors">
                Multiplexed Switch Room &amp; Mattermost Bridge
              </h3>
              <p className="mt-3 text-neutral-600 text-xs sm:text-sm leading-relaxed">
                The neutral shared negotiation chamber where agents and human engineers collaborate. Mirrors live to Switch Console, Mattermost (:60015), Slack, and Discord via <code className="text-orange-800 bg-orange-50 px-1 py-0.5 rounded font-mono">bridge: $first</code> with dynamic port discovery.
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs text-neutral-700 border-t border-orange-100 pt-5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Two-Way Switch Bridge:</strong> Outbound AST diffs stream to Mattermost; inbound human chat approvals trigger live auto-patches.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Switch Agent Protocol:</strong> Peer-to-peer addressing between <code className="text-orange-800 bg-orange-50 px-1 py-0.5 rounded">@pactroom-watch</code>, <code className="text-orange-800 bg-orange-50 px-1 py-0.5 rounded">@pactroom-verify</code>, and <code className="text-orange-800 bg-orange-50 px-1 py-0.5 rounded">@pactroom-sync</code>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Human Approval Gate:</strong> <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded">auto_approve: false</code> requires dual engineering sign-off before modifying disk.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-Dev Collaboration:</strong> Both developers join via <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">http://&lt;IP&gt;:60015</code> in their local browser.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 text-[11px] font-mono text-orange-700 flex items-center justify-between relative z-10">
              <span>Channel: #pactroom-api-contracts (Mattermost :60015)</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PILLAR 3: IMMUTABLE AUDIT TRAIL & DECISION LOG (Emerald)                  */}
          {/* ========================================================================= */}
          <div className="p-8 rounded-3xl bg-white border border-neutral-200/80 shadow-soft-sm flex flex-col justify-between hover:border-neutral-300 transition-all group">
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Pillar 03 • SQLite Log
                </span>
              </div>

              <h3 className="text-xl font-sans font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                Immutable Room Decisions Log
              </h3>
              <p className="mt-3 text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Every contract proposal, compiler failure, and human ratification decision is written to an immutable SQLite database (<code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-mono">pactroom.db</code>) with full audit history.
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs text-neutral-700 border-t border-neutral-100 pt-5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dual-Signature Audit:</strong> Records exact human engineering approvals (e.g. alex.be + sam.fe) before write actions.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Execution Telemetry:</strong> Stores command runtimes in milliseconds, exit codes, and AST diff records.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>1-Click Atomic Rollback:</strong> Revert any applied patch instantaneously with verifiable exit code 0.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-100 text-[11px] font-mono text-emerald-700 flex items-center justify-between">
              <span>Database: pactroom.db (Local SQLite)</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
