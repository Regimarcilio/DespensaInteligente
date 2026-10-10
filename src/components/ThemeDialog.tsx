import React from 'react';
import { Sun, Moon, Monitor, X, Check } from 'lucide-react';
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
  const opcoes: Array<{
    modo: ModoTema;
    titulo: string;
    descricao: string;
    icone: typeof Sun;
  }> = [
    {
      modo: 'SISTEMA',
      titulo: 'Seguir o Sistema',
      descricao: 'Adapta automaticamente ao tema do seu dispositivo Android.',
      icone: Monitor,
    },
    {
      modo: 'CLARO',
      titulo: 'Modo Claro',
      descricao: 'Cores quentes e acolhedoras com fundo areia suave.',
      icone: Sun,
    },
    {
      modo: 'ESCURO',
      titulo: 'Modo Noturno',
      descricao: 'Fundo escuro profundo para economizar bateria OLED.',
      icone: Moon,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className={`w-full max-w-sm rounded-[28px] p-6 shadow-2xl transition-all border ${
          escuro
            ? 'bg-[#131B36] text-[#F2F5FF] border-[#26414B]'
            : 'bg-[#FFFFFF] text-[#14343C] border-[#D8E6E8]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-display">Aparência do App</h3>
          <button
            type="button"
            onClick={onFechar}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {opcoes.map((opcao) => {
            const selecionado = modoAtual === opcao.modo;
            const Icon = opcao.icone;

            return (
              <button
                key={opcao.modo}
                type="button"
                onClick={() => {
                  onEscolher(opcao.modo);
                  onFechar();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                  selecionado
                    ? escuro
                      ? 'border-[#30B09E] bg-[#30B09E]/15 text-[#6EE7B7]'
                      : 'border-[#0B6E5F] bg-[#E0F2EE] text-[#0B6E5F]'
                    : escuro
                    ? 'border-[#26414B] bg-[#1A2342] text-[#F2F5FF] hover:border-[#30B09E]/50'
                    : 'border-[#D8E6E8] bg-[#F7FAFA] text-[#14343C] hover:border-[#0B6E5F]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      selecionado
                        ? escuro
                          ? 'bg-[#30B09E]/20 text-[#6EE7B7]'
                          : 'bg-[#0B6E5F]/15 text-[#0B6E5F]'
                        : escuro
                        ? 'bg-white/5 text-[#9CB3B8]'
                        : 'bg-black/5 text-[#506368]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{opcao.titulo}</div>
                    <div
                      className={`text-xs ${
                        escuro ? 'text-[#9CB3B8]' : 'text-[#506368]'
                      }`}
                    >
                      {opcao.descricao}
                    </div>
                  </div>
                </div>

                {selecionado && (
                  <Check
                    className={`w-5 h-5 shrink-0 ${
                      escuro ? 'text-[#6EE7B7]' : 'text-[#0B6E5F]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
