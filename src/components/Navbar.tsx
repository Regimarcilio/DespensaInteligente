import React from 'react';
import { SunMoon } from 'lucide-react';
import { ModoTema } from '../types';

interface NavbarProps {
  abaAtiva: 'ESTOQUE' | 'LISTA' | 'ECONOMIA';
  totalItens: number;
  modoTema: ModoTema;
  escuro: boolean;
  onAbrirTema: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  abaAtiva,
  totalItens,
  modoTema,
  escuro,
  onAbrirTema,
}) => {
  const titulos = {
    ESTOQUE: 'Despensa',
    LISTA: 'Lista',
    ECONOMIA: 'R$',
  };

  const subtitulos = {
    ESTOQUE: `${totalItens} ${totalItens === 1 ? 'item' : 'itens'} em estoque`,
    LISTA: 'Exporte para o ListaCompras',
    ECONOMIA: 'Salvos vs perdidos no mês',
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        escuro
          ? 'bg-[#0A0E1A]/95 border-[#26414B]'
          : 'bg-[#FFFBF4]/95 border-[#D8E6E8]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold font-display tracking-tight transition-colors ${
              escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
            }`}
          >
            {titulos[abaAtiva]}
          </h1>
          <p
            className={`text-xs font-medium transition-colors ${
              escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
            }`}
          >
            {subtitulos[abaAtiva]}
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onAbrirTema}
            aria-label="Alterar tema"
            className={`p-2.5 rounded-full transition-all ${
              escuro
                ? 'text-[#F2F5FF] hover:bg-[#131B36] active:scale-95'
                : 'text-[#14343C] hover:bg-[#EAF3F3] active:scale-95'
            }`}
          >
            <SunMoon className="w-5 h-5" />
          </button>
          {modoTema !== 'SISTEMA' && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF8A00] ring-2 ring-white dark:ring-[#0A0E1A]"
              title={`Tema manual: ${modoTema}`}
            />
          )}
        </div>
      </div>
    </header>
  );
};
