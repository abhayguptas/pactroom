export interface AgentMessage {
  id: string;
  senderAgentId: string;
  senderName: string;
  role: string;
  content: string;
  metadata?: any;
  timestamp: string;
}

export interface TerminalLog {
  id: string;
  tool: string;
  workspace: string;
  text: string;
  stream: 'stdout' | 'stderr' | 'info';
}

export interface ConsumerBreakage {
  id: string;
  negotiationId: string;
  workspace: string;
  tool: string;
  filePath: string;
  line: number;
  column: number;
  errorCode: string;
  message: string;
  snippet?: string;
  rawTerminalOutput?: string;
  createdAt: string;
}

export interface RoomDecision {
  id: string;
  roomId: string;
  negotiationId: string;
  decisionType: 'OPTION_A' | 'OPTION_B';
  schemaVersion: string;
  approvedByBackend: string;
  approvedByFrontend: string;
  appliedPatchDiff?: string;
  verificationPassed: boolean | number;
  timestamp: string;
}

export interface AgentExecutionLog {
  id: string;
  negotiationId?: string;
  agentRole: string;
  agentName: string;
  command: string;
  workspace: string;
  gitDiffOutput?: string;
  exitCode: number;
  durationMs: number;
  stdout?: string;
  stderr?: string;
  timestamp: string;
}

export interface NegotiationState {
  id: string;
  roomId: string;
  status:
    | 'IDLE'
    | 'DETECTED'
    | 'VERIFYING_CONSUMERS'
    | 'BREAKING_FOUND'
    | 'AWAITING_HUMAN_DECISION'
    | 'PATCHING_REPOS'
    | 'RESOLVED';
  diffResult?: any;
  patches?: any[];
  appliedPatchId?: string;
  chosenOption?: 'OPTION_A' | 'OPTION_B';
  breakingCount?: number;
  breakagesCount?: number;
}

export interface GitWorkspaceInfo {
  branch: string;
  statusRaw: string;
  diff: string;
  isDirty: boolean;
  schemaSource: string;
}

