'use client';

import React from 'react';
import {
  Navbar,
  HeroSection,
  EvaluatorQuickStart,
  ProblemSolutionSection,
  FeatureStepsSection,
  SplitScreenVisualizer,
  ComparisonTable,
  TemplateExplorer,
  ArchitectureSection,
  Footer
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-neutral-900 overflow-x-hidden font-sans selection:bg-orange-500/15 selection:text-neutral-900">
      {/* Global Ambient Sunset & Warm Glow Lighting (Lindy Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Subtle warm ambient lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-tr from-amber-200/25 via-orange-100/20 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[35%] -left-32 w-[550px] h-[550px] bg-amber-100/30 blur-[180px] rounded-full" />
        <div className="absolute top-[65%] -right-32 w-[550px] h-[550px] bg-orange-100/25 blur-[180px] rounded-full" />
      </div>

      {/* Lindy Translucent Sticky Navbar */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* Hero Section with Floating Card & App Rail */}
        <HeroSection />

        {/* Hackathon Evaluator & Mentor Guide (Tested in 60s: Template vs Full Platform) */}
        <EvaluatorQuickStart />

        {/* The Problem We Solve: Silent Multi-Agent Blindspot Across Machines */}
        <ProblemSolutionSection />

        {/* Feature & Three Simple Steps Section (Exact Lindy Layout) */}
        <FeatureStepsSection />

        {/* Live Split-Screen Two-Laptop Switch Visualizer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <SplitScreenVisualizer />
        </div>

        {/* Open Source Access & Future GTM Roadmap */}
        <ComparisonTable />

        {/* Interactive Switch Room Template (pactroom.template.yaml) Explorer */}
        <TemplateExplorer />

        {/* 3-Pillar Cross-Machine Protocol Architecture */}
        <ArchitectureSection />
      </main>

      {/* Reclaim Your Time Banner & Deep Charcoal Footer */}
      <Footer />
    </div>
  );
}
