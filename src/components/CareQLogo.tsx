import React from 'react';

interface CareQLogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // 'dark' = for dark Navy background (white text), 'light' = for white/light background (navy text)
  layout?: 'stacked' | 'horizontal' | 'icon-only';
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CareQLogo: React.FC<CareQLogoProps> = ({
  className = '',
  variant = 'dark',
  layout = 'horizontal',
  showTagline = true,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // SVG Icon representation of the CareQ emblem
  const renderIcon = () => (
    <svg
      viewBox="0 0 100 100"
      className={`${iconSizes[size]} shrink-0 transition-transform hover:scale-105`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CareQ Logo"
    >
      <defs>
        <linearGradient id="cq-ring-grad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#39B54A" />
          <stop offset="50%" stopColor="#12A89D" />
          <stop offset="100%" stopColor="#087F8C" />
        </linearGradient>

        <linearGradient id="cq-pill-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#39B54A" />
          <stop offset="100%" stopColor="#12A89D" />
        </linearGradient>

        <linearGradient id="cq-tail-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#12A89D" />
          <stop offset="100%" stopColor="#087F8C" />
        </linearGradient>
      </defs>

      {/* Main Q Circular Ring */}
      <circle
        cx="48"
        cy="44"
        r="28"
        stroke="url(#cq-ring-grad)"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Embedded Capsule Pill in lower-left of ring */}
      <g transform="translate(32, 57) rotate(42)">
        {/* Capsule background */}
        <rect
          x="-5.5"
          y="-11"
          width="11"
          height="22"
          rx="5.5"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        {/* Lower capsule body filled with primary green/teal */}
        <path
          d="M -5.5,0 L 5.5,0 A 5.5,5.5 0 0,1 -5.5,0 Z"
          transform="translate(0, 5.5)"
          fill="url(#cq-pill-grad)"
        />
        {/* White outline on capsule */}
        <rect
          x="-5.5"
          y="-11"
          width="11"
          height="22"
          rx="5.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#FFFFFF" strokeWidth="1" />
      </g>

      {/* Diagonal Q Tail */}
      <g transform="translate(62, 58) rotate(42)">
        <rect
          x="-5"
          y="-3"
          width="10"
          height="19"
          rx="5"
          fill="url(#cq-tail-grad)"
        />
      </g>
    </svg>
  );

  if (layout === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  if (layout === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {renderIcon()}
        <div className="mt-2">
          <span className={`font-display font-extrabold tracking-tight ${textSizes[size]}`}>
            <span className={variant === 'dark' ? 'text-white' : 'text-[#102A43]'}>Care</span>
            <span className="text-[#39B54A]">Q</span>
          </span>
          {showTagline && (
            <p className={`font-medium tracking-wide mt-0.5 ${taglineSizes[size]} ${
              variant === 'dark' ? 'text-teal-200/80' : 'text-[#6B7C93]'
            }`}>
              The Right Medicine. The Right Time.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {renderIcon()}
      <div className="flex flex-col">
        <span className={`font-display font-extrabold tracking-tight leading-none ${textSizes[size]}`}>
          <span className={variant === 'dark' ? 'text-white' : 'text-[#102A43]'}>Care</span>
          <span className="text-[#39B54A]">Q</span>
        </span>
        {showTagline && (
          <span className={`font-medium tracking-tight mt-1 whitespace-nowrap ${taglineSizes[size]} ${
            variant === 'dark' ? 'text-teal-200/80' : 'text-[#6B7C93]'
          }`}>
            The Right Medicine. The Right Time.
          </span>
        )}
      </div>
    </div>
  );
};
