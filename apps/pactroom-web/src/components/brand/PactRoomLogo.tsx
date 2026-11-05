'use client';

import React from 'react';
import Link from 'next/link';

export interface PactRoomLogoProps {
  /**
   * Logo variant:
   * - 'full': Brand mark with wordmark and optional badge
   * - 'icon': Pure geometric shape mark
   */
  variant?: 'full' | 'icon';
  /**
   * Predefined or numeric size in pixels
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Optional custom CSS class name
   */
  className?: string;
  /**
   * Custom text for the protocol badge in 'full' variant
   */
  badgeText?: string;
  /**
   * Toggle visibility of the badge in 'full' variant
   */
  showBadge?: boolean;
  /**
   * Optional URL to wrap the logo in a link
   */
  href?: string;
  /**
   * Disable interactive hover/scale state
   */
  interactive?: boolean;
  /**
   * Theme mode: 'light' | 'dark' | 'auto'
   */
  theme?: 'light' | 'dark' | 'auto';
}

const SIZE_MAP = {
  sm: { icon: 26, text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5', gap: 'gap-2.5' },
  md: { icon: 34, text: 'text-xl', badge: 'text-[10px] px-2 py-0.5', gap: 'gap-3' },
  lg: { icon: 44, text: 'text-2xl', badge: 'text-[11px] px-2.5 py-0.5', gap: 'gap-3.5' },
  xl: { icon: 60, text: 'text-3xl', badge: 'text-xs px-3 py-1', gap: 'gap-4' }
};

/**
 * Pure Geometric Shape Emblem:
 * An iconic, YC-grade consensus mark representing two machines (Backend Machine A
 * and Frontend Machine B) interlocking into an unbreakable contract loop.
 * Pure vector geometry with zero rainbow colors.
 */
export const PactRoomEmblem: React.FC<{
  size: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}> = ({ size, className = '', theme = 'light' }) => {
  const isDark = theme === 'dark';
  const fillA = isDark ? '#FFFFFF' : '#18181B'; // Machine A (Obsidian)
  const fillB = isDark ? '#A1A1AA' : '#3F3F46'; // Machine B (Refined Graphite)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="PactRoom Emblem"
    >
      {/* Machine A (Left / Provider Bracket): Sharp precision chamfer */}
      <path
        d="M 6 12 C 6 7.58 9.58 4 14 4 L 21 4 C 22.1 4 23 4.9 23 6 L 23 10 C 23 11.1 22.1 12 21 12 L 15 12 C 13.9 12 13 12.9 13 14 L 13 22 C 13 23.1 13.9 24 15 24 L 21 24 C 22.1 24 23 24.9 23 26 L 23 30 C 23 31.1 22.1 32 21 32 L 14 32 C 9.58 32 6 28.42 6 24 Z"
        fill={fillA}
      />
      {/* Machine B (Right / Consumer Bracket): Interlocks with Machine A */}
      <path
        d="M 30 24 C 30 28.42 26.42 32 22 32 L 17 32 C 15.9 32 15 31.1 15 30 L 15 26 C 15 24.9 15.9 24 17 24 L 21 24 C 22.1 24 23 23.1 23 22 L 23 14 C 23 12.9 22.1 12 21 12 L 17 12 C 15.9 12 15 11.1 15 10 L 15 6 C 15 4.9 15.9 4 17 4 L 22 4 C 26.42 4 30 7.58 30 12 Z"
        fill={fillB}
      />
      {/* Central Consensus Core (The Switch Room Meeting Point) */}
      <rect x="16" y="16" width="4" height="4" rx="1" fill={fillA} />
    </svg>
  );
};

/**
 * High-End Reusable PactRoom Brand Component
 */
export const PactRoomLogo: React.FC<PactRoomLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  badgeText = 'Switch Room Protocol',
  showBadge = false,
  href = '/',
  interactive = true,
  theme = 'light'
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size].icon;
  const config = typeof size === 'string' ? SIZE_MAP[size] : SIZE_MAP.md;

  const content = (
    <div
      className={`inline-flex items-center ${config.gap} select-none group ${className}`}
    >
      {/* Pure Geometric Emblem */}
      <div className="relative flex items-center justify-center">
        <PactRoomEmblem
          size={pixelSize}
          theme={theme}
          className={
            interactive
              ? 'transition-transform duration-200 group-hover:scale-105'
              : ''
          }
        />
      </div>

      {/* Wordmark (Solid Monochrome Typography Matching Theme) */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            <span
              className={`font-sans font-bold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-neutral-900'
              } ${config.text}`}
            >
              PactRoom
            </span>
          </div>

          {showBadge && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span
                className={`font-mono uppercase tracking-wider font-semibold ${config.badge} rounded-full ${
                  theme === 'dark'
                    ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200/80'
                }`}
              >
                {badgeText}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none rounded-lg inline-block">
        {content}
      </Link>
    );
  }

  return content;
};

export default PactRoomLogo;
