'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  FileCode,
  Terminal,
  Code2,
  CheckCircle2,
  Save,
  Server
} from 'lucide-react';
import { GitWorkspaceInfo } from './types';

interface PanelMachineAProps {
  gitInfo: GitWorkspaceInfo | null;
  onMutateBreaking: () => void;
  onResetBaseline: () => void;
  onSaveSchema: (content: string) => Promise<void>;
  onRefreshGit: () => void;
  isMutating: boolean;
  isResetting: boolean;
}

export const PanelMachineA: React.FC<PanelMachineAProps> = ({
  gitInfo,
  onMutateBreaking,
  onResetBaseline,
  onSaveSchema,
  onRefreshGit,
  isMutating,
  isResetting
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'editor' | 'endpoints'>('diff');
  const [editedSchema, setEditedSchema] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/orders/:id');

  // Sync schema text when editor opens
  const handleOpenEditor = () => {
    setActiveTab('editor');
    if (gitInfo?.schemaSource) {
      setEditedSchema(gitInfo.schemaSource);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveSchema(editedSchema);
    } finally {
      setIsSaving(false);
    }
  };

  const isDirty = gitInfo?.isDirty ?? false;

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200 overflow-hidden font-sans text-left">
      {/* Panel Top Header */}
      <div className="p-3.5 border-b border-neutral-200 bg-[#FAFAF8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-800 font-mono uppercase tracking-wider">
              Panel 1 • Machine A Backend
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
              @pact-watch
            </span>
          </div>
        </div>

        {/* Quick Refresh */}
        <button
          onClick={onRefreshGit}
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          title="Refresh Git Diff"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Git Status & Working Tree Banner */}
      <div className="p-3 border-b border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-neutral-700 font-semibold">{gitInfo?.branch || 'feature/v2-orders'}</span>
          <span className="text-neutral-300">|</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isDirty
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {isDirty ? 'DIRTY (Uncommitted on disk)' : 'CLEAN (Git Baseline)'}
          </span>
        </div>

        <span className="text-[11px] text-neutral-400">workspaces/backend-api</span>
      </div>

      {/* Action Buttons */}
      <div className="p-3 bg-[#FAFAF8] border-b border-neutral-200 flex flex-wrap items-center gap-2 shrink-0">
        <button
          onClick={onMutateBreaking}
          disabled={isMutating}
          className="flex-1 py-1.5 px-3 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all shadow-soft-sm active:scale-95 disabled:opacity-50"
        >
          <AlertTriangle className={`w-3.5 h-3.5 text-rose-600 ${isMutating ? 'animate-spin' : ''}`} />
          <span>Introduce Breaking Change</span>
        </button>

        <button
          onClick={onResetBaseline}
          disabled={isResetting}
          className="py-1.5 px-3 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-soft-sm active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-amber-600 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Baseline</span>
        </button>
      </div>

      {/* Tab Switcher: Live Diff vs Interactive Editor vs Endpoints */}
      <div className="flex border-b border-neutral-200 bg-white text-xs font-mono shrink-0">
        <button
          onClick={() => setActiveTab('diff')}
          className={`flex-1 py-2 px-3 text-center border-r border-neutral-200 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'diff'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-sky-600" />
          <span>Live Git Diff</span>
        </button>

        <button
          onClick={handleOpenEditor}
          className={`flex-1 py-2 px-3 text-center border-r border-neutral-200 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'editor'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-violet-600" />
          <span>Live Schema Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('endpoints')}
          className={`flex-1 py-2 px-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'endpoints'
              ? 'bg-[#FAFAF8] text-neutral-900 font-bold border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live Endpoints</span>
        </button>
      </div>

      {/* Panel Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-[#FAFAF8]">
        {/* TAB 1: Real Live Git Diff */}
        {activeTab === 'diff' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-neutral-500">
              <span className="flex items-center gap-1 text-neutral-700 font-semibold">
                <FileCode className="w-3.5 h-3.5 text-sky-600" />
                <span>src/schemas/orders.ts</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                {gitInfo?.diff ? 'Uncommitted disk diff' : 'Clean baseline'}
              </span>
            </div>

            {gitInfo?.diff ? (
              <pre className="p-3.5 rounded-2xl bg-white border border-neutral-200 text-[11px] leading-relaxed overflow-x-auto shadow-soft-sm text-neutral-800">
                {gitInfo.diff.split('\n').map((line, idx) => {
                  const isAdd = line.startsWith('+') && !line.startsWith('+++');
                  const isDel = line.startsWith('-') && !line.startsWith('---');
                  const isHeader = line.startsWith('@@') || line.startsWith('diff');

                  return (
                    <div
                      key={idx}
                      className={
                        isAdd
                          ? 'bg-emerald-50 text-emerald-800 px-1 rounded font-semibold'
                          : isDel
                          ? 'bg-rose-50 text-rose-800 px-1 rounded line-through'
                          : isHeader
                          ? 'text-sky-700 font-bold'
                          : 'text-neutral-600'
                      }
                    >
                      {line}
                    </div>
                  );
                })}
              </pre>
            ) : (
              <div className="p-8 rounded-2xl bg-white border border-neutral-200 text-center text-neutral-500 space-y-2 shadow-soft-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-semibold text-neutral-800 text-xs">Working Tree is Clean</div>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  No uncommitted schema changes on disk. Click <strong>&quot;Introduce Breaking Change&quot;</strong> above to simulate a developer refactoring the DTO on Machine A.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Live In-Place Schema Editor */}
        {activeTab === 'editor' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 shrink-0">
              <span className="text-neutral-700 font-semibold">Editing: workspaces/backend-api/src/schemas/orders.ts</span>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-mono font-semibold flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save className={`w-3 h-3 text-sky-600 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? 'Saving to Disk...' : 'Save & Trigger @pact-watch'}</span>
              </button>
            </div>

            <textarea
              value={editedSchema}
              onChange={(e) => setEditedSchema(e.target.value)}
              className="flex-1 w-full p-3.5 rounded-2xl bg-white border border-neutral-200 text-[11px] font-mono text-neutral-800 resize-none focus:outline-none focus:border-orange-400 leading-relaxed shadow-soft-sm"
              rows={18}
              spellCheck={false}
            />
          </div>
        )}

        {/* TAB 3: Live Endpoints Inspector */}
        {activeTab === 'endpoints' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-soft-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                    GET
                  </span>
                  <span className="font-semibold text-neutral-800">/api/v1/orders/:id</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">orders.controller.ts</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Returns order settlement metadata. Relies on <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">OrderResponseSchema</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-soft-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    POST
                  </span>
                  <span className="font-semibold text-neutral-800">/api/v1/checkout/session</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">checkout.controller.ts</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Initiates payment checkout session. Relies on <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">CheckoutSessionResponseSchema</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-2 shadow-soft-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                    GET
                  </span>
                  <span className="font-semibold text-neutral-800">/api/v1/subscriptions/active</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">subscriptions.controller.ts</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                Returns active tier and billing cycle. Relies on <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">ActiveSubscriptionResponseSchema</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
