'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  MessageSquare,
  Send,
  Terminal,
  Radio,
  Users,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  ShieldAlert,
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';
import { AgentMessage } from './types';

interface PanelSwitchRoomProps {
  messages: AgentMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onRunCommand: (command: string) => Promise<void>;
  connected: boolean;
}

export const PanelSwitchRoom: React.FC<PanelSwitchRoomProps> = ({
  messages,
  onSendMessage,
  onRunCommand,
  connected
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      if (text.startsWith('!')) {
        await onRunCommand(text);
      } else {
        await onSendMessage(text);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickCommand = async (cmd: string) => {
    if (cmd.startsWith('!')) {
      await onRunCommand(cmd);
    } else {
      await onSendMessage(cmd);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFCFA] border-r border-neutral-200 overflow-hidden font-sans text-left">
      {/* Panel Top Header */}
      <div className="p-3.5 border-b border-neutral-200 bg-[#FAFAF8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-violet-600" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-800 font-mono uppercase tracking-wider">
              Panel 2 • Switch Room Stream
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 border border-violet-200 font-semibold">
              #pactroom-api-contracts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
          <a
            href={process.env.NEXT_PUBLIC_MATTERMOST_URL || 'http://localhost:60015'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-700 font-semibold hover:underline bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
            title="Open Mattermost Collaborative Room in Switch"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Mattermost :60015</span>
          </a>
          <span>•</span>
          <span className="text-neutral-600">Switch Console Bridge</span>
        </div>
      </div>

      {/* Quick Command Pills Bar */}
      <div className="px-3 py-2 bg-white border-b border-neutral-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono shrink-0">
        <span className="text-[10px] text-neutral-400 uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
          <Command className="w-3 h-3 text-neutral-400" />
          <span>Quick:</span>
        </span>

        {[
          { label: '!list-agents', cmd: '!list-agents', color: 'bg-sky-50 text-sky-800 border-sky-200' },
          { label: '!roles', cmd: '!roles', color: 'bg-violet-50 text-violet-800 border-violet-200' },
          { label: '!list-documents', cmd: '!list-documents', color: 'bg-amber-50 text-amber-900 border-amber-200' },
          { label: '@pact-watch', cmd: '@pact-watch inspect dirty working tree', color: 'bg-sky-50 text-sky-800 border-sky-200' },
          { label: '@pact-verify', cmd: '@pact-verify validate candidate schema', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
          { label: '@pact-sync', cmd: '@pact-sync synthesize resolution', color: 'bg-purple-50 text-purple-800 border-purple-200' }
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickCommand(item.cmd)}
            className={`px-2.5 py-1 rounded-full border ${item.color} shrink-0 transition-colors active:scale-95 font-medium shadow-soft-sm`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Messages Feed Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 space-y-2">
            <Radio className="w-8 h-8 text-orange-400 animate-pulse mx-auto opacity-70" />
            <div className="text-neutral-800 text-xs font-bold">Switch Room Connected</div>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto font-sans">
              Type <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded font-mono">!list-agents</code>, address <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded font-mono">@watch</code>, or trigger an uncommitted breaking change on Machine A.
            </p>
          </div>
        ) : (
          (Array.isArray(messages) ? messages : []).filter(Boolean).map((msg: any, idx: number) => {
            const senderId = String(msg?.senderAgentId || msg?.sender_agent_id || msg?.agentId || '');
            const senderName = String(msg?.senderName || msg?.sender_name || 'Agent');
            const role = String(msg?.role || 'system');
            const isWatch = senderId.includes('watch') || role === 'inspector';
            const isVerify = senderId.includes('verify') || role === 'validator';
            const isSync = senderId.includes('sync') || role === 'arbitrator';
            const isHuman = role === 'human' || senderId === 'human-user' || senderId === 'human-approval-gate';
            const isSystem = role === 'system';

            return (
              <div
                key={msg?.id || `msg-${idx}`}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isWatch
                    ? 'bg-sky-50/70 border-sky-200 shadow-soft-sm'
                    : isVerify
                    ? 'bg-emerald-50/70 border-emerald-200 shadow-soft-sm'
                    : isSync
                    ? 'bg-violet-50/70 border-violet-200 shadow-soft-sm'
                    : isHuman
                    ? 'bg-orange-100/75 border-orange-200 shadow-soft-sm'
                    : 'bg-white border-neutral-200 shadow-soft-sm'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-black/[0.04]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold flex items-center gap-1.5 ${
                        isWatch
                          ? 'text-sky-800'
                          : isVerify
                          ? 'text-emerald-800'
                          : isSync
                          ? 'text-violet-800'
                          : isHuman
                          ? 'text-orange-950 font-bold'
                          : 'text-neutral-800'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isWatch
                            ? 'bg-sky-500'
                            : isVerify
                            ? 'bg-emerald-500'
                            : isSync
                            ? 'bg-violet-500 animate-pulse'
                            : isHuman
                            ? 'bg-orange-500'
                            : 'bg-neutral-400'
                        }`}
                      />
                      {senderName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">[{role}]</span>
                  </div>

                  <span className="text-[10px] text-neutral-400 font-mono">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </span>
                </div>

                {/* Message Content (Markdown Rendered) */}
                <div className="text-neutral-800 text-xs font-sans leading-relaxed break-words">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                      strong: ({ children }) => <strong className="font-bold text-neutral-900">{children}</strong>,
                      em: ({ children }) => <em className="italic text-neutral-800">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      h1: ({ children }) => <h1 className="text-sm font-bold text-neutral-900 mt-2 mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xs font-bold text-neutral-900 mt-2 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-bold text-neutral-900 mt-2 mb-1">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-xs font-bold text-neutral-900 mt-1.5 mb-0.5">{children}</h4>,
                      code: ({ children }) => (
                        <code className="font-mono text-[11px] bg-black/[0.06] text-neutral-900 px-1.5 py-0.5 rounded border border-black/[0.08] font-medium">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="p-2.5 rounded-xl bg-neutral-900 text-neutral-100 text-[11px] font-mono overflow-x-auto my-2 border border-neutral-800 shadow-sm leading-relaxed">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-amber-500 pl-2.5 my-1.5 text-neutral-700 italic">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {String(msg?.content || '')}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Bottom Message Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type !list-agents, !roles, @pact-watch, or 'Approve Option A'..."
            className="w-full bg-[#FAFAF8] border border-neutral-200 rounded-full pl-4 pr-10 py-2.5 text-xs text-neutral-900 font-mono placeholder-neutral-400 focus:outline-none focus:border-orange-400 transition-colors shadow-soft-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-black text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shadow-sm shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
