import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  Plus,
  Minus,
  Share2,
  Copy,
  ShoppingCart,
  Trash2,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { EstoqueItem, BaixaItem, SugestaoItem } from '../../types';
import {
  gerarSugestoesReposicao,
  gerarTextoCompartilhamento,
  formatarReais,
  formatarQtdReposicao,
} from '../../domain/listaReposicao';

interface ListaViewProps {
  itensEstoque?: EstoqueItem[];
  itens?: EstoqueItem[];
  baixas: BaixaItem[];
  escuro: boolean;
  onNotificar?: (msg: string) => void;
  onAdicionarAoEstoque?: (item: Omit<EstoqueItem, 'id'>) => void;
}

export const ListaView: React.FC<ListaViewProps> = ({
  itensEstoque,
  itens,
  baixas,
  escuro,
  onNotificar,
  onAdicionarAoEstoque,
}) => {
  const listaItens = itensEstoque || itens || [];
  const [sugestoes, setSugestoes] = useState<SugestaoItem[]>([]);
  const [novoItemNome, setNovoItemNome] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Inicializar sugestões com base no estoque e histórico
  useEffect(() => {
    const calculadas = gerarSugestoesReposicao(listaItens, baixas);
    setSugestoes(calculadas);
  }, [listaItens, baixas]);

  const toggleItem = (id: string) => {
    setSugestoes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selecionado: !s.selecionado } : s))
    );
  };

  const mudarQuantidade = (id: string, delta: number) => {
    setSugestoes((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nova = Math.max(1, s.quantidadeSugerida + delta);
          return { ...s, quantidadeSugerida: nova };
        }
        return s;
      })
    );
  };

  const removerItem = (id: string) => {
    setSugestoes((prev) => prev.filter((s) => s.id !== id));
  };

  const adicionarManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItemNome.trim()) return;

    const novo: SugestaoItem = {
      id: `manual-${Date.now()}`,
      nome: novoItemNome.trim(),
      quantidadeSugerida: 1,
      unidade: 'un',
      origem: 'MANUAL',
      selecionado: true,
    };

    setSugestoes((prev) => [novo, ...prev]);
    setNovoItemNome('');
    if (onNotificar) {
      onNotificar(`"${novo.nome}" adicionado à lista.`);
    }
  };

  const itensParaComprar = useMemo(
    () => sugestoes.filter((s) => s.selecionado),
    [sugestoes]
  );

  const valorEstimadoTotal = useMemo(() => {
    return itensParaComprar.reduce((sum, it) => {
      if (it.precoUnit && it.precoUnit > 0) {
        return sum + it.quantidadeSugerida * it.precoUnit;
      }
      return sum;
    }, 0);
  }, [itensParaComprar]);

  const copiarTexto = async () => {
    const texto = gerarTextoCompartilhamento(
      itensParaComprar.map((s) => ({
        nome: s.nome,
        quantidade: s.quantidadeSugerida,
        unidade: s.unidade,
      }))
    );

    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      if (onNotificar) {
        onNotificar('Lista copiada para a área de transferência! 📋');
      }
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      if (onNotificar) onNotificar('Lista gerada!');
    }
  };

  const compartilharWhatsApp = () => {
    const texto = gerarTextoCompartilhamento(
      itensParaComprar.map((s) => ({
        nome: s.nome,
        quantidade: s.quantidadeSugerida,
        unidade: s.unidade,
      }))
    );
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto">
      {/* Top Banner / Actions Card */}
      <div
        className={`p-4 rounded-3xl border mb-3.5 shadow-xs ${
          escuro
            ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF]'
            : 'bg-white border-[#D8E6E8] text-[#14343C]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B6E5F] dark:text-[#6EE7B7]">
              Reposição Inteligente
            </span>
            <h3 className="font-display font-bold text-lg">
              {itensParaComprar.length}{' '}
              {itensParaComprar.length === 1 ? 'item marcado' : 'itens marcados'}
            </h3>
          </div>

          {valorEstimadoTotal > 0 && (
            <div className="text-right">
              <span className="text-[10px] opacity-70">Estimativa</span>
              <div className="font-bold text-base text-[#0B6E5F] dark:text-[#6EE7B7]">
                {formatarReais(valorEstimadoTotal)}
              </div>
            </div>
          )}
        </div>

        {/* Share & Copy Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={compartilharWhatsApp}
            disabled={itensParaComprar.length === 0}
            className="py-2.5 px-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={copiarTexto}
            disabled={itensParaComprar.length === 0}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-95 disabled:opacity-50 ${
              copiado
                ? 'bg-emerald-600 text-white border-emerald-600'
                : escuro
                ? 'bg-[#1A2342] border-[#26414B] text-white hover:bg-white/10'
                : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#14343C] hover:bg-black/5'
            }`}
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Lista</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input de Adicionar Manual */}
      <form onSubmit={adicionarManual} className="flex items-center gap-2 mb-3.5">
        <input
          type="text"
          placeholder="Adicionar outro item à lista..."
          value={novoItemNome}
          onChange={(e) => setNovoItemNome(e.target.value)}
          className={`flex-1 px-3.5 py-2.5 rounded-2xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
            escuro
              ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF] placeholder-gray-500'
              : 'bg-white border-[#D8E6E8] text-[#14343C] placeholder-gray-400'
          }`}
        />
        <button
          type="submit"
          disabled={!novoItemNome.trim()}
          className="p-2.5 rounded-2xl bg-[#0B6E5F] text-white hover:bg-[#0E8A77] disabled:opacity-40 transition-all shadow-xs"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>

      {/* Lista de Itens */}
      {sugestoes.length === 0 ? (
        <div
          className={`text-center py-12 px-6 rounded-3xl border ${
            escuro
              ? 'bg-[#131B36]/50 border-[#26414B] text-[#9CB3B8]'
              : 'bg-white border-[#D8E6E8] text-[#506368]'
          }`}
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#0B6E5F]" />
          <h4 className="font-display font-bold text-base mb-1">
            Nenhum item pendente de reposição
          </h4>
          <p className="text-xs max-w-xs mx-auto">
            Quando você consumir ou itens estiverem acabando na despensa, sugestões automáticas aparecerão aqui!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sugestoes.map((sug) => {
            return (
              <div
                key={sug.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  sug.selecionado
                    ? escuro
                      ? 'bg-[#131B36] border-[#30B09E]/40 text-[#F2F5FF]'
                      : 'bg-white border-[#0B6E5F]/30 text-[#14343C]'
                    : escuro
                    ? 'bg-[#131B36]/40 border-transparent text-[#9CB3B8] opacity-60'
                    : 'bg-gray-100/60 border-transparent text-gray-500 opacity-60'
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleItem(sug.id)}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                    sug.selecionado
                      ? 'bg-[#0B6E5F] border-[#0B6E5F] text-white'
                      : escuro
                      ? 'border-gray-600 bg-black/20'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {sug.selecionado && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-semibold truncate ${
                        !sug.selecionado ? 'line-through' : ''
                      }`}
                    >
                      {sug.nome}
                    </span>
                    {sug.origem === 'CONSUMO' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        Consumido
                      </span>
                    )}
                    {sug.origem === 'VALIDADE' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Acabando
                      </span>
                    )}
                  </div>

                  {sug.precoUnit && (
                    <span className="text-[11px] opacity-75">
                      ~ {formatarReais(sug.precoUnit * sug.quantidadeSugerida)}
                    </span>
                  )}
                </div>

                {/* Stepper Quantidade */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => mudarQuantidade(sug.id, -1)}
                    className="w-7 h-7 rounded-lg border border-gray-400/40 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-7 text-center font-bold text-xs">
                    {formatarQtdReposicao(sug.quantidadeSugerida)}
                  </span>

                  <button
                    type="button"
                    onClick={() => mudarQuantidade(sug.id, 1)}
                    className="w-7 h-7 rounded-lg border border-gray-400/40 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Excluir da lista */}
                <button
                  type="button"
                  onClick={() => removerItem(sug.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
