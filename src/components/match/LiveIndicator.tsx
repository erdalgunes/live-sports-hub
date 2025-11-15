/**
 * LiveIndicator Component
 *
 * Shows live status badge for ongoing matches
 * - Animated pulsing dot
 * - Customizable size and style
 * - Optional match minute display
 *
 * Features:
 * - Accessible with ARIA labels
 * - Multiple size variants
 * - Customizable colors
 * - Animated pulse effect
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  /** Show the text "LIVE" next to the indicator */
  readonly showText?: boolean;
  /** Display match minute */
  readonly minute?: number | null;
  /** Size variant */
  readonly size?: 'small' | 'medium' | 'large';
  /** Custom className */
  readonly className?: string;
  /** Pulse animation */
  readonly animated?: boolean;
}

const sizeClasses = {
  small: 'text-[10px] px-1.5 py-0.5 gap-1',
  medium: 'text-xs px-2.5 py-1 gap-1.5',
  large: 'text-sm px-3 py-1.5 gap-2',
} as const;

const dotSizeClasses = {
  small: 'w-1 h-1',
  medium: 'w-1.5 h-1.5',
  large: 'w-2 h-2',
} as const;

export function LiveIndicator({
  showText = true,
  minute,
  size = 'medium',
  className = '',
  animated = true,
}: LiveIndicatorProps) {
  return (
    <output
      className={cn(
        'inline-flex items-center bg-red-600/10 text-red-600 rounded-2xl font-semibold uppercase',
        sizeClasses[size],
        className
      )}
      aria-live="polite"
      aria-label={minute ? `Live match, minute ${minute}` : 'Live match'}
    >
      <span
        className={cn(
          'inline-block bg-red-600 rounded-full',
          dotSizeClasses[size],
          animated && 'animate-[pulse-live_2s_ease-in-out_infinite]'
        )}
      />
      {showText && <span className="leading-none">LIVE</span>}
      {minute !== null && minute !== undefined && (
        <span className="ml-0.5 font-bold leading-none">{minute}&apos;</span>
      )}
    </output>
  );
}

/**
 * Compact live indicator (just the dot)
 */
export function LiveDot({
  size = 'medium',
  animated = true,
  className = '',
}: {
  readonly size?: 'small' | 'medium' | 'large';
  readonly animated?: boolean;
  readonly className?: string;
}) {
  const liveDotSizeClasses = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-2.5 h-2.5',
  } as const;

  return (
    <output
      className={cn('inline-flex items-center justify-center', className)}
      aria-label="Live"
    >
      <span
        className={cn(
          'inline-block bg-red-600 rounded-full',
          liveDotSizeClasses[size],
          animated && 'animate-[pulse-dot_2s_ease-in-out_infinite]'
        )}
      />
    </output>
  );
}

/**
 * Live badge for match cards
 */
export function LiveBadge({
  minute,
  className = '',
}: {
  readonly minute?: number | null;
  readonly className?: string;
}) {
  return (
    <output className={cn('inline-block', className)} aria-live="polite">
      <LiveIndicator showText={true} minute={minute} size="small" animated={true} />
    </output>
  );
}
