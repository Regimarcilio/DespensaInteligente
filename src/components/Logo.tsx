import React from 'react';
import { Sparkles, Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  escuro?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  escuro = false,
  className = '',
}) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Creative Emblem Badge */}
      <div className="relative">
        <div
          className={`relative rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md ${
            isLarge
              ? 'w-13 h-13 rounded-2xl'
              : isSmall
              ? 'w-8 h-8 rounded-xl'
              : 'w-10.5 h-10.5 rounded-2xl'
          } ${
            escuro
              ? 'bg-gradient-to-br from-[#0B6E5F] via-[#104E43] to-[#0D3830] text-[#6EE7B7] border border-[#30B09E]/30 shadow-[#0B6E5F]/20'
              : 'bg-gradient-to-br from-[#0B6E5F] via-[#0E8A77] to-[#125C51] text-[#E0F2EE] border border-[#0B6E5F]/30 shadow-[#0B6E5F]/15'
          }`}
        >
          {/* Subtle Ambient Pulse / Freshness halo */}
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#30B09E]/30 to-[#FFB224]/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xs" />

          {/* Custom SVG Icon combining Pantry Cabinet + Fresh Sprout + Heart of Preservation */}
          <svg
            className={`relative z-10 transition-transform duration-300 group-hover:rotate-[-4deg] ${
              isLarge ? 'w-7 h-7' : isSmall ? 'w-4.5 h-4.5' : 'w-6 h-6'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Pantry / Cloche Arch & Shelves */}
            <path d="M4 10a8 8 0 0 1 16 0v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10z" />
            <path d="M4 14h16" />
            <path d="M10 14v7" />
            {/* Freshness Sprout sprouting from the top */}
            <path d="M12 4v4" />
            <circle cx="12" cy="3" r="1.5" fill="currentColor" />
          </svg>

          {/* Sparkle / Star indicator in the corner */}
          <div className="absolute -top-1 -right-1 bg-[#FF8A00] text-white p-0.5 rounded-full shadow-xs animate-pulse">
            <Sparkles className={isSmall ? 'w-2 h-2' : 'w-2.5 h-2.5'} />
          </div>
        </div>
      </div>

      {/* Typography Lockup */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-display font-extrabold tracking-tight transition-colors ${
              isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-xl'
            } ${
              escuro
                ? 'text-[#F2F5FF] group-hover:text-[#6EE7B7]'
                : 'text-[#14343C] group-hover:text-[#0B6E5F]'
            }`}
          >
            Despensa
          </span>
          <span
            className={`font-display italic font-semibold ${
              isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-xl'
            } text-[#FF8A00]`}
          >
            Inteligente
          </span>
        </div>

        {/* Dynamic Micro-Subtitle */}
        {!isSmall && (
          <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase">
            <span
              className={`font-semibold transition-colors ${
                escuro ? 'text-[#9CB3B8]' : 'text-[#506368]'
              }`}
            >
              Zero Desperdício
            </span>
            <span className="w-1 h-1 rounded-full bg-[#30B09E]" />
            <span className="text-[#30B09E] font-bold">100% Offline</span>
          </div>
        )}
      </div>
    </div>
  );
};
