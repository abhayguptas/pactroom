/**
 * PactRoom Design Tokens
 * Visual Identity System for Flip the Switch Hackathon (Business Workflow Track)
 * High-craft dark developer aesthetic inspired by Linear, Raycast, and Vercel.
 */

export const brandTokens = {
  colors: {
    // Surface & Elevation Surfaces
    obsidian: {
      DEFAULT: '#07090E', // Deep obsidian background surface
      pure: '#040508',
      surface: '#0B0F19',
      card: '#0F1420',    // Elevated glassmorphic card surface
      elevated: '#141B2D',
      hover: '#192238'
    },

    // Machine A: Backend Developer Agent (Telemetry, Schema Exports & Git Diffs)
    machineA: {
      DEFAULT: '#06B6D4', // Electric Cyan
      glow: 'rgba(6, 182, 212, 0.45)',
      subtle: 'rgba(6, 182, 212, 0.12)',
      border: 'rgba(6, 182, 212, 0.28)',
      gradient: {
        from: '#06B6D4',
        to: '#0284C7'
      }
    },

    // Machine B: Frontend Consumer Agent (Compatibility Passes & Verified Patches)
    machineB: {
      DEFAULT: '#10B981', // Neon Emerald
      glow: 'rgba(16, 185, 129, 0.45)',
      subtle: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.28)',
      gradient: {
        from: '#10B981',
        to: '#059669'
      }
    },

    // Switch Room Approval Gates & Pending Negotiations
    amber: {
      DEFAULT: '#F59E0B', // Amber Gold
      glow: 'rgba(245, 158, 11, 0.45)',
      subtle: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.28)'
    },

    // Breaking API Contract Alerts & Failing TypeScript Lines
    rose: {
      DEFAULT: '#F43F5E', // Rose Crimson
      glow: 'rgba(244, 63, 94, 0.45)',
      subtle: 'rgba(244, 63, 94, 0.12)',
      border: 'rgba(244, 63, 94, 0.28)'
    },

    // Switch Toggle Bridge Accent
    switchBridge: {
      indigo: '#6366F1',
      purple: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #10B981 100%)'
    },

    // Borders & Glass
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      glass: 'rgba(255, 255, 255, 0.10)', // 1-pixel borders at 10% white opacity
      highlight: 'rgba(255, 255, 255, 0.18)'
    }
  },

  typography: {
    fontFamily: {
      sans: ['Inter', 'Geist Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace']
    }
  },

  shadows: {
    card: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
    cyanGlow: '0 0 24px -2px rgba(6, 182, 212, 0.4)',
    emeraldGlow: '0 0 24px -2px rgba(16, 185, 129, 0.4)',
    amberGlow: '0 0 24px -2px rgba(245, 158, 11, 0.4)',
    roseGlow: '0 0 24px -2px rgba(244, 63, 94, 0.4)'
  }
} as const;

export type BrandTokens = typeof brandTokens;

