'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  LayoutGrid,
  Columns4,
  RefreshCw,
  Play
} from 'lucide-react';
import { PactRoomLogo } from '@/components/brand/PactRoomLogo';
import { NegotiationState } from './types';

interface StudioHeaderProps {
  connected: boolean;
  negotiation: NegotiationState | null;
  layoutMode: 'grid' | 'columns';
  onLayoutModeChange: (mode: 'grid' | 'columns') => void;
  onMutateBreaking: () => void;
  onResetBaseline: () => void;
  onScanSpec: () => void;
  onRunVerify: () => void;
  isMutating: boolean;
  isResetting: boolean;
  isVerifying: boolean;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  connected,
  negotiation,
  layoutMode,
  onLayoutModeChange,
  onMutateBreaking,
  onResetBaseline,
  onScanSpec,
  onRunVerify,
  isMutating,
  isResetting,
  isVerifying
}) => {
  const status = negotiation?.status || 'IDLE';

  const getStatusBadge = () => {
    switch (status) {
      case 'BREAKING_FOUND':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-500 animate-pulse',
          text: 'BREAKING DETECTED'
        };
      case 'AWAITING_HUMAN_DECISION':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900 font-bold',
          dot: 'bg-amber-500 animate-ping',
          text: 'HUMAN GATE LOCKED'
        };
      case 'VERIFYING_CONSUMERS':
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          dot: 'bg-sky-500 animate-spin',
          text: 'VERIFYING CONSUMERS'
        };
      case 'PATCHING_REPOS':
        return {
          bg: 'bg-violet-50 border-violet-200 text-violet-800',
          dot: 'bg-violet-500 animate-pulse',
          text: 'AUTO-PATCHING DISK'
        };
      case 'RESOLVED':
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-800',
          dot: 'bg-emerald-500',
          text: negotiation?.chosenOption ? 'CONTRACT RATIFIED' : 'CONTRACT STANDBY'
        };
      default:
        return {
          bg: 'bg-neutral-100 border-neutral-200 text-neutral-600',
          dot: 'bg-neutral-400',
          text: 'MONITORING'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <header className="h-16 border-b border-neutral-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 shadow-soft-sm">
      {/* Left: Back & Logo */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline font-medium">Back</span>
        </Link>
        <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
        <PactRoomLogo variant="full" size="sm" showBadge={false} href="/" theme="light" />
      </div>

      {/* Center: Live Room & Lifecycle Status */}
      <div className="hidden md:flex items-center gap-3 text-xs font-mono">
        {/* Switch Room Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAFAF8] border border-neutral-200 shadow-soft-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="text-neutral-500">Switch Room:</span>
          <span className="text-neutral-800 font-semibold">#pactflow-api-contracts</span>
        </div>

        {/* Negotiation Lifecycle State */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-soft-sm ${badge.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
          <span className="font-semibold tracking-wide text-[11px]">{badge.text}</span>
          {status !== 'RESOLVED' && negotiation?.breakingCount !== undefined && negotiation.breakingCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-mono font-bold">
              {negotiation.breakingCount} breaking
            </span>
          )}
        </div>
      </div>

      {/* Right: Layout Switcher & Primary Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Layout Mode Toggles */}
        <div className="hidden lg:flex items-center p-0.5 rounded-full bg-[#FAFAF8] border border-neutral-200 text-xs font-mono text-neutral-500">
          <button
            onClick={() => onLayoutModeChange('grid')}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
              layoutMode === 'grid'
                ? 'bg-white text-neutral-900 font-semibold shadow-soft-sm'
                : 'hover:text-neutral-800'
            }`}
            title="2x2 Mission Control Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[11px]">Grid</span>
          </button>
          <button
            onClick={() => onLayoutModeChange('columns')}
            className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
              layoutMode === 'columns'
                ? 'bg-white text-neutral-900 font-semibold shadow-soft-sm'
                : 'hover:text-neutral-800'
            }`}
            title="4-Column Wide View"
          >
            <Columns4 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Columns</span>
          </button>
        </div>

        {/* Action: Introduce Real Uncommitted Breaking Change */}
        <button
          onClick={onMutateBreaking}
          disabled={isMutating}
          className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold font-mono flex items-center gap-1.5 transition-all shadow-soft-sm active:scale-95 disabled:opacity-50"
          title="Applies uncommitted DTO breaking change to workspaces/backend-api on disk"
        >
          <AlertTriangle className={`w-3.5 h-3.5 text-rose-600 ${isMutating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Mutate DTO</span>
          <span className="sm:hidden">Mutate</span>
        </button>

        {/* Action: Reset Workspace to Baseline */}
        <button
          onClick={onResetBaseline}
          disabled={isResetting}
          className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-medium font-mono flex items-center gap-1.5 transition-colors shadow-soft-sm active:scale-95 disabled:opacity-50"
          title="Restores clean baseline schemas on disk"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-amber-600 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Action: Verify (@pact-verify) */}
        <button
          onClick={onRunVerify}
          disabled={isVerifying}
          className="px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-medium font-mono flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          title="Run real tsc --noEmit and vitest verification child processes on Machine B"
        >
          <Play className={`w-3.5 h-3.5 text-white ${isVerifying ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Verify (@pact-verify)</span>
          <span className="sm:hidden">Verify</span>
        </button>
      </div>
    </header>
  );
};
