import React from 'react';
import { ModoTema } from '../types';

interface ThemeDialogProps {
  modoAtual: ModoTema;
  onEscolher: (modo: ModoTema) => void;
  onFechar: () => void;
  escuro: boolean;
}

export const ThemeDialog: React.FC<ThemeDialogProps> = ({
  modoAtual,
  onEscolher,
  onFechar,
  escuro,
}) => {
  const opcoes: { valor: ModoTema; rotulo: string; descricao: string }[] = [
    {
      valor: 'SISTEMA',
      rotulo: 'Sistema',
      descricao: 'Segue a preferência do seu dispositivo',
    },
    {
      valor: 'CLARO',
      rotulo: 'Claro',
      descricao: 'Maré clara com fundo quente',
    },
    {
      valor: 'ESCURO',
      rotulo: 'Escuro',
      descricao: 'Noite e-commerce suave e confortável',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className={`w-full max-w-sm rounded-[28px] p-6 shadow-2xl transition-all ${
          escuro
            ? 'bg-[#131B36] text-[#F2F5FF] border border-[#26414B]'
            : 'bg-[#FFFFFF] text-[#14343C] border border-[#D8E6E8]'
        }`}
      >
        <h3 className="text-xl font-bold font-display mb-4">Tema de exibição</h3>
        <div className="space-y-3">
          {opcoes.map((opcao) => {
            const selecionado = opcao.valor === modoAtual;
            return (
              <button
                key={opcao.valor}
                type="button"
                onClick={() => onEscolher(opcao.valor)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all ${
                  selecionado
                    ? escuro
                      ? 'bg-[#6EE7B7]/15 border border-[#6EE7B7]'
                      : 'bg-[#E0F2EE] border border-[#0B6E5F]'
                    : escuro
                    ? 'hover:bg-[#0A0E1A] border border-transparent'
                    : 'hover:bg-[#F2F5FF] border border-transparent'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selecionado
                      ? escuro
                        ? 'border-[#6EE7B7]'
                        : 'border-[#0B6E5F]'
                      : escuro
                      ? 'border-[#9AA4C7]'
                      : 'border-[#47626E]'
                  }`}
                >
                  {selecionado && (
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        escuro ? 'bg-[#6EE7B7]' : 'bg-[#0B6E5F]'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-bold text-sm ${
                      selecionado
                        ? escuro
                          ? 'text-[#6EE7B7]'
                          : 'text-[#0B6E5F]'
                        : escuro
                        ? 'text-[#F2F5FF]'
                        : 'text-[#14343C]'
                    }`}
                  >
                    {opcao.rotulo}
                  </div>
                  <div
                    className={`text-xs ${
                      escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
                    }`}
                  >
                    {opcao.descricao}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onFechar}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              escuro
                ? 'text-[#9AA4C7] hover:bg-[#0A0E1A]'
                : 'text-[#47626E] hover:bg-[#F2F5FF]'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
