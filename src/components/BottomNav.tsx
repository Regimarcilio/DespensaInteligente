import React from 'react';
import { Package, ShoppingCart, CircleDollarSign, Sparkles } from 'lucide-react';

interface BottomNavProps {
  abaAtiva: 'ESTOQUE' | 'LISTA' | 'ECONOMIA';
  onMudarAba: (aba: 'ESTOQUE' | 'LISTA' | 'ECONOMIA') => void;
  escuro: boolean;
  totalItens?: number;
  totalVencendo?: number;
  itensLista?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  abaAtiva,
  onMudarAba,
  escuro,
  totalItens = 0,
  totalVencendo = 0,
  itensLista = 0,
}) => {
  const abas = [
    {
      id: 'ESTOQUE' as const,
      label: 'Estoque',
      icon: Package,
      badge: totalVencendo > 0 ? totalVencendo : null,
      badgeColor: 'bg-[#FF8A00] text-white',
    },
    {
      id: 'LISTA' as const,
      label: 'Lista Compras',
      icon: ShoppingCart,
      badge: itensLista > 0 ? itensLista : null,
      badgeColor: 'bg-[#0B6E5F] text-white',
    },
    {
      id: 'ECONOMIA' as const,
      label: 'Economia R$',
      icon: CircleDollarSign,
      badge: null,
      badgeColor: '',
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-lg select-none pb-[env(safe-area-inset-bottom,0px)] transition-colors ${
        escuro
          ? 'bg-[#0A0E1A]/95 border-[#26414B]'
          : 'bg-[#FFFBF4]/95 border-[#D8E6E8]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {abas.map((aba) => {
          const ativa = abaAtiva === aba.id;
          const Icon = aba.icon;

          return (
            <button
              key={aba.id}
              type="button"
              onClick={() => onMudarAba(aba.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 group focus:outline-hidden"
            >
              {/* Highlight background pill for active state */}
              <div
                className={`relative px-5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  ativa
                    ? escuro
                      ? 'bg-[#30B09E]/20 text-[#6EE7B7]'
                      : 'bg-[#E0F2EE] text-[#0B6E5F]'
                    : escuro
                    ? 'text-[#9CB3B8] hover:text-[#F2F5FF]'
                    : 'text-[#506368] hover:text-[#14343C]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    ativa ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Badge if present */}
                {aba.badge !== null && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs ${aba.badgeColor}`}
                  >
                    {aba.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-colors ${
                  ativa
                    ? escuro
                      ? 'font-bold text-[#6EE7B7]'
                      : 'font-bold text-[#0B6E5F]'
                    : escuro
                    ? 'text-[#9CB3B8]'
                    : 'text-[#506368]'
                }`}
              >
                {aba.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
