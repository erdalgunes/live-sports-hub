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

export function LiveIndicator({
  showText = true,
  minute,
  size = 'medium',
  className = '',
  animated = true,
}: LiveIndicatorProps) {
  return (
    <output
      className={`live-indicator live-indicator--${size} ${className}`}
      aria-live="polite"
      aria-label={minute ? `Live match, minute ${minute}` : 'Live match'}
    >
      <span className={`live-indicator__dot ${animated ? 'live-indicator__dot--animated' : ''}`} />
      {showText && <span className="live-indicator__text">LIVE</span>}
      {minute !== null && minute !== undefined && (
        <span className="live-indicator__minute">{minute}&apos;</span>
      )}

      {/* sonar-disable-next-line typescript:S6747 */}
      <style jsx>{`
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--live-bg, rgba(220, 38, 38, 0.1));
          color: var(--live-text, #dc2626);
          padding: 4px 10px;
          border-radius: 16px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .live-indicator--small {
          font-size: 10px;
          padding: 2px 6px;
          gap: 4px;
        }

        .live-indicator--medium {
          font-size: 12px;
          padding: 4px 10px;
          gap: 6px;
        }

        .live-indicator--large {
          font-size: 14px;
          padding: 6px 12px;
          gap: 8px;
        }

        .live-indicator__dot {
          display: inline-block;
          background: var(--live-text, #dc2626);
          border-radius: 50%;
        }

        .live-indicator--small .live-indicator__dot {
          width: 4px;
          height: 4px;
        }

        .live-indicator--medium .live-indicator__dot {
          width: 6px;
          height: 6px;
        }

        .live-indicator--large .live-indicator__dot {
          width: 8px;
          height: 8px;
        }

        .live-indicator__dot--animated {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
        }

        .live-indicator__text {
          line-height: 1;
        }

        .live-indicator__minute {
          margin-left: 2px;
          font-weight: 700;
          line-height: 1;
        }
      `}</style>
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
  return (
    <output
      className={`live-dot live-dot--${size} ${className}`}
      aria-label="Live"
    >
      <span className={`live-dot__indicator ${animated ? 'live-dot__indicator--animated' : ''}`} />

      {/* sonar-disable-next-line typescript:S6747 */}
      <style jsx>{`
        .live-dot {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .live-dot__indicator {
          display: inline-block;
          background: var(--live-text, #dc2626);
          border-radius: 50%;
        }

        .live-dot--small .live-dot__indicator {
          width: 6px;
          height: 6px;
        }

        .live-dot--medium .live-dot__indicator {
          width: 8px;
          height: 8px;
        }

        .live-dot--large .live-dot__indicator {
          width: 10px;
          height: 10px;
        }

        .live-dot__indicator--animated {
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 0 0 var(--live-text, #dc2626);
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 0 4px rgba(220, 38, 38, 0);
          }
        }
      `}</style>
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
    <output className={`live-badge ${className}`} aria-live="polite">
      <LiveIndicator showText={true} minute={minute} size="small" animated={true} />

      {/* sonar-disable-next-line typescript:S6747 */}
      <style jsx>{`
        .live-badge {
          display: inline-block;
        }
      `}</style>
    </output>
  );
}
