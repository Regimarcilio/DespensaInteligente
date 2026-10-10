import React from 'react';
import { Smartphone, Download, CheckCircle2, X, ExternalLink, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  onFechar: () => void;
  escuro: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  onFechar,
  escuro,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstalar = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) onFechar();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div
        className={`w-full max-w-sm rounded-[28px] p-6 shadow-2xl transition-all border ${
          escuro
            ? 'bg-[#131B36] text-[#F2F5FF] border-[#26414B]'
            : 'bg-[#FFFFFF] text-[#14343C] border-[#D8E6E8]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B6E5F]/15 text-[#0B6E5F] dark:bg-[#6EE7B7]/20 dark:text-[#6EE7B7] flex items-center justify-center">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display leading-tight">
                Instalar no Android
              </h3>
              <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider">
                Como App Nativo (PWA)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-2 mb-5 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <CheckCircle2 className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0 mt-0.5" />
            <span><strong>Ícone na Tela Inicial:</strong> Abre direto como aplicativo nativo, sem barra de navegação do navegador.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <CheckCircle2 className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0 mt-0.5" />
            <span><strong>100% Offline-First:</strong> Seus dados ficam salvos no seu aparelho celular com resposta instantânea.</span>
          </div>
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <CheckCircle2 className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0 mt-0.5" />
            <span><strong>Sem conta e sem anúncios:</strong> Leve, rápido e seguro.</span>
          </div>
        </div>

        {/* Action 1: Direct Install if browser supports beforeinstallprompt */}
        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={handleInstalar}
            className="w-full py-3.5 mb-4 rounded-2xl bg-[#FF8A00] text-[#14343C] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF8A00]/25 hover:brightness-105 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            Instalar Agora com 1 Toque
          </button>
        )}

        {/* Step-by-step instructions for Android Chrome */}
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
            escuro
              ? 'bg-[#0A0E1A] border-[#26414B] text-[#9AA4C7]'
              : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#47626E]'
          }`}
        >
          <div className="font-bold text-sm text-[#14343C] dark:text-[#F2F5FF] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFB224]" />
            Passo a passo no Google Chrome:
          </div>

          <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
            <li>Abra o link do app no <strong>Google Chrome</strong> do seu smartphone Android.</li>
            <li>Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior direito do Chrome.</li>
            <li>Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
            <li>Pronto! O ícone do <strong>Despensa</strong> aparecerá nos seus aplicativos.</li>
          </ol>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onFechar}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              escuro
                ? 'bg-[#0A0E1A] text-[#F2F5FF] hover:bg-[#26414B]'
                : 'bg-[#EAF3F3] text-[#14343C] hover:bg-[#D8E6E8]'
            }`}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
