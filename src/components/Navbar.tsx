import React from 'react';
import { SunMoon, Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck, Smartphone, Github } from 'lucide-react';
import { ModoTema, EstoqueItem, BaixaItem, StatusValidade } from '../types';
import { Logo } from './Logo';
import { statusValidade } from '../domain/validade';
import { formatarReais } from '../domain/listaReposicao';

interface NavbarProps {
  abaAtiva: 'ESTOQUE' | 'LISTA' | 'ECONOMIA';
  itens: EstoqueItem[];
  baixas: BaixaItem[];
  modoTema: ModoTema;
  escuro: boolean;
  onAbrirTema: () => void;
  onAbrirInstallModal?: () => void;
  onAbrirGithubModal?: () => void;
  filtroStatus?: StatusValidade | null;
  onFiltrarStatus?: (status: StatusValidade | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  abaAtiva,
  itens,
  baixas,
  modoTema,
  escuro,
  onAbrirTema,
  onAbrirInstallModal,
  onAbrirGithubModal,
  filtroStatus,
  onFiltrarStatus,
}) => {
  const agora = Date.now();

  // Semáforo metric counts
  const contadores = itens.reduce(
    (acc, it) => {
      const s = statusValidade(it.validade, agora);
      if (s === 'FRESCO') acc.fresco++;
      else if (s === 'ATENCAO') acc.atencao++;
      else if (s === 'VENCIDO') acc.vencido++;
      return acc;
    },
    { fresco: 0, atencao: 0, vencido: 0 }
  );

  // Valor total acumulado no estoque
  const valorTotalEstoque = itens.reduce((sum, it) => {
    const unit = it.precoRef && it.precoRef > 0 ? it.precoRef : 0;
    return sum + it.quantidade * unit;
  }, 0);

  return (
    <header className="sticky top-0 z-40 transition-all select-none">
      {/* Top Glass Navigation Strip */}
      <div
        className={`border-b backdrop-blur-md transition-colors ${
          escuro
            ? 'bg-[#0A0E1A]/95 border-[#26414B]'
            : 'bg-[#FFFBF4]/95 border-[#D8E6E8]'
        }`}
      >
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo with Creative Brand Lockup */}
          <Logo size="md" escuro={escuro} />

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Status Pill indicator in Top Bar */}
            {contadores.vencido > 0 ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FDECEC] text-[#B91C1C] dark:bg-[#FCA5A5]/20 dark:text-[#FCA5A5] border border-red-300 dark:border-red-900/40 animate-pulse"
                title={`${contadores.vencido} itens vencidos no estoque`}
              >
                <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                <span>{contadores.vencido} {contadores.vencido === 1 ? 'vencido' : 'vencidos'}</span>
              </div>
            ) : contadores.atencao > 0 ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#FFF3D6] text-[#8A5A00] dark:bg-[#FFB224]/20 dark:text-[#FFB224] border border-amber-300 dark:border-amber-900/40"
                title={`${contadores.atencao} itens vencem em breve`}
              >
                <ShieldAlert className="w-3 h-3 stroke-[2.5]" />
                <span>{contadores.atencao} vencer</span>
              </div>
            ) : (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E0F2EE] text-[#0B6E5F] dark:bg-[#6EE7B7]/15 dark:text-[#6EE7B7]"
              >
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                <span>Estoque Seguro</span>
              </div>
            )}

            {/* Install on Android Button */}
            {onAbrirInstallModal && (
              <button
                type="button"
                onClick={onAbrirInstallModal}
                aria-label="Baixar APK ou Instalar no Android"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#FF8A00] text-[#14343C] shadow-sm hover:brightness-105 active:scale-95 transition-all"
                title="Baixar APK no GitHub ou instalar no Android"
              >
                <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APK / Instalar</span>
              </button>
            )}

            {/* GitHub Sync Button */}
            {onAbrirGithubModal && (
              <button
                type="button"
                onClick={onAbrirGithubModal}
                aria-label="Sincronizar com GitHub"
                className={`p-2 rounded-xl transition-all ${
                  escuro
                    ? 'text-[#F2F5FF] hover:bg-[#131B36] active:scale-95'
                    : 'text-[#14343C] hover:bg-[#EAF3F3] active:scale-95'
                }`}
                title="Sincronizar com GitHub (Regimarcilio/DespensaInteligente)"
              >
                <Github className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}

            {/* Theme Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={onAbrirTema}
                aria-label="Mudar tema de cor"
                className={`p-2 rounded-xl transition-all ${
                  escuro
                    ? 'text-[#F2F5FF] hover:bg-[#131B36] active:scale-95'
                    : 'text-[#14343C] hover:bg-[#EAF3F3] active:scale-95'
                }`}
              >
                <SunMoon className="w-5 h-5 stroke-[2.2]" />
              </button>
              {modoTema !== 'SISTEMA' && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF8A00] ring-2 ring-white dark:ring-[#0A0E1A]"
                  title={`Tema manual ativo: ${modoTema}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Creative High-Impact Banner Card (Signature Maré & PlacaCerta Header) */}
      <div className="max-w-md mx-auto px-4 pt-2.5 pb-1">
        <div
          className={`relative overflow-hidden rounded-[26px] p-4 text-white shadow-lg transition-all duration-300 ${
            escuro
              ? 'bg-gradient-to-br from-[#131B36] via-[#0E2833] to-[#0A0E1A] border border-[#26414B] shadow-black/40'
              : 'bg-gradient-to-br from-[#0B6E5F] via-[#0D8775] to-[#0E9F8A] border border-[#084E43]/20 shadow-[#0B6E5F]/20'
          }`}
        >
          {/* Subtle Ambient Graphic Waves in Background */}
          <div className="absolute -right-6 -bottom-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none blur-xl" />
          <div className="absolute right-12 -top-10 w-28 h-28 rounded-full bg-[#FF8A00]/15 pointer-events-none blur-lg" />

          {/* Contextual Banner Content per Tab */}
          {abaAtiva === 'ESTOQUE' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6EE7B7] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB224]" />
                  Controle de Frescor
                </span>
                <span className="text-[11px] font-semibold text-white/80">
                  {itens.length} {itens.length === 1 ? 'item guardado' : 'itens guardados'}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1 mb-3">
                <h2 className="text-2xl font-bold font-display tracking-tight leading-tight">
                  Sua despensa, no ponto certo.
                </h2>
                {valorTotalEstoque > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-white/70 block">
                      Em estoque
                    </span>
                    <span className="text-sm font-extrabold font-display text-[#FFB224]">
                      {formatarReais(valorTotalEstoque)}
                    </span>
                  </div>
                )}
              </div>

              {/* Interactive Semáforo Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15">
                {/* Fresco */}
                <button
                  type="button"
                  onClick={() => onFiltrarStatus && onFiltrarStatus(filtroStatus === 'FRESCO' ? null : 'FRESCO')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-left transition-all active:scale-95 ${
                    filtroStatus === 'FRESCO'
                      ? 'bg-white/25 ring-1 ring-white'
                      : 'bg-black/15 hover:bg-black/25'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-[#6EE7B7] shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold leading-tight">
                      {contadores.fresco} Fresco{contadores.fresco === 1 ? '' : 's'}
                    </span>
                    <span className="text-[10px] text-white/75 truncate block">
                      &gt; 3 dias
                    </span>
                  </div>
                </button>

                {/* Atenção */}
                <button
                  type="button"
                  onClick={() => onFiltrarStatus && onFiltrarStatus(filtroStatus === 'ATENCAO' ? null : 'ATENCAO')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-left transition-all active:scale-95 ${
                    filtroStatus === 'ATENCAO'
                      ? 'bg-white/25 ring-1 ring-white'
                      : 'bg-black/15 hover:bg-black/25'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-[#FFB224] shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold leading-tight">
                      {contadores.atencao} Atenção
                    </span>
                    <span className="text-[10px] text-white/75 truncate block">
                      ≤ 3 dias
                    </span>
                  </div>
                </button>

                {/* Vencidos */}
                <button
                  type="button"
                  onClick={() => onFiltrarStatus && onFiltrarStatus(filtroStatus === 'VENCIDO' ? null : 'VENCIDO')}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-left transition-all active:scale-95 ${
                    filtroStatus === 'VENCIDO'
                      ? 'bg-white/25 ring-1 ring-white'
                      : 'bg-black/15 hover:bg-black/25'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-[#FCA5A5] shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold leading-tight">
                      {contadores.vencido} Vencido{contadores.vencido === 1 ? '' : 's'}
                    </span>
                    <span className="text-[10px] text-white/75 truncate block">
                      Urgente
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {abaAtiva === 'LISTA' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6EE7B7] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB224]" />
                  Reposição Automática
                </span>
                <span className="text-[11px] font-semibold text-white/80">
                  Pronto p/ Mercado
                </span>
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight leading-tight mb-1">
                Nunca mais esqueça o que acabou.
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Sugestões geradas sozinhas do seu consumo recente e itens que estão vencendo. Exporte com 1 clique para o <strong>ListaCompras</strong>.
              </p>
            </div>
          )}

          {abaAtiva === 'ECONOMIA' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#6EE7B7] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB224]" />
                  Impacto no Bolso
                </span>
                <span className="text-[11px] font-semibold text-white/80">
                  Mês Atual
                </span>
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight leading-tight mb-1">
                Comida aproveitada é dinheiro economizado.
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Monitore o desperdício evitado em tempo real e mantenha seu histórico sempre protegido com backup local.
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
