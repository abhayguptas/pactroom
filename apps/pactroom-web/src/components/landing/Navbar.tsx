'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Menu,
  X,
  Layers,
  Sliders,
  FileCode2,
  Sparkles
} from 'lucide-react';
import { PactRoomLogo } from '@/components/brand/PactRoomLogo';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#FAFAF8]/90 backdrop-blur-xl border-b border-neutral-200/80 shadow-soft-sm py-3'
        : 'bg-[#FAFAF8]/60 backdrop-blur-md py-4 border-b border-neutral-200/40'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          {/* Left: Clean Brand Logo */}
          <div className="flex items-center">
            <PactRoomLogo variant="full" size="sm" showBadge={false} href="/" theme="light" />
          </div>

          {/* Center: Navigation Links (Lindy Minimalist Style) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
            <a
              href="#evaluator-guide"
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              Mentor Guide
            </a>
            <a
              href="#problem-solution"
              className="hover:text-neutral-900 transition-colors"
            >
              The Problem
            </a>
            <a
              href="#features"
              className="hover:text-neutral-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#visualizer"
              className="hover:text-neutral-900 transition-colors"
            >
              Live Visualizer
            </a>
            <a
              href="#comparison"
              className="hover:text-neutral-900 transition-colors"
            >
              Roadmap
            </a>
            <a
              href="#template"
              className="hover:text-neutral-900 transition-colors"
            >
              Switch YAML
            </a>
            <a
              href="#architecture"
              className="hover:text-neutral-900 transition-colors"
            >
              Architecture
            </a>
          </nav>

          {/* Right: Switch Status & Black Pill CTA (Lindy Style) */}
          <div className="flex items-center gap-3">
            {/* Live Switch Room Indicator Pill */}
            <a
              href={process.env.NEXT_PUBLIC_MATTERMOST_URL || 'http://localhost:60015'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-[11px] font-mono shadow-soft-sm transition-colors"
              title="Open Mattermost Collaborative Room in Switch Console"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-neutral-500">Switch Room:</span>
              <span className="text-emerald-700 font-semibold">#pactroom-api-contracts (:60015)</span>
            </a>

            <Link
              href="/studio"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-neutral-900 hover:bg-black text-white font-medium text-xs transition-all shadow-sm active:scale-95"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-4 pt-3 pb-6 space-y-2 mt-2 shadow-lg">
          <a
            href="#evaluator-guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-orange-600 bg-orange-50 hover:bg-orange-100 text-sm font-semibold"
          >
            ✦ Mentor &amp; Judge Guide
          </a>
          <a
            href="#problem-solution"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            The Problem
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#three-steps"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            Three Steps
          </a>
          <a
            href="#visualizer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            Live Visualizer
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            Why Switch
          </a>
          <a
            href="#template"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            Switch YAML
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 text-sm font-medium"
          >
            Architecture
          </a>
          <div className="pt-2">
            <Link
              href="/studio"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-neutral-900 text-white font-medium text-xs"
            >
              <span>Launch Live Contract Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
