'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowUp,
  GitBranch,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Check
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Warm Sunset Glow Backdrop (Lindy Aesthetic) */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[900px] h-[550px] sunset-glow-hero pointer-events-none rounded-full" />
      <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/40 via-orange-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -right-32 w-[450px] h-[450px] bg-gradient-to-bl from-orange-200/40 via-amber-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Minimalist Pill Badge with Evaluator Shortcut */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 text-white text-[11px] font-medium shadow-sm mb-6"
        >
          <span className="flex items-center gap-1 text-orange-400 font-semibold">
            <Sparkles className="w-3 h-3 fill-orange-400" />
            <span>Powered by Switch</span>
          </span>
          <span className="text-white/30">•</span>
          <span className="text-neutral-300">Flip the Switch Hackathon (Track 01)</span>
          <span className="text-white/30">•</span>
          <a
            href="#evaluator-guide"
            className="text-orange-300 hover:text-white font-mono underline underline-offset-2 transition-colors"
          >
            Judge &amp; Mentor Guide ↓
          </a>
        </motion.div>

        {/* Flagship Headline (Crisp Modern Sans Typography) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-extrabold text-neutral-900 leading-[1.1] tracking-tight max-w-4xl mx-auto px-2"
        >
          Stop Breaking Frontend Builds From Uncommitted Backend Branches
        </motion.h1>

        {/* Subtitle Value Proposition */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal px-2"
        >
          PactRoom connects a backend developer&apos;s local coding agent and a frontend developer&apos;s local coding agent inside a shared Switch room. Proactively negotiates and auto-patches breaking API changes before code is committed.
        </motion.p>

        {/* Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-medium text-xs tracking-tight shadow-md hover:shadow-lg transition-all active:scale-95 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-300 group-hover:rotate-12 transition-transform" />
            <span>Launch Contract Studio</span>
          </Link>
          <a
            href="#evaluator-guide"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-900 font-semibold text-xs border border-orange-200/90 shadow-soft-sm transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-orange-600" />
            <span>60s Evaluator Guide</span>
          </a>
          <a
            href="#template"
            className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-xs border border-neutral-200/90 shadow-soft-sm transition-all"
          >
            <span>Free Switch Template</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </motion.div>

        {/* ========================================================================= */}
        {/* HERO SHOWCASE: THE FLOATING CARD & CONNECTING RAIL (LINDY LAYOUT)         */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 sm:mt-20 relative max-w-4xl mx-auto"
        >
          {/* Horizontal Connecting Rail passing behind the card */}
          <div className="hidden lg:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 items-center justify-between pointer-events-none z-0 px-6">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-amber-300/40 to-orange-300/50" />
            <div className="w-[520px] shrink-0" />
            <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-amber-300/40 to-orange-300/50" />
          </div>

          {/* Floating App Icons on Left Rail (Machine A Tools: Fastify, Claude, Git) */}
          <div className="hidden xl:flex flex-col gap-4 absolute -left-12 top-1/2 -translate-y-1/2 z-20">
            <div className="flex items-center gap-3">
              {/* Fastify Logo Badge */}
              <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-soft-md flex items-center justify-center p-3 transition-all duration-200 hover:scale-110 hover:shadow-soft-lg group relative cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2L4 18H15L12 30L28 12H17L20 2H16Z" fill="#18181B" />
                  <path d="M18 2L9 16H18L15 28L26 12H17L18 2Z" fill="#00ED64" opacity="0.35" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                  Fastify Backend
                </span>
              </div>

              {/* Claude Logo Badge */}
              <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-soft-md flex items-center justify-center p-3 transition-all duration-200 hover:scale-110 hover:shadow-soft-lg group relative cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M13.5 2L15 8L21 6.5L16.5 11.5L22 14.5L16 16.5L17.5 22.5L12.5 18L10 23.5L8.5 17.5L2.5 19L7 14L1.5 11L7.5 9L6 3L11 7.5L13.5 2Z" fill="#CC785C" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                  Claude Code
                </span>
              </div>
            </div>

            {/* Git Branch Badge */}
            <div className="flex items-center gap-3 ml-6">
              <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-soft-md flex items-center justify-center p-3 transition-all duration-200 hover:scale-110 hover:shadow-soft-lg group relative cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M21.6 10.9L13.1 2.4C12.3 1.6 11.1 1.6 10.3 2.4L8.4 4.3L10.9 6.8C11.6 6.5 12.5 6.7 13.1 7.3C13.7 7.9 13.9 8.8 13.6 9.5L16.1 12C16.8 11.7 17.7 11.9 18.3 12.5C19.1 13.3 19.1 14.6 18.3 15.4C17.5 16.2 16.2 16.2 15.4 15.4C14.8 14.8 14.6 13.9 14.9 13.2L12.6 10.9V16.3C12.8 16.5 13 16.8 13.1 17.1C13.6 18.2 13.1 19.5 12 20C10.9 20.5 9.6 20 9.1 18.9C8.6 17.8 9.1 16.5 10.2 16C10.5 15.8 10.8 15.8 11.1 15.8V10.4C10.8 10.4 10.5 10.4 10.2 10.2L7.7 12.7C8 13.4 7.8 14.3 7.2 14.9C6.4 15.7 5.1 15.7 4.3 14.9C3.5 14.1 3.5 12.8 4.3 12C4.9 11.4 5.8 11.2 6.5 11.5L9 9C8.7 8.3 8.9 7.4 9.5 6.8C10.1 6.2 11 6 11.7 6.3L9.2 3.8L2.4 10.6C1.6 11.4 1.6 12.6 2.4 13.4L10.9 21.9C11.7 22.7 12.9 22.7 13.7 21.9L21.6 14C22.4 13.2 22.4 12 21.6 10.9Z" fill="#F05032" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                  Local Git HEAD
                </span>
              </div>
            </div>
          </div>

          {/* Floating App Icons on Right Rail (Machine B Tools: Slack, TypeScript, Vitest) */}
          <div className="hidden xl:flex flex-col gap-4 absolute -right-12 top-1/2 -translate-y-1/2 z-20">
            <div className="flex items-center gap-3 justify-end">
              {/* Slack Logo Badge */}
              <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-soft-md flex items-center justify-center p-3 transition-all duration-200 hover:scale-110 hover:shadow-soft-lg group relative cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M5.04 14.84a2.27 2.27 0 1 1-2.27-2.27h2.27v2.27zm1.14 0a2.27 2.27 0 0 1 4.54 0v5.68a2.27 2.27 0 1 1-4.54 0v-5.68z" fill="#E01E5A"/>
                  <path d="M9.16 5.04a2.27 2.27 0 1 1-2.27-2.27v2.27h2.27zm0 1.14a2.27 2.27 0 0 1 0 4.54H3.48a2.27 2.27 0 1 1 0-4.54h5.68z" fill="#36C5F0"/>
                  <path d="M18.96 9.16a2.27 2.27 0 1 1 2.27 2.27h-2.27V9.16zm-1.14 0a2.27 2.27 0 0 1-4.54 0V3.48a2.27 2.27 0 1 1 4.54 0v5.68z" fill="#2EB67D"/>
                  <path d="M14.84 18.96a2.27 2.27 0 1 1 2.27 2.27v-2.27h-2.27zm0-1.14a2.27 2.27 0 0 1 0-4.54h5.68a2.27 2.27 0 1 1 0 4.54h-5.68z" fill="#ECB22E"/>
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                  Slack Channel Bridge
                </span>
              </div>

              {/* TypeScript Logo Badge */}
              <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-soft-md flex items-center justify-center p-3 transition-all duration-200 hover:scale-110 hover:shadow-soft-lg group relative cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="4" fill="#3178C6" />
                  <path d="M11.5 8H6V9.5H8V17H9.5V9.5H11.5V8Z" fill="white" />
                  <path d="M17.5 10.5C17.5 9.1 16.4 8 14.8 8C13.2 8 12.2 9.1 12.2 10.3H13.6C13.6 9.7 14.1 9.2 14.8 9.2C15.5 9.2 16 9.7 16 10.3C16 10.9 15.6 11.3 14.6 11.7C13.2 12.3 12.2 13.1 12.2 14.6C12.2 16.1 13.3 17.1 14.9 17.1C16.6 17.1 17.7 16 17.7 14.7H16.2C16.2 15.4 15.6 15.9 14.9 15.9C14.2 15.9 13.7 15.4 13.7 14.7C13.7 13.9 14.1 13.5 15.2 13.1C16.6 12.5 17.5 11.8 17.5 10.5Z" fill="white" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                  tsc --noEmit Check
                </span>
              </div>
            </div>

            {/* Vitest Logo Badge */}
            <div className="flex items-center gap-3 justify-end mr-6">
              <div className="w-13 h-13 rounded-2xl bg-white border border-neutral-200/80 shadow-soft-md flex items-center justify-center p-3 transition-all duration-200 hover:scale-110 hover:shadow-soft-lg group relative cursor-pointer">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 16H10L8 22L19 9H13L15 2H12Z" fill="#729B1A" />
                  <path d="M13 2L6 14H11L9 20L18 8H13L13 2Z" fill="#FCC72B" opacity="0.65" />
                </svg>
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-30">
                  Vitest Runner
                </span>
              </div>
            </div>
          </div>

          {/* Centerpiece Floating Window Card */}
          <div className="relative z-10 mx-auto max-w-lg w-full bg-white rounded-3xl border border-neutral-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] p-5 sm:p-7 text-left">
            {/* Window Top Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                <span className="text-orange-500 font-bold">✦</span>
                <span>PactRoom</span>
                <span className="text-neutral-400 font-mono text-[10px]">#api-contracts</span>
              </div>
              <div className="w-10" />
            </div>

            {/* Conversation Messages Stream (Mirrors Lindy Chat) */}
            <div className="py-5 space-y-3 font-sans text-xs">
              {/* Message 1 (Agent - Watch) */}
              <div className="bg-[#F8F8F6] text-neutral-700 p-3.5 rounded-2xl rounded-tl-sm max-w-[90%] border border-neutral-100">
                <div className="text-[10px] font-semibold text-sky-600 mb-0.5">@pact-watch (Machine A)</div>
                <div className="break-words">
                  Monitoring <code className="font-mono text-neutral-900 bg-neutral-200/60 px-1 py-0.5 rounded break-all">workspaces/backend-api</code> for uncommitted DTO changes.
                </div>
              </div>

              {/* Message 2 (Agent - Breaking Change Alert) */}
              <div className="bg-[#F8F8F6] text-neutral-700 p-3.5 rounded-2xl rounded-tl-sm max-w-[92%] border border-neutral-100">
                <div className="text-[10px] font-semibold text-amber-600 mb-0.5">⚠️ Breaking Mutation Detected</div>
                <div className="break-words">
                  <code className="font-mono text-neutral-900 break-all">total_amount_cents</code> refactored to nested <code className="font-mono text-neutral-900 break-all">pricing_breakdown.amount_minor</code> in <code className="font-mono text-neutral-900 break-all">orders.dto.ts</code>.
                </div>
              </div>

              {/* Message 3 (Human Reply - Warm Peach Speech Bubble like Lindy) */}
              <div className="ml-auto bg-gradient-to-r from-orange-100/80 to-amber-100/70 border border-orange-200/60 text-orange-950 p-3.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-soft-sm">
                <div className="text-[10px] font-semibold text-orange-800 mb-0.5">Lead Engineer (Human)</div>
                <div className="break-words">Can you verify if this breaks Machine B consumer?</div>
              </div>

              {/* Message 4 (Agent - Verify Diagnosed TS Failure) */}
              <div className="bg-[#F8F8F6] text-neutral-700 p-3.5 rounded-2xl rounded-tl-sm max-w-[92%] border border-neutral-100">
                <div className="text-[10px] font-semibold text-emerald-600 mb-0.5">@pact-verify (Machine B)</div>
                <div className="break-words">
                  Ran <code className="font-mono text-neutral-900">tsc --noEmit</code>. Discovered 2 compiler breakages in <code className="font-mono text-neutral-900 break-all">CheckoutSummary.tsx:22</code>.
                </div>
              </div>

              {/* Message 5 (Human Sign-off Option) */}
              <div className="bg-amber-50/80 border border-amber-200/70 text-amber-950 p-3.5 rounded-2xl rounded-tl-sm max-w-[95%] shadow-soft-sm">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 mb-1">
                  <span>HUMAN APPROVAL GATE</span>
                  <span className="font-mono text-[9px] bg-amber-200/60 px-1.5 py-0.5 rounded">auto_approve: false</span>
                </div>
                <div className="break-words">
                  Option B ready: Auto-patch <code className="font-mono text-amber-900 break-all">CheckoutSummary.tsx</code> to target schema. Awaiting your approval.
                </div>
              </div>
            </div>

            {/* Bottom Input Field (Lindy Style with Orange Submit Arrow) */}
            <div className="relative pt-2">
              <div className="flex items-center rounded-2xl border border-neutral-200 bg-[#FBFBFA] px-4 py-2.5 focus-within:border-neutral-400 transition-colors">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe your workflows or type @watch..."
                  className="w-full bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Submit message"
                  className="w-7 h-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-transform active:scale-90 shrink-0 ml-2"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Proof / Logo Bar (Lindy Style) */}
        <div className="mt-20 sm:mt-24 pt-8 border-t border-neutral-200/60 max-w-4xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-6">
            Trusted by 8 million users at leading companies
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all text-neutral-800 font-bold text-sm tracking-tight">
            <span className="hover:text-black transition-colors font-mono">braze</span>
            <span className="hover:text-black transition-colors">SIEMENS</span>
            <span className="hover:text-black transition-colors font-mono">asana</span>
            <span className="hover:text-black transition-colors">afterpay<span className="text-orange-500">✦</span></span>
            <span className="hover:text-black transition-colors font-mono">rubrik</span>
            <span className="hover:text-black transition-colors tracking-widest">SONOS</span>
          </div>
        </div>
      </div>
    </section>
  );
};
