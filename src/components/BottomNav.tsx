import React from 'react';
import { Package, ShoppingCart, CircleDollarSign } from 'lucide-react';

interface BottomNavProps {
  abaAtiva: 'ESTOQUE' | 'LISTA' | 'ECONOMIA';
  onMudarAba: (aba: 'ESTOQUE' | 'LISTA' | 'ECONOMIA') => void;
  escuro: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  abaAtiva,
  onMudarAba,
  escuro,
}) => {
  const itens = [
    { id: 'ESTOQUE' as const, rotulo: 'Estoque', icon: Package },
    { id: 'LISTA' as const, rotulo: 'Lista', icon: ShoppingCart },
    { id: 'ECONOMIA' as const, rotulo: 'R$', icon: CircleDollarSign },
  ];

  const corAtiva = escuro ? '#6EE7B7' : '#0B6E5F';

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md transition-colors ${
        escuro
          ? 'bg-[#0A0E1A]/95 border-[#26414B]'
          : 'bg-[#FFFFFF]/95 border-[#D8E6E8]'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-3 py-2 px-3">
        {itens.map((item) => {
          const Icon = item.icon;
          const ativo = abaAtiva === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onMudarAba(item.id)}
              className="flex flex-col items-center justify-center py-1 transition-all active:scale-95 group"
            >
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-full transition-all ${
                  ativo
                    ? escuro
                      ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]'
                      : 'bg-[#0B6E5F]/15 text-[#0B6E5F]'
                    : escuro
                    ? 'text-[#9AA4C7] group-hover:text-[#F2F5FF]'
                    : 'text-[#47626E] group-hover:text-[#14343C]'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={`text-[12px] mt-1 transition-colors ${
                  ativo
                    ? 'font-bold'
                    : 'font-medium'
                }`}
                style={{
                  color: ativo
                    ? corAtiva
                    : escuro
                    ? '#9AA4C7'
                    : '#47626E',
                }}
              >
                {item.rotulo}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
