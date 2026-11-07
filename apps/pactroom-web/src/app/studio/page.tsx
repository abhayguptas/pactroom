'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  StudioHeader,
  PanelMachineA,
  PanelSwitchRoom,
  PanelMachineB,
  PanelDecisionsGate,
  AgentMessage,
  TerminalLog,
  ConsumerBreakage,
  RoomDecision,
  AgentExecutionLog,
  NegotiationState,
  GitWorkspaceInfo
} from '@/components/studio';

const getInitialServerUrl = (): string => {
  if (process.env.NEXT_PUBLIC_PACTROOM_SERVER_URL) {
    return process.env.NEXT_PUBLIC_PACTROOM_SERVER_URL;
  }
  if (typeof window !== 'undefined') {
    const port = process.env.NEXT_PUBLIC_SERVER_PORT || '3002';
    return `${window.location.protocol}//${window.location.hostname}:${port}`;
  }
  return 'http://localhost:3002';
};

export default function StudioPage() {
  const [serverUrl, setServerUrl] = useState<string>(getInitialServerUrl);

  useEffect(() => {
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_PACTROOM_SERVER_URL) {
      const port = process.env.NEXT_PUBLIC_SERVER_PORT || '3002';
      const dynamicUrl = `${window.location.protocol}//${window.location.hostname}:${port}`;
      if (serverUrl !== dynamicUrl) {
        setServerUrl(dynamicUrl);
      }
    }
  }, []);

  // Studio Real-time State
  const [connected, setConnected] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'columns'>('grid');
  const [negotiation, setNegotiation] = useState<NegotiationState | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [breakages, setBreakages] = useState<ConsumerBreakage[]>([]);
  const [decisions, setDecisions] = useState<RoomDecision[]>([]);
  const [executionLogs, setExecutionLogs] = useState<AgentExecutionLog[]>([]);
  const [gitInfo, setGitInfo] = useState<GitWorkspaceInfo | null>(null);

  // Loading flags for action triggers
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  // Fetch real Git state from Machine A
  const fetchGitInfo = useCallback(async () => {
    try {
      const res = await fetch(`${serverUrl}/api/backend/git`);
      if (res.ok) {
        const data = await res.json();
        setGitInfo(data);
      }
    } catch (e) {
      // Backend server may be offline or starting up
    }
  }, [serverUrl]);

  // Fetch real diagnostics from Machine B
  const fetchDiagnostics = useCallback(async () => {
    try {
      const res = await fetch(`${serverUrl}/api/frontend/diagnostics`);
      if (res.ok) {
        const data = await res.json();
        if (data.breakages) {
          setBreakages(data.breakages);
        }
      }
    } catch (e) {}
  }, [serverUrl]);

  // Fetch decisions and logs from SQLite
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${serverUrl}/api/negotiations`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
        if (data.breakages) setBreakages(data.breakages);
        if (data.decisions) setDecisions(data.decisions);
        if (data.executionLogs) setExecutionLogs(data.executionLogs);
        if (data.activeNegotiation) setNegotiation(data.activeNegotiation);
      }
    } catch (e) {}
  }, [serverUrl]);

  // Reset and initialize clean baseline on studio entry
  useEffect(() => {
    const initCleanStudio = async () => {
      try {
        await fetch(`${serverUrl}/api/backend/reset`, { method: 'POST' });
      } catch (e) {
        console.error('Initial baseline reset error:', e);
      }
      fetchGitInfo();
      fetchDiagnostics();
      fetchHistory();
    };

    initCleanStudio();

    const sse = new EventSource(`${serverUrl}/api/events`);

    sse.onopen = () => {
      setConnected(true);
    };

    sse.onerror = () => {
      setConnected(false);
    };

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'agent_message') {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === data.payload.id);
            if (exists) return prev;
            return [...prev, data.payload];
          });
        } else if (data.type === 'terminal_output') {
          setTerminalLogs((prev) => [
            ...prev.slice(-300),
            {
              id: `${Date.now()}_${Math.random()}`,
              tool: data.payload.tool,
              workspace: data.payload.workspace,
              text: data.payload.text,
              stream: data.payload.stream
            }
          ]);
        } else if (data.type === 'negotiation_update') {
          setNegotiation(data.payload);
          if (data.payload?.status === 'RESOLVED' || data.payload?.breakingCount === 0) {
            setBreakages([]);
          }
          fetchGitInfo();
          fetchDiagnostics();
        } else if (data.type === 'consumer_breakage') {
          setBreakages((prev) => {
            const exists = prev.some((b) => b.id === data.payload.id);
            if (exists) return prev;
            return [data.payload, ...prev];
          });
        } else if (data.type === 'room_decision') {
          setDecisions((prev) => [data.payload, ...prev]);
          setBreakages([]);
          fetchGitInfo();
          fetchDiagnostics();
          fetchHistory();
        }
      } catch (err) {
        console.error('SSE Error:', err);
      }
    };

    return () => {
      sse.close();
    };
  }, [serverUrl, fetchGitInfo, fetchDiagnostics, fetchHistory]);

  // ============================================================================
  // Action Handlers
  // ============================================================================

  // 1. Introduce Real Uncommitted DTO Breaking Change
  const handleMutateBreaking = async () => {
    setIsMutating(true);
    try {
      const res = await fetch(`${serverUrl}/api/backend/mutate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) setNegotiation(data.negotiation);
        fetchGitInfo();
        fetchDiagnostics();
      }
    } catch (err) {
      console.error('Mutate error:', err);
    } finally {
      setIsMutating(false);
    }
  };

  // 2. Reset Workspace to Clean Baseline
  const handleResetBaseline = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`${serverUrl}/api/backend/reset`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) setNegotiation(data.negotiation);
        setBreakages([]);
        fetchGitInfo();
        fetchDiagnostics();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // 3. Save Custom Schema Edit on Disk
  const handleSaveSchema = async (schemaContent: string) => {
    try {
      const res = await fetch(`${serverUrl}/api/backend/schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemaContent })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) setNegotiation(data.negotiation);
        fetchGitInfo();
        fetchDiagnostics();
      }
    } catch (err) {
      console.error('Save schema error:', err);
    }
  };

  // 4. Send Message into Switch Room
  const handleSendMessage = async (content: string) => {
    try {
      await fetch(`${serverUrl}/api/switch/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          senderName: 'Lead Engineer',
          senderId: 'developer-in-the-loop'
        })
      });
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // 5. Run Room Command (!list-agents, !roles, !list-documents)
  const handleRunCommand = async (command: string) => {
    try {
      await fetch(`${serverUrl}/api/switch/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
    } catch (err) {
      console.error('Run command error:', err);
    }
  };

  // 6. Scan Spec (@pact-watch)
  const handleScanSpec = async () => {
    try {
      const res = await fetch(`${serverUrl}/api/scan`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) setNegotiation(data.negotiation);
        fetchGitInfo();
      }
    } catch (err) {
      console.error('Scan error:', err);
    }
  };

  // 7. Verify Machine B (@pact-verify)
  const handleRunVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch(`${serverUrl}/api/verify`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) setNegotiation(data.negotiation);
        fetchDiagnostics();
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // 8. Human Gate Approval (Option A vs Option B)
  const handleApproveDecision = async (option: 'OPTION_A' | 'OPTION_B') => {
    setIsApproving(true);
    try {
      const res = await fetch(`${serverUrl}/api/negotiate/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option,
          approvedByBackend: 'alex.be',
          approvedByFrontend: 'sam.fe'
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.negotiation) setNegotiation(data.negotiation);
        fetchGitInfo();
        fetchDiagnostics();
        fetchHistory();
      }
    } catch (err) {
      console.error('Approval decision error:', err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FAFAF8] text-neutral-900 font-sans">
      {/* Top Studio Mission Control Header */}
      <StudioHeader
        connected={connected}
        negotiation={negotiation}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        onMutateBreaking={handleMutateBreaking}
        onResetBaseline={handleResetBaseline}
        onScanSpec={handleScanSpec}
        onRunVerify={handleRunVerify}
        isMutating={isMutating}
        isResetting={isResetting}
        isVerifying={isVerifying}
      />

      {/* 4-Panel Mission Control Workspace Body */}
      <div className="flex-1 overflow-hidden">
        {layoutMode === 'grid' ? (
          /* ========================================================================= */
          /* 2x2 MISSION CONTROL GRID VIEW                                             */
          /* ========================================================================= */
          <div className="h-full grid grid-cols-1 md:grid-cols-2 grid-rows-2 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-neutral-200 overflow-hidden">
            {/* Top-Left: Panel 1 Machine A (Backend Workspace) */}
            <div className="h-full border-b border-neutral-200 overflow-hidden bg-white">
              <PanelMachineA
                gitInfo={gitInfo}
                onMutateBreaking={handleMutateBreaking}
                onResetBaseline={handleResetBaseline}
                onSaveSchema={handleSaveSchema}
                onRefreshGit={fetchGitInfo}
                isMutating={isMutating}
                isResetting={isResetting}
              />
            </div>

            {/* Top-Right: Panel 2 Shared Switch Room (Chat & Commands) */}
            <div className="h-full border-b border-neutral-200 overflow-hidden bg-[#FCFCFA]">
              <PanelSwitchRoom
                messages={messages}
                onSendMessage={handleSendMessage}
                onRunCommand={handleRunCommand}
                connected={connected}
              />
            </div>

            {/* Bottom-Left: Panel 3 Machine B (Frontend Consumer AST & Compiler) */}
            <div className="h-full overflow-hidden bg-white">
              <PanelMachineB
                breakages={breakages}
                terminalLogs={terminalLogs}
                onRunVerify={handleRunVerify}
                isVerifying={isVerifying}
                status={negotiation?.status || 'IDLE'}
              />
            </div>

            {/* Bottom-Right: Panel 4 Decisions Log & Human Approval Gate */}
            <div className="h-full overflow-hidden bg-[#FCFCFA]">
              <PanelDecisionsGate
                negotiation={negotiation}
                decisions={decisions}
                executionLogs={executionLogs}
                onApproveDecision={handleApproveDecision}
                isApproving={isApproving}
              />
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 4-COLUMN WIDE VIEW                                                        */
          /* ========================================================================= */
          <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 overflow-hidden">
            {/* Column 1: Panel 1 Machine A */}
            <div className="h-full overflow-hidden bg-white">
              <PanelMachineA
                gitInfo={gitInfo}
                onMutateBreaking={handleMutateBreaking}
                onResetBaseline={handleResetBaseline}
                onSaveSchema={handleSaveSchema}
                onRefreshGit={fetchGitInfo}
                isMutating={isMutating}
                isResetting={isResetting}
              />
            </div>

            {/* Column 2: Panel 2 Switch Room Stream */}
            <div className="h-full overflow-hidden bg-[#FCFCFA]">
              <PanelSwitchRoom
                messages={messages}
                onSendMessage={handleSendMessage}
                onRunCommand={handleRunCommand}
                connected={connected}
              />
            </div>

            {/* Column 3: Panel 3 Machine B Diagnostics */}
            <div className="h-full overflow-hidden bg-white">
              <PanelMachineB
                breakages={breakages}
                terminalLogs={terminalLogs}
                onRunVerify={handleRunVerify}
                isVerifying={isVerifying}
                status={negotiation?.status || 'IDLE'}
              />
            </div>

            {/* Column 4: Panel 4 Decisions Log & Gate */}
            <div className="h-full overflow-hidden bg-[#FCFCFA]">
              <PanelDecisionsGate
                negotiation={negotiation}
                decisions={decisions}
                executionLogs={executionLogs}
                onApproveDecision={handleApproveDecision}
                isApproving={isApproving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
