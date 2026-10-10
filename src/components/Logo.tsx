import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  escuro?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  escuro = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Artisanal SVG Logo Mark: Ice Vault + Fresh Leaf & Amber Spark */}
      <div className={`relative shrink-0 ${iconDimensions}`}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Primary Teal Gradient */}
            <linearGradient id="despensaTealGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0E9F8A" />
              <stop offset="60%" stopColor="#0B6E5F" />
              <stop offset="100%" stopColor="#084E43" />
            </linearGradient>

            {/* Ice Frost Glow */}
            <linearGradient id="despensaFrost" x1="16" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38E1FF" stopOpacity="0.4" />
            </linearGradient>

            {/* Amber Freshness Accent */}
            <linearGradient id="despensaAmber" x1="26" y1="16" x2="46" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFB224" />
              <stop offset="100%" stopColor="#FF8A00" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="logoShadow" x="0" y="0" width="64" height="64" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0B6E5F" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Hexagonal Isometric Pantry Cube Base */}
          <path
            d="M32 4L54 16.7V42.3L32 55L10 42.3V16.7L32 4Z"
            fill="url(#despensaTealGrad)"
            rx="6"
          />

          {/* Top Facet of the Isometric Cube (Pantry Lid/Ice Cap) */}
          <path
            d="M32 6L51 17L32 28L13 17L32 6Z"
            fill="#FFFFFF"
            fillOpacity={escuro ? "0.22" : "0.32"}
          />

          {/* Left Facet Shading */}
          <path
            d="M13 19L31 29.5V52L13 41.5V19Z"
            fill="#000000"
            fillOpacity="0.18"
          />

          {/* Right Facet Shading */}
          <path
            d="M33 29.5L51 19V41.5L33 52V29.5Z"
            fill="#FFFFFF"
            fillOpacity="0.1"
          />

          {/* Organic Freshness Leaf & Preserve Silhouette in Center */}
          <path
            d="M32 18C32 18 39 21.5 40 29C41 36.5 34.5 42 32 42C29.5 42 23 36.5 24 29C25 21.5 32 18 32 18Z"
            fill="url(#despensaFrost)"
          />

          {/* Central Stem Line */}
          <path
            d="M32 22V39"
            stroke="#0B6E5F"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Golden Sunshine / Economy Sparkle (Savings & Value preserved) */}
          <circle cx="39" cy="21" r="4.5" fill="url(#despensaAmber)" />
          <path
            d="M39 15V17M39 25V27M33 21H35M43 21H45"
            stroke="#FFB224"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Rim Glint on top-left edge */}
          <path
            d="M32 6L13 17"
            stroke="#6EE7B7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
        </svg>

        {/* Small subtle badge ping (decorative cold spark) */}
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF8A00] ring-2 ring-white dark:ring-[#0A0E1A]" />
      </div>

      {/* Brand Typography Lockup */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold font-display tracking-tight transition-colors ${
                size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'
              } ${escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'}`}
            >
              Despensa
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[#0B6E5F]/15 text-[#0B6E5F] dark:bg-[#6EE7B7]/20 dark:text-[#6EE7B7]"
            >
              PRO
            </span>
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-[0.22em] text-[#FF8A00] mt-0.5"
          >
            Inteligente
          </span>
        </div>
      )}
    </div>
  );
};
