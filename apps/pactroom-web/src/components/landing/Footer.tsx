'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { PactRoomLogo } from '@/components/brand/PactRoomLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="relative pt-12">
      {/* ========================================================================= */}
      {/* RECLAIM YOUR TIME WITH PACTROOM (EXACT LINDY SUNSET BANNER)              */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-3xl p-12 sm:p-20 text-center overflow-hidden border border-[#FDC49E] shadow-xl sunset-glow-banner">
          {/* Subtle ambient blur highlights */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/60 to-transparent blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-sans font-bold text-neutral-900 leading-[1.1] tracking-tight">
              Reclaim Your Time With PactRoom
            </h2>

            <p className="mt-4 text-sm sm:text-base text-neutral-700 max-w-xl mx-auto leading-relaxed">
              Stop managing emails, contracts, and meeting drift manually. Let your cross-machine AI agents handle it for you.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 hover:bg-black text-white font-medium text-xs tracking-tight shadow-lg hover:shadow-xl transition-all active:scale-95 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-300 group-hover:rotate-12 transition-transform" />
                <span>Get Started for Free</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHARCOAL/BLACK FOOTER CONTAINER (EXACT LINDY FOOTER)                     */}
      {/* ========================================================================= */}
      <div className="bg-[#111317] text-neutral-400 rounded-t-[36px] pt-16 pb-12 px-6 sm:px-12 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Top Grid: Logo & 4 Navigation Columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 pb-12 border-b border-neutral-800">
            {/* Column 1: Brand Header */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <PactRoomLogo variant="full" size="sm" showBadge={false} href="/" theme="dark" />
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                The official cross-machine agent contract mesh built on the Switch Protocol.
              </p>
            </div>

            {/* Column 2: Features */}
            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Features
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Pre-commit Diffing</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Compiler Subprocesses</a></li>
                <li><a href="#three-steps" className="hover:text-white transition-colors">Human Approval Gate</a></li>
                <li><a href="#visualizer" className="hover:text-white transition-colors">Multi-Machine Simulator</a></li>
              </ul>
            </div>

            {/* Column 3: Product */}
            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Product
              </div>
              <ul className="space-y-2 text-xs">
                <li><Link href="/studio" className="hover:text-white transition-colors">Contract Studio</Link></li>
                <li><a href="#comparison" className="hover:text-white transition-colors">Pricing &amp; Mesh Tiers</a></li>
                <li><a href="#template" className="hover:text-white transition-colors">Switch Template YAML</a></li>
                <li><a href="#architecture" className="hover:text-white transition-colors">3-Pillar Architecture</a></li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Company
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="https://github.com/abhayguptas/pactroom" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a></li>
                <li><a href="https://switch.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Switch Core Protocol</a></li>
                <li><a href="https://x.com/siddhiguptas" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Updates on X</a></li>
                <li><a href="https://www.linkedin.com/in/siddhiguptas/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>

            {/* Column 5: Resources */}
            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Resources
              </div>
              <ul className="space-y-2 text-xs">
                <li><a href="https://github.com/abhayguptas/pactroom#readme" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/abhayguptas/pactroom/blob/main/pactroom.template.yaml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Switch YAML Template</a></li>
                <li><a href="/studio" className="hover:text-white transition-colors">Live Contract Studio</a></li>
                <li><a href="https://github.com/abhayguptas/pactroom" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Flip the Switch Hackathon</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row: Copyright & Social Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div>
              © 2026 PactRoom. Built for the Flip the Switch Hackathon.
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <a href="https://github.com/abhayguptas/pactroom" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://x.com/siddhiguptas" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/siddhiguptas/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
