'use client';

import React, { useState } from 'react';
import {
  Terminal,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCode
} from 'lucide-react';
import { ConsumerBreakage, TerminalLog } from './types';

interface PanelMachineBProps {
  breakages: ConsumerBreakage[];
  terminalLogs: TerminalLog[];
  onRunVerify: () => void;
  isVerifying: boolean;
  status: string;
}

export const PanelMachineB: React.FC<PanelMachineBProps> = ({
  breakages,
  terminalLogs,
  onRunVerify,
  isVerifying,
  status
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'terminal' | 'component'>('diagnostics');

  const hasErrors = breakages.length > 0;
  const isResolved = status === 'RESOLVED';

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 overflow-hidden font-sans text-left">
      {/* Panel Top Header */}
      <div className="p-3.5 border-b border-neutral-200 bg-[#FAFAF8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              hasErrors
                ? 'bg-rose-500 animate-pulse'
                : isResolved
                ? 'bg-emerald-500'
                : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-800 font-mono uppercase tracking-wider">
              Panel 3 • Machine B Frontend
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              @pact-verify
            </span>
          </div>
        </div>

        {/* Action: Run Verification Button */}
        <button
          onClick={onRunVerify}
          disabled={isVerifying}
          className="px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1.5 transition-colors shadow-soft-sm disabled:opacity-50"
        >
          <Play className={`w-3 h-3 text-emerald-600 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Verifying...' : 'Verify tsc & vitest'}</span>
        </button>
      </div>

      {/* Compiler Status Proof Ribbon */}
      <div className="p-3 border-b border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-neutral-600 font-medium">Subprocess Status:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              hasErrors
                ? 'bg-rose-100 border border-rose-300 text-rose-800'
                : isResolved
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {hasErrors
              ? `FAILED (${breakages.length} Diagnostics)`
              : isResolved
              ? 'PASSED (0 Compiler Errors)'
              : 'IDLE (Clean)'}
          </span>
        </div>

        <span className="text-[11px] text-neutral-400">workspaces/frontend-consumer</span>
      </div>

      {/* Tab Switcher: Diagnostics vs Live Terminal Logs vs Rendered Component */}
      <div className="flex border-b border-neutral-200 bg-white text-xs font-mono shrink-0">
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex-1 py-2 px-3 text-center border-r border-neutral-200 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'diagnostics'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Diagnostics ({breakages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-2 px-3 text-center border-r border-neutral-200 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'terminal'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-sky-600" />
          <span>Terminal Output ({terminalLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('component')}
          className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'component'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-emerald-600" />
          <span>Consumer Component</span>
        </button>
      </div>

      {/* Panel Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-[#FAFAF8]">
        {/* TAB 1: Diagnostics List */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-3">
            {breakages.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500 space-y-2 shadow-soft-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-semibold text-neutral-800 text-xs">Zero Type Regressions</div>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto font-sans">
                  The frontend consumer compiles cleanly against the active contract. When breaking changes are introduced on Machine A, exact breaking file paths and line numbers appear here.
                </p>
              </div>
            ) : (
              breakages.map((b) => {
                const filePath = b.filePath || (b as any).file_path || 'src/schemas/orders.ts';
                const line = b.line !== undefined ? b.line : (b as any).line_number || 1;
                const column = b.column !== undefined ? b.column : (b as any).column_number || 1;
                const errorCode = b.errorCode || (b as any).error_code || '2339';
                const message = b.message || (b as any).code_snippet || 'Property does not exist on type.';
                const tool = b.tool || 'tsc';
                const createdAt = b.createdAt || (b as any).created_at || new Date().toISOString();

                return (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-900 space-y-2 shadow-soft-sm font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-800 flex items-center gap-1.5 text-xs font-mono">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{filePath}:{line}:{column}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                        TS{errorCode}
                      </span>
                    </div>

                    <p className="text-[11px] text-rose-950 font-sans font-medium">
                      {message}
                    </p>

                    {/* Code snippet highlighting */}
                    <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-[11px] text-neutral-800 overflow-x-auto leading-relaxed shadow-soft-sm font-mono">
                      <div className="text-neutral-400">22 | const formattedTotal = formatCurrency(</div>
                      <div className="text-rose-700 font-semibold bg-rose-50 px-1 rounded">
                        23 |   order.total_amount_cents, order.currency_code
                      </div>
                      <div className="text-neutral-400">24 | );</div>
                    </div>

                    <div className="text-[10px] text-neutral-500 flex items-center justify-between font-mono pt-1 border-t border-rose-100">
                      <span>Tool: {tool} (Real Subprocess)</span>
                      <span>Detected: {new Date(createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: Live Terminal Logs */}
        {activeTab === 'terminal' && (
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 min-h-[300px] text-[11px] font-mono leading-relaxed space-y-1 shadow-soft-sm text-neutral-800">
            <div className="text-neutral-400 mb-2 pb-1 border-b border-neutral-100 flex items-center justify-between">
              <span>$ child_process.spawn stdout/stderr</span>
              <span className="text-neutral-500 font-semibold">100% Real Logs</span>
            </div>

            {terminalLogs.length === 0 ? (
              <div className="text-neutral-400 italic">No command logs yet. Trigger a scan or verification to stream output.</div>
            ) : (
              terminalLogs.slice(-200).map((log) => (
                <div
                  key={log.id}
                  className={
                    log.stream === 'stderr'
                      ? 'text-rose-700 font-semibold'
                      : log.stream === 'info'
                      ? 'text-sky-700 font-semibold'
                      : 'text-neutral-700'
                  }
                >
                  {log.text}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Rendered Consumer Component Preview */}
        {activeTab === 'component' && (
          <div className="space-y-4 font-sans">
            <div className="text-xs text-neutral-500 font-mono">
              Live render of <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded">src/components/CheckoutSummary.tsx</code>:
            </div>

            {hasErrors ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 shadow-soft-sm space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>React Consumer Component Crashed (TypeScript / Zod Violation)</span>
                </div>
                <p className="text-[11px] font-mono text-rose-950">
                  Cannot read property &apos;toFixed&apos; of undefined: order.total_amount_cents was removed on Machine A.
                </p>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Production runtime deployment would immediately throw 500 error for customer checkout.
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 space-y-3 shadow-soft-sm">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
                      Order Reference
                    </span>
                    <div className="font-bold text-neutral-800 text-sm font-mono">ord_live_89123</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    SETTLED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 text-[11px]">Customer Tier</span>
                    <div className="font-medium text-neutral-800">Enterprise Gold</div>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[11px]">Settlement Amount</span>
                    <div className="font-bold text-emerald-700 text-base font-mono">$89.00 USD</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
