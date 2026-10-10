import React, { useState, useEffect } from 'react';
import { Check, Plus, Minus, Share2, Copy, ShoppingBag, CheckCheck } from 'lucide-react';
import { EstoqueItem, BaixaItem, SugestaoItem } from '../../types';
import { diasParaVencer } from '../../domain/validade';
import { gerarTexto, formatarReais, formatarQtdReposicao } from '../../domain/listaReposicao';

interface ListaViewProps {
  itensEstoque: EstoqueItem[];
  baixas: BaixaItem[];
  escuro: boolean;
  onNotificar: (msg: string) => void;
}

export const ListaView: React.FC<ListaViewProps> = ({
  itensEstoque,
  baixas,
  escuro,
  onNotificar,
}) => {
  const [sugestoes, setSugestoes] = useState<SugestaoItem[]>([]);
  const [textoGerado, setTextoGerado] = useState<string>('');
  const [copiado, setCopiado] = useState(false);

  // Passo de incremento/decremento baseado na unidade
  const passoUnidade = (un: string): number => {
    switch (un.toLowerCase()) {
      case 'kg':
      case 'l':
        return 0.5;
      case 'g':
      case 'ml':
        return 100;
      default:
        return 1;
    }
  };

  // Recarregar sugestões (consumidos nos últimos 30 dias + vencendo em até 7 dias)
  useEffect(() => {
    const agora = Date.now();
    const ha30d = agora - 30 * 24 * 60 * 60 * 1000;

    // Consumidos recentes
    const recentes = baixas.filter(
      (b) => b.motivo === 'CONSUMIDO' && b.ts >= ha30d && b.nome.trim().length > 0
    );

    // Mapear por nome único (mais recente)
    const porConsumoMap = new Map<string, SugestaoItem>();
    recentes.forEach((b) => {
      const chave = b.nome.trim().toLowerCase();
      if (!porConsumoMap.has(chave)) {
        const precoUnit = b.quantidade > 0 ? b.valorTotal / b.quantidade : null;
        porConsumoMap.set(chave, {
          nome: b.nome,
          quantidade: b.quantidade,
          unidade: b.unidade || 'un',
          precoUnit: precoUnit && precoUnit > 0 ? precoUnit : null,
          origem: 'CONSUMO',
          marcada: false,
        });
      }
    });

    // Vencendo em 0..7 dias do estoque que ainda não estão nos consumidos
    const vencendo: SugestaoItem[] = [];
    itensEstoque.forEach((it) => {
      const dias = diasParaVencer(it.validade, agora);
      const chave = it.nome.trim().toLowerCase();
      if (dias != null && dias >= 0 && dias <= 7 && !porConsumoMap.has(chave)) {
        vencendo.push({
          nome: it.nome,
          quantidade: it.quantidade,
          unidade: it.unidade || 'un',
          precoUnit: it.precoRef,
          origem: 'VALIDADE',
          marcada: false,
        });
      }
    });

    const listaFinal = [...Array.from(porConsumoMap.values()), ...vencendo];

    // Preserva marcação e quantidade anteriores se já estavam na tela
    setSugestoes((anteriores) => {
      const antMap = new Map(anteriores.map((s) => [s.nome.trim().toLowerCase(), s]));
      return listaFinal.map((nova) => {
        const ant = antMap.get(nova.nome.trim().toLowerCase());
        if (ant) {
          return {
            ...nova,
            quantidade: ant.quantidade,
            marcada: ant.marcada,
          };
        }
        return nova;
      });
    });
  }, [itensEstoque, baixas]);

  const alternarMarcacao = (nome: string) => {
    setSugestoes((prev) =>
      prev.map((s) => (s.nome === nome ? { ...s, marcada: !s.marcada } : s))
    );
  };

  const ajustarQuantidade = (nome: string, delta: number) => {
    setSugestoes((prev) =>
      prev.map((s) => {
        if (s.nome === nome) {
          const novaQtd = Math.max(s.quantidade + delta, 0.5);
          return { ...s, quantidade: Number(novaQtd.toFixed(2)) };
        }
        return s;
      })
    );
  };

  const selecionadas = sugestoes.filter((s) => s.marcada);

  const handleGerarTexto = () => {
    if (selecionadas.length === 0) return;
    const txt = gerarTexto(
      'Reposição Despensa',
      selecionadas.map((s) => ({
        nome: s.nome,
        quantidade: s.quantidade,
        unidade: s.unidade,
        precoUnit: s.precoUnit,
      }))
    );
    setTextoGerado(txt);
  };

  const handleCopiar = async () => {
    if (!textoGerado) return;
    try {
      await navigator.clipboard.writeText(textoGerado);
      setCopiado(true);
      onNotificar('Texto copiado para a área de transferência! ✅');
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      onNotificar('Falha ao copiar automaticamente');
    }
  };

  const handleCompartilhar = async () => {
    if (!textoGerado) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reposição Despensa',
          text: textoGerado,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopiar();
        }
      }
    } else {
      handleCopiar();
    }
  };

  return (
    <div className="pb-28">
      {/* Introduction banner */}
      <div className="mb-4">
        <h3
          className={`text-lg font-bold font-display ${
            escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
          }`}
        >
          Sugestões inteligentes
        </h3>
        <p
          className={`text-xs ${
            escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
          }`}
        >
          Itens consumidos nos últimos 30 dias ou que vencem em até 7 dias
        </p>
      </div>

      {/* Suggestions List */}
      {sugestoes.length === 0 ? (
        <div
          className={`p-8 text-center rounded-[24px] border ${
            escuro
              ? 'bg-[#131B36] border-[#26414B] text-[#9AA4C7]'
              : 'bg-white border-[#D8E6E8] text-[#47626E] shadow-sm'
          }`}
        >
          <div className="text-4xl mb-3">🧺</div>
          <h4 className="font-bold text-base mb-1 font-display text-[#14343C] dark:text-[#F2F5FF]">
            Sem sugestões no momento
          </h4>
          <p className="text-xs">
            Consuma itens do estoque ou cadastre novos prazos de validade para alimentar as sugestões de compra.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-5">
          {sugestoes.map((s) => {
            const passo = passoUnidade(s.unidade);
            return (
              <div
                key={s.nome}
                className={`rounded-[24px] p-3.5 border transition-all shadow-sm ${
                  s.marcada
                    ? escuro
                      ? 'bg-[#131B36] border-[#6EE7B7] ring-1 ring-[#6EE7B7]'
                      : 'bg-[#E0F2EE] border-[#0B6E5F] ring-1 ring-[#0B6E5F]'
                    : escuro
                    ? 'bg-[#131B36] border-[#26414B]'
                    : 'bg-[#FFFFFF] border-[#D8E6E8]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Custom Checkbox */}
                  <button
                    type="button"
                    onClick={() => alternarMarcacao(s.nome)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      s.marcada
                        ? escuro
                          ? 'bg-[#6EE7B7] border-[#6EE7B7] text-[#0A0E1A]'
                          : 'bg-[#0B6E5F] border-[#0B6E5F] text-white'
                        : escuro
                        ? 'border-[#9AA4C7] bg-[#0A0E1A]'
                        : 'border-[#47626E] bg-white'
                    }`}
                  >
                    {s.marcada && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Name and Origin badge */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => alternarMarcacao(s.nome)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm truncate ${
                          escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
                        }`}
                      >
                        {s.nome}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          s.origem === 'CONSUMO'
                            ? escuro
                              ? 'bg-[#38E1FF]/20 text-[#38E1FF]'
                              : 'bg-[#EAF3F3] text-[#0B6E5F]'
                            : escuro
                            ? 'bg-[#FFB224]/20 text-[#FFB224]'
                            : 'bg-[#FFF3D6] text-[#8A5A00]'
                        }`}
                      >
                        {s.origem === 'CONSUMO' ? 'Consumo' : 'Vencendo'}
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-0.5 ${
                        escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
                      }`}
                    >
                      {s.precoUnit && s.precoUnit > 0
                        ? `Preço ref: R$ ${formatarReais(s.precoUnit)}`
                        : 'Sem preço de ref.'}
                    </p>
                  </div>

                  {/* Stepper (- / +) */}
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-2xl p-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => ajustarQuantidade(s.nome, -passo)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span
                      className={`font-bold text-xs min-w-[40px] text-center ${
                        escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
                      }`}
                    >
                      {formatarQtdReposicao(s.quantidade)} {s.unidade}
                    </span>

                    <button
                      type="button"
                      onClick={() => ajustarQuantidade(s.nome, passo)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA Button: Gerar texto */}
      <div className="space-y-2">
        <button
          type="button"
          disabled={selecionadas.length === 0}
          onClick={handleGerarTexto}
          className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
            selecionadas.length > 0
              ? 'bg-[#FF8A00] text-[#14343C] shadow-[#FF8A00]/25 hover:brightness-105 active:scale-98 cursor-pointer'
              : 'bg-[#FF8A00]/30 text-[#14343C]/60 cursor-not-allowed shadow-none'
          }`}
        >
          <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
          {selecionadas.length > 0
            ? `Gerar texto de reposição (${selecionadas.length})`
            : 'Gerar texto'}
        </button>

        {selecionadas.length === 0 && (
          <p
            className={`text-center text-xs font-semibold ${
              escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
            }`}
          >
            Selecione ao menos um item acima ↑
          </p>
        )}
      </div>

      {/* Generated Text Result Card */}
      {textoGerado && (
        <div
          className={`mt-6 rounded-[24px] p-5 border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 ${
            escuro
              ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF]'
              : 'bg-white border-[#D8E6E8] text-[#14343C]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm font-display uppercase tracking-wider text-[#0B6E5F] dark:text-[#6EE7B7]">
              Texto Pronto p/ ListaCompras v2.0
            </h4>
            <span className="text-xs text-[#47626E] dark:text-[#9AA4C7]">
              {selecionadas.length} itens
            </span>
          </div>

          <pre
            className={`p-3.5 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed border ${
              escuro
                ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF]'
                : 'bg-[#F2F5FF] border-[#D8E6E8] text-[#14343C]'
            }`}
          >
            {textoGerado}
          </pre>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCompartilhar}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                escuro
                  ? 'border-[#26414B] hover:bg-[#0A0E1A] text-[#F2F5FF]'
                  : 'border-[#D8E6E8] hover:bg-[#F2F5FF] text-[#14343C]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>

            <button
              type="button"
              onClick={handleCopiar}
              className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 ${
                copiado
                  ? 'bg-[#0B6E5F] border-[#0B6E5F] text-white'
                  : escuro
                  ? 'border-[#6EE7B7] text-[#6EE7B7] hover:bg-[#6EE7B7]/10'
                  : 'border-[#0B6E5F] text-[#0B6E5F] hover:bg-[#0B6E5F]/10'
              }`}
            >
              {copiado ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <p
            className={`text-[11px] text-center mt-3 ${
              escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
            }`}
          >
            Abra o app ListaCompras e cole diretamente no recurso "Importar".
          </p>
        </div>
      )}
    </div>
  );
};
