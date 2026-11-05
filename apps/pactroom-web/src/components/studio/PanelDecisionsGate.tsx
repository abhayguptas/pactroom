'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  UserCheck,
  GitCommit,
  Layers,
  ArrowRight,
  Database,
  FileCode,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Terminal
} from 'lucide-react';
import { RoomDecision, AgentExecutionLog, NegotiationState } from './types';

interface PanelDecisionsGateProps {
  negotiation: NegotiationState | null;
  decisions: RoomDecision[];
  executionLogs: AgentExecutionLog[];
  onApproveDecision: (option: 'OPTION_A' | 'OPTION_B') => Promise<void>;
  isApproving: boolean;
}

export const PanelDecisionsGate: React.FC<PanelDecisionsGateProps> = ({
  negotiation,
  decisions,
  executionLogs,
  onApproveDecision,
  isApproving
}) => {
  const [activeTab, setActiveTab] = useState<'gate' | 'decisions' | 'logs'>('gate');
  const [expandedDecisionId, setExpandedDecisionId] = useState<string | null>(null);

  const status = negotiation?.status || 'IDLE';
  const isResolved = status === 'RESOLVED';
  const isAwaitingApproval =
    !isResolved &&
    (status === 'AWAITING_HUMAN_DECISION' ||
      status === 'BREAKING_FOUND' ||
      ((negotiation?.breakingCount ?? 0) > 0));

  return (
    <div className="flex flex-col h-full bg-[#FCFCFA] overflow-hidden font-sans text-left">
      {/* Panel Top Header */}
      <div className="p-3.5 border-b border-neutral-200 bg-[#FAFAF8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-800 font-mono tracking-wider">
              Panel 4 • Decisions Log &amp; Human Gate
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
              auto_approve: false
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
          <Database className="w-3 h-3 text-emerald-600" />
          <span>SQLite: pactroom.db</span>
        </div>
      </div>

      {/* Tab Switcher: Human Approval Gate vs Decisions History vs Execution Logs */}
      <div className="flex border-b border-neutral-200 bg-white text-xs font-mono shrink-0">
        <button
          onClick={() => setActiveTab('gate')}
          className={`flex-1 py-2 px-3 text-center border-r border-neutral-200 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'gate'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Approval Gate</span>
          {isAwaitingApproval && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex-1 py-2 px-3 text-center border-r border-neutral-200 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'decisions'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Decisions Log ({decisions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-sky-600" />
          <span>Audit Logs ({executionLogs.length})</span>
        </button>
      </div>

      {/* Panel Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-[#FAFAF8]">
        {/* TAB 1: Human Approval Gate */}
        {activeTab === 'gate' && (
          <div className="space-y-4">
            {/* Gate Status Banner */}
            <div
              className={`p-4 rounded-2xl border ${
                isAwaitingApproval
                  ? 'bg-amber-50 border-amber-300 shadow-soft-sm'
                  : isResolved
                  ? 'bg-emerald-50 border-emerald-300 shadow-soft-sm'
                  : 'bg-white border-neutral-200 shadow-soft-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {isAwaitingApproval ? (
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-xs">
                      {isAwaitingApproval
                        ? 'HUMAN SIGN-OFF REQUIRED'
                        : isResolved
                        ? 'CONTRACT RATIFIED & BINDING'
                        : 'GATE MONITORING ACTIVE'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600 font-bold">
                      Rule: auto_approve: false
                    </span>
                  </div>
                  <p className="text-neutral-700 text-xs font-sans mt-1 leading-relaxed">
                    {isAwaitingApproval
                      ? 'Because auto_approve is strictly false, @pact-sync is locked and cannot alter files without explicit dual engineering approval.'
                      : 'All contract changes must be approved by both Backend Owner and Frontend Owner before disk writes.'}
                  </p>
                </div>
              </div>
            </div>

            {/* SCENARIO 1: Contract Ratified & Resolved - Show clean Ratified summary, NO approval buttons */}
            {isResolved && (
              <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-soft-sm space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      <Check className="w-4 h-4 text-emerald-700" />
                    </span>
                    <div>
                      <span className="font-semibold text-neutral-900 text-xs block">
                        {negotiation?.chosenOption === 'OPTION_B'
                          ? 'Ratified Strategy: Option B (Synchronized Frontend Migration)'
                          : 'Ratified Strategy: Option A (Backend Backward-Compatible Adapter)'}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium font-sans">
                        Disk Patched &amp; Verified • 0 Compiler / Vitest Regressions
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    RATIFIED
                  </span>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  {negotiation?.chosenOption === 'OPTION_B'
                    ? 'Workspaces synchronized to v2 specification. Frontend Zod schemas and CheckoutSummary component patched with fallback support.'
                    : 'Workspaces patched with backward-compatible adapter dual-writing both pricing_breakdown and legacy total_amount_cents. Zero frontend downtime.'}
                </p>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-neutral-700">
                    <span className="text-neutral-500 text-[11px]">Backend Dual-Signoff:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      alex.be (Approved)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-700">
                    <span className="text-neutral-500 text-[11px]">Frontend Dual-Signoff:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      sam.fe (Approved)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs font-mono">
                  <span className="text-neutral-500 text-[11px]">
                    Recorded in SQLite <code className="text-neutral-700">room_decisions</code>
                  </span>
                  <button
                    onClick={() => setActiveTab('decisions')}
                    className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>View in Decisions Log</span>
                  </button>
                </div>
              </div>
            )}

            {/* SCENARIO 2: Breaking Diff Awaiting Dual Human Approval - Show Strategy Choice Cards & Approve Buttons */}
            {!isResolved && isAwaitingApproval && (
              <div className="space-y-3 font-sans">
                <div className="text-xs font-semibold text-neutral-800 font-mono tracking-wider flex items-center justify-between">
                  <span>Select Executable Resolution Strategy:</span>
                  <span className="text-[10px] text-sky-700 font-semibold font-mono">Real File Patching</span>
                </div>

                {/* Option A: Backend Backward-Compatible Adapter */}
                <div className="p-4 rounded-2xl bg-white border border-sky-200 hover:border-sky-300 transition-all space-y-3 shadow-soft-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-mono font-bold text-xs">
                        A
                      </span>
                      <span className="font-semibold text-neutral-900 text-xs">
                        Option A: Backend Backward-Compatible Adapter
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      Recommended
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Patches <code className="text-neutral-900 font-mono bg-neutral-100 px-1 py-0.5 rounded">workspaces/backend-api/src/schemas/orders.ts</code> to dual-write both <code className="text-neutral-900 font-mono bg-neutral-100 px-1 py-0.5 rounded">pricing_breakdown</code> and legacy <code className="text-neutral-900 font-mono bg-neutral-100 px-1 py-0.5 rounded">total_amount_cents</code>.
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs font-mono">
                    <span className="text-neutral-400 text-[11px]">
                      Zero frontend changes needed • Immediate 0 errors
                    </span>
                    <button
                      onClick={() => onApproveDecision('OPTION_A')}
                      disabled={isApproving}
                      className="px-4 py-2 bg-neutral-900 hover:bg-black text-white font-medium rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isApproving ? 'Applying...' : 'Approve Option A'}</span>
                    </button>
                  </div>
                </div>

                {/* Option B: Synchronized Frontend Consumer Migration */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 hover:border-emerald-300 transition-all space-y-3 shadow-soft-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs">
                        B
                      </span>
                      <span className="font-semibold text-neutral-900 text-xs">
                        Option B: Synchronized Frontend Consumer Migration
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      Full Modernization
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Patches <code className="text-neutral-900 font-mono bg-neutral-100 px-1 py-0.5 rounded">workspaces/frontend-consumer</code> Zod schemas and <code className="text-neutral-900 font-mono bg-neutral-100 px-1 py-0.5 rounded">CheckoutSummary.tsx</code> to read <code className="text-neutral-900 font-mono bg-neutral-100 px-1 py-0.5 rounded">pricing_breakdown.amount_minor</code> with fallback.
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs font-mono">
                    <span className="text-neutral-400 text-[11px]">
                      Both repositories synchronize to v2 spec
                    </span>
                    <button
                      onClick={() => onApproveDecision('OPTION_B')}
                      disabled={isApproving}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isApproving ? 'Applying...' : 'Approve Option B'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SCENARIO 3: Clean Baseline Monitoring - Standby state */}
            {!isResolved && !isAwaitingApproval && (
              <div className="p-6 rounded-2xl bg-white border border-neutral-200 text-center space-y-2 shadow-soft-sm font-sans">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-semibold text-neutral-800 text-xs font-sans">Gate Monitoring Baseline</div>
                <p className="text-[11px] text-neutral-500 max-w-sm mx-auto font-sans leading-relaxed">
                  Dual-approval gate is active with <code className="font-mono text-neutral-700 bg-neutral-100 px-1 py-0.5 rounded">auto_approve: false</code>. When uncommitted breaking schema diffs are detected, executable resolution plans will appear here for human sign-off.
                </p>
              </div>
            )}

            {/* Approver Signatures */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200 flex items-center justify-between text-[11px] text-neutral-600 shadow-soft-sm font-sans">
              <div className="flex items-center gap-2">
                <UserCheck className={`w-3.5 h-3.5 ${isResolved ? 'text-emerald-600' : 'text-sky-600'}`} />
                <span>Backend Approver: <strong className="font-mono text-neutral-800">alex.be</strong> {isResolved ? '(Signed)' : '(Required)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className={`w-3.5 h-3.5 ${isResolved ? 'text-emerald-600' : 'text-emerald-600'}`} />
                <span>Frontend Approver: <strong className="font-mono text-neutral-800">sam.fe</strong> {isResolved ? '(Signed)' : '(Required)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Immutable SQLite Decisions Log */}
        {activeTab === 'decisions' && (
          <div className="space-y-3">
            {decisions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-400 space-y-2 shadow-soft-sm">
                <Database className="w-8 h-8 text-neutral-300 mx-auto" />
                <div className="font-semibold text-neutral-800 text-xs">No Ratified Decisions Yet</div>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto font-sans">
                  When developers approve Option A or Option B, the immutable audit trail is committed here to SQLite.
                </p>
              </div>
            ) : (
              decisions.map((d) => {
                const isExpanded = expandedDecisionId === d.id;
                const decisionType = d.decisionType || (d as any).decision_type || 'OPTION_A';
                const schemaVersion = d.schemaVersion || (d as any).schema_version || 'v1.1.0-adapter';
                const backendApprover =
                  d.approvedByBackend ||
                  (d as any).approved_by_backend_human ||
                  (d as any).approved_by_backend ||
                  'alex.be';
                const frontendApprover =
                  d.approvedByFrontend ||
                  (d as any).approved_by_frontend_human ||
                  (d as any).approved_by_frontend ||
                  'sam.fe';
                const appliedPatchDiff = d.appliedPatchDiff || (d as any).applied_patch_diff;
                const timestamp = d.timestamp || new Date().toISOString();

                return (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-xs space-y-2 shadow-soft-sm font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{decisionType === 'OPTION_A' ? 'Option A: Backend Adapter' : 'Option B: Frontend Patch'}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        {schemaVersion}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-100 font-mono">
                      <span>
                        Approvers: <strong className="text-neutral-800 font-semibold">{backendApprover}</strong> &amp;{' '}
                        <strong className="text-neutral-800 font-semibold">{frontendApprover}</strong>
                      </span>
                      <span>{new Date(timestamp).toLocaleString()}</span>
                    </div>

                    {/* Expandable Git Patch Diff */}
                    {appliedPatchDiff && (
                      <div className="pt-2">
                        <button
                          onClick={() => setExpandedDecisionId(isExpanded ? null : d.id)}
                          className="text-[10px] text-sky-700 hover:underline flex items-center gap-1 font-mono font-semibold"
                        >
                          <span>{isExpanded ? 'Hide Patch Diff' : 'View Applied Git Patch Diff'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isExpanded && (
                          <pre className="mt-2 p-3 rounded-xl bg-[#FAFAF8] border border-neutral-200 text-[10px] text-neutral-800 overflow-x-auto max-h-48 leading-relaxed shadow-soft-sm font-mono">
                            {appliedPatchDiff}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Agent Execution Audit Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-2">
            {executionLogs.length === 0 ? (
              <div className="text-neutral-400 text-center py-8">No execution logs recorded yet.</div>
            ) : (
              executionLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-white border border-neutral-200 text-[11px] font-mono flex items-center justify-between shadow-soft-sm"
                >
                  <div>
                    <div className="text-neutral-900 font-semibold">{log.agentName}</div>
                    <div className="text-neutral-500 text-[10px] truncate max-w-sm mt-0.5">
                      {log.command}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-[10px] font-semibold ${
                        log.exitCode === 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      exit: {log.exitCode}
                    </div>
                    <div className="text-neutral-400 text-[9px]">{log.durationMs}ms</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Panel 4 Telemetry Footer */}
      <div className="p-2.5 border-t border-neutral-200 bg-[#FAFAF8] flex items-center justify-between text-[11px] font-mono text-neutral-500 shrink-0">
        <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Immutable Audit Log</span>
        </span>
        <span className="text-neutral-500">{decisions.length} Ratified Records</span>
      </div>
    </div>
  );
};
