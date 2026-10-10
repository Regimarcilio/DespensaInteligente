import React, { useState } from 'react';
import {
  Github,
  X,
  ExternalLink,
  Copy,
  Check,
  GitBranch,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface GitHubSyncModalProps {
  onFechar: () => void;
  escuro: boolean;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  onFechar,
  escuro,
}) => {
  const [copiado, setCopiado] = useState<string | null>(null);

  const copiarComando = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiado(key);
    setTimeout(() => setCopiado(null), 2500);
  };

  const repoUrl = 'https://github.com/Regimarcilio/DespensaInteligente';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none overflow-y-auto">
      <div
        className={`w-full max-w-md rounded-[28px] p-6 shadow-2xl transition-all border my-auto ${
          escuro
            ? 'bg-[#131B36] text-[#F2F5FF] border-[#26414B]'
            : 'bg-[#FFFFFF] text-[#14343C] border-[#D8E6E8]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black/10 dark:bg-white/10 flex items-center justify-center">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display leading-tight">
                Sincronizar com GitHub
              </h3>
              <span className="text-[11px] font-bold text-[#0B6E5F] dark:text-[#6EE7B7]">
                Regimarcilio / DespensaInteligente
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs opacity-80 mb-4 leading-relaxed">
          Este app foi importado do repositório original do GitHub. Aqui você encontra as instruções
          para sincronizar com seu repositório remoto ou baixar os arquivos para compilar nativamente
          no Android Studio.
        </p>

        {/* Link direto repositório e releases */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-1.5 truncate">
              <GitBranch className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0" />
              <span className="truncate">Repositório</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
          </a>

          <a
            href={`${repoUrl}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/30 text-xs font-bold text-[#FF8A00] hover:brightness-110 transition-all"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="truncate">Releases (APK)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
          </a>
        </div>

        {/* Passos para sincronizar via Git */}
        <div className="space-y-3 mb-5 text-xs">
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>1. Clonar ou atualizar no seu computador</span>
              <button
                type="button"
                onClick={() =>
                  copiarComando('git pull origin main', 'cmd1')
                }
                className="text-[11px] text-[#0B6E5F] dark:text-[#6EE7B7] flex items-center gap-1"
              >
                {copiado === 'cmd1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiado === 'cmd1' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <code className="block p-2 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[11px] overflow-x-auto">
              git pull origin main
            </code>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="font-bold mb-1 flex items-center justify-between">
              <span>2. Subir commits para o GitHub</span>
              <button
                type="button"
                onClick={() =>
                  copiarComando('git add . && git commit -m "feat: melhorias despensa" && git push', 'cmd2')
                }
                className="text-[11px] text-[#0B6E5F] dark:text-[#6EE7B7] flex items-center gap-1"
              >
                {copiado === 'cmd2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiado === 'cmd2' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <code className="block p-2 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[11px] overflow-x-auto">
              git add . && git commit -m "feat: melhorias" && git push
            </code>
          </div>

          <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#0B6E5F] dark:text-[#6EE7B7]">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Usar no Smartphone Android</span>
            </div>
            <p className="text-[11px] opacity-90 leading-tight">
              Você pode usar este app diretamente no Android clicando em <b>Instalar</b> no cabeçalho
              (PWA com suporte offline), ou compilar o módulo nativo em <code>apps/mobile/Despensa</code>
              usando o Android Studio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#0B6E5F] text-white hover:bg-[#0E8A77] transition-all shadow-sm"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
