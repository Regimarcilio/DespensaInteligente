import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Github,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  onFechar: () => void;
  escuro: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  onFechar,
  escuro,
}) => {
  const [aba, setAba] = useState<'APK' | 'PWA' | 'GERAR'>('APK');
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleInstalarPWA = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) onFechar();
    }
  };

  const githubReleasesUrl = 'https://github.com/Regimarcilio/DespensaInteligente/releases';
  const githubRepoUrl = 'https://github.com/Regimarcilio/DespensaInteligente';

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
            <div className="w-10 h-10 rounded-2xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
              <Smartphone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display leading-tight">
                Instalar no Android
              </h3>
              <span className="text-[11px] font-bold text-[#0B6E5F] dark:text-[#6EE7B7] uppercase tracking-wider">
                APK GitHub ou Web App Nativo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="flex rounded-xl bg-black/5 dark:bg-white/5 p-1 mb-5">
          <button
            type="button"
            onClick={() => setAba('APK')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              aba === 'APK'
                ? 'bg-[#FF8A00] text-[#14343C] shadow-sm'
                : 'text-inherit opacity-70 hover:opacity-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Baixar APK (GitHub)
          </button>
          <button
            type="button"
            onClick={() => setAba('PWA')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              aba === 'PWA'
                ? 'bg-[#0B6E5F] text-white shadow-sm'
                : 'text-inherit opacity-70 hover:opacity-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            App Web (1 Toque)
          </button>
          <button
            type="button"
            onClick={() => setAba('GERAR')}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              aba === 'GERAR'
                ? 'bg-black/20 dark:bg-white/20 text-inherit shadow-sm'
                : 'text-inherit opacity-70 hover:opacity-100'
            }`}
            title="Como o APK é disponibilizado"
          >
            <Github className="w-3.5 h-3.5" />
            Como Gerar
          </button>
        </div>

        {/* Tab 1: Baixar APK no GitHub */}
        {aba === 'APK' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 mb-1">
                <Package className="w-4 h-4" />
                <span>APK Disponível nas Releases do GitHub</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                O arquivo de instalação <code>Despensa-v0.8-debug.apk</code> é gerado para o Android e fica hospedado na aba oficial de <strong>Releases</strong> do repositório no GitHub.
              </p>
            </div>

            {/* Direct Download Button */}
            <a
              href={githubReleasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl bg-[#FF8A00] text-[#14343C] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF8A00]/25 hover:brightness-105 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Acessar Releases e Baixar APK no GitHub
              <ExternalLink className="w-4 h-4 opacity-75 ml-1" />
            </a>

            {/* Passo a passo da instalação no Android */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                escuro
                  ? 'bg-[#0A0E1A] border-[#26414B] text-[#9AA4C7]'
                  : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#47626E]'
              }`}
            >
              <div className="font-bold text-sm text-[#14343C] dark:text-[#F2F5FF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FFB224]" />
                Como instalar no smartphone Android:
              </div>

              <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed text-[11px]">
                <li>
                  Toque no botão laranja acima para abrir as <strong>Releases no GitHub</strong> no navegador do celular.
                </li>
                <li>
                  Na versão mais recente (ex: <code>v0.8.0</code>), toque em <strong>Assets</strong> e faça o download de <code>Despensa-v0.8-debug.apk</code>.
                </li>
                <li>
                  Ao concluir o download, toque na notificação para <strong>Abrir</strong> o arquivo APK.
                </li>
                <li>
                  Se o Android pedir confirmação, ative <strong>"Permitir desta fonte"</strong> (Chrome/Arquivos) nas configurações e toque em <strong>Instalar</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Instalar PWA Instantâneo */}
        {aba === 'PWA' && (
          <div className="space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5">
                <CheckCircle2 className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0 mt-0.5" />
                <span><strong>Sem baixar arquivos:</strong> Instala como app nativo em 1 toque, sem precisar configurar permissões de APK.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5">
                <CheckCircle2 className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0 mt-0.5" />
                <span><strong>100% Offline-First:</strong> Seus dados e seu estoque ficam salvos na memória do aparelho.</span>
              </div>
            </div>

            {isInstallable && !isInstalled && (
              <button
                type="button"
                onClick={handleInstalarPWA}
                className="w-full py-3.5 rounded-2xl bg-[#0B6E5F] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0B6E5F]/25 hover:brightness-105 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                Instalar no Android com 1 Toque
              </button>
            )}

            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                escuro
                  ? 'bg-[#0A0E1A] border-[#26414B] text-[#9AA4C7]'
                  : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#47626E]'
              }`}
            >
              <div className="font-bold text-[#14343C] dark:text-[#F2F5FF]">
                No Google Chrome do celular:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px] leading-relaxed">
                <li>Toque no menu de <strong>3 pontinhos (⋮)</strong> no canto superior do Chrome.</li>
                <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                <li>O ícone do Despensa aparecerá junto aos seus aplicativos!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: Como o APK é gerado e disponibilizado */}
        {aba === 'GERAR' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2">
              <div className="font-bold flex items-center gap-2 text-[#0B6E5F] dark:text-[#6EE7B7]">
                <Github className="w-4 h-4" />
                <span>Compilação Automática (GitHub Actions)</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                O arquivo de automação <code>.github/workflows/build-apk.yml</code> já está configurado no projeto!
              </p>
              <div className="p-2.5 rounded-xl bg-black/10 dark:bg-black/30 text-[11px] space-y-1 font-mono">
                <div>1. Você faz commit/push no GitHub</div>
                <div>2. GitHub Actions compila com Gradle + Java 17</div>
                <div>3. O APK é gerado e anexado nas Releases</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl border border-black/10 dark:border-white/10 space-y-1.5">
              <div className="font-bold text-[11px]">Compilação Local (Android Studio / Terminal):</div>
              <code className="block p-2 rounded-lg bg-black/10 dark:bg-black/30 font-mono text-[10px] overflow-x-auto">
                cd apps/mobile/Despensa && ./gradlew assembleDebug
              </code>
              <p className="text-[10px] opacity-75">
                Gera o arquivo em <code>apps/mobile/Despensa/app/build/outputs/apk/debug/</code>.
              </p>
            </div>

            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-bold hover:opacity-80 transition-opacity"
            >
              <span>Ver código-fonte no GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          </div>
        )}

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
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
