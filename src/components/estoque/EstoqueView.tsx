import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  UtensilsCrossed,
  X,
  PackageOpen,
  Calendar,
} from 'lucide-react';
import { EstoqueItem, LocalEstoque, MotivoBaixa, StatusValidade } from '../../types';
import { statusValidade, diasParaVencer, formatarDiasRestantes, formatarDataBr } from '../../domain/validade';
import { formatarReais } from '../../domain/listaReposicao';
import { DialogoCadastro } from './DialogoCadastro';

interface EstoqueViewProps {
  itens: EstoqueItem[];
  escuro: boolean;
  filtroStatus?: StatusValidade | null;
  onLimparFiltroStatus?: () => void;
  onSalvarItem: (dados: {
    nome: string;
    quantidade: number;
    unidade: string;
    validade: number | null;
    local: LocalEstoque;
    precoRef: number | null;
    fotoPath: string | null;
  }) => void;
  onRemoverItem: (id: string) => void;
  onDarBaixa: (item: EstoqueItem, motivo: MotivoBaixa, quantidade?: number) => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  itens,
  escuro,
  filtroStatus,
  onLimparFiltroStatus,
  onSalvarItem,
  onRemoverItem,
  onDarBaixa,
}) => {
  const [busca, setBusca] = useState('');
  const [localFiltro, setLocalFiltro] = useState<LocalEstoque | 'TODOS'>('TODOS');
  const [dialogoCadastroAberto, setDialogoCadastroAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<EstoqueItem | null>(null);

  // Modal de confirmação de baixa
  const [itemSelecionadoBaixa, setItemSelecionadoBaixa] = useState<EstoqueItem | null>(null);
  const [qtdBaixa, setQtdBaixa] = useState<number>(1);
  const [motivoBaixa, setMotivoBaixa] = useState<MotivoBaixa>('CONSUMIDO');

  const agora = Date.now();

  // Filtragem e ordenação inteligente
  const itensFiltrados = useMemo(() => {
    return itens
      .filter((it) => {
        if (busca.trim()) {
          const query = busca.toLowerCase();
          const matchesName = it.nome.toLowerCase().includes(query);
          const matchesCategory = it.categoria?.toLowerCase().includes(query);
          if (!matchesName && !matchesCategory) return false;
        }

        if (localFiltro !== 'TODOS' && it.local !== localFiltro) {
          return false;
        }

        if (filtroStatus) {
          const status = statusValidade(it.validade, agora);
          if (status !== filtroStatus) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const diasA = diasParaVencer(a.validade, agora);
        const diasB = diasParaVencer(b.validade, agora);

        if (diasA === null && diasB === null) return a.nome.localeCompare(b.nome);
        if (diasA === null) return 1;
        if (diasB === null) return -1;
        return diasA - diasB;
      });
  }, [itens, busca, localFiltro, filtroStatus, agora]);

  const abrirModalBaixa = (item: EstoqueItem, motivo: MotivoBaixa) => {
    setItemSelecionadoBaixa(item);
    setMotivoBaixa(motivo);
    setQtdBaixa(Math.min(1, item.quantidade));
  };

  const confirmarBaixa = () => {
    if (!itemSelecionadoBaixa) return;
    onDarBaixa(itemSelecionadoBaixa, motivoBaixa, qtdBaixa);
    setItemSelecionadoBaixa(null);
  };

  const emojiLocal = (loc: LocalEstoque) => {
    switch (loc) {
      case 'GELADEIRA':
        return '🥛 Geladeira';
      case 'FREEZER':
        return '❄️ Freezer';
      case 'DESPENSA':
        return '🥫 Despensa';
    }
  };

  const handleSalvarCadastro = (novo: Omit<EstoqueItem, 'id'>) => {
    if (itemEmEdicao) {
      onRemoverItem(itemEmEdicao.id);
    }
    onSalvarItem({
      nome: novo.nome,
      quantidade: novo.quantidade,
      unidade: novo.unidade,
      validade: novo.validade,
      local: novo.local,
      precoRef: novo.precoRef || null,
      fotoPath: novo.fotoUri || null,
    });
    setItemEmEdicao(null);
    setDialogoCadastroAberto(false);
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto">
      {/* Search Bar */}
      <div className="relative mb-2.5">
        <Search
          className={`absolute left-3.5 top-3 w-4 h-4 ${
            escuro ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
        <input
          type="text"
          placeholder="Buscar no estoque..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`w-full pl-10 pr-9 py-2.5 rounded-2xl border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
            escuro
              ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF] placeholder-gray-500'
              : 'bg-[#FFFFFF] border-[#D8E6E8] text-[#14343C] placeholder-gray-400'
          }`}
        />
        {busca && (
          <button
            type="button"
            onClick={() => setBusca('')}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-2.5">
        {(
          [
            { id: 'TODOS', label: 'Todos' },
            { id: 'GELADEIRA', label: 'Geladeira 🥛' },
            { id: 'FREEZER', label: 'Freezer ❄️' },
            { id: 'DESPENSA', label: 'Despensa 🥫' },
          ] as const
        ).map((f) => {
          const ativo = localFiltro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setLocalFiltro(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                ativo
                  ? escuro
                    ? 'bg-[#30B09E]/25 border-[#30B09E] text-[#6EE7B7]'
                    : 'bg-[#0B6E5F] border-[#0B6E5F] text-white shadow-xs'
                  : escuro
                  ? 'bg-[#131B36] border-[#26414B] text-[#9CB3B8] hover:border-[#30B09E]/40'
                  : 'bg-white border-[#D8E6E8] text-[#506368] hover:border-[#0B6E5F]/40'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* External Filter notification banner if active */}
      {filtroStatus && onLimparFiltroStatus && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-[#FF8A00]/10 border border-[#FF8A00]/20 flex items-center justify-between text-xs text-[#FF8A00] font-semibold">
          <span>Filtrando por status: {filtroStatus}</span>
          <button
            type="button"
            onClick={onLimparFiltroStatus}
            className="flex items-center gap-1 underline text-[11px]"
          >
            <X className="w-3.5 h-3.5" /> Limpar filtro
          </button>
        </div>
      )}

      {/* Items List */}
      {itensFiltrados.length === 0 ? (
        <div
          className={`text-center py-12 px-6 rounded-3xl border ${
            escuro
              ? 'bg-[#131B36]/50 border-[#26414B] text-[#9CB3B8]'
              : 'bg-white border-[#D8E6E8] text-[#506368]'
          }`}
        >
          <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#0B6E5F]" />
          <h3 className="font-display font-bold text-base mb-1">Nenhum item encontrado</h3>
          <p className="text-xs mb-4 max-w-xs mx-auto">
            {busca || localFiltro !== 'TODOS'
              ? 'Tente ajustar os filtros de busca ou localização.'
              : 'Sua despensa está vazia. Adicione seu primeiro alimento para começar a controlar validades!'}
          </p>
          <button
            type="button"
            onClick={() => {
              setItemEmEdicao(null);
              setDialogoCadastroAberto(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0B6E5F] text-white hover:bg-[#0E8A77] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Alimento</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {itensFiltrados.map((item) => {
            const status = statusValidade(item.validade, agora);
            const dias = diasParaVencer(item.validade, agora);
            const textoDias = formatarDiasRestantes(dias);

            const configStatus = {
              VENCIDO: {
                border: escuro ? 'border-red-900/40' : 'border-red-300',
                badgeBg: 'bg-red-500/15 text-red-500 dark:text-red-400',
                ring: 'ring-red-500',
                icon: AlertTriangle,
              },
              ATENCAO: {
                border: escuro ? 'border-amber-900/40' : 'border-amber-300',
                badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
                ring: 'ring-amber-500',
                icon: Clock,
              },
              FRESCO: {
                border: escuro ? 'border-[#26414B]' : 'border-[#D8E6E8]',
                badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
                ring: 'ring-emerald-500',
                icon: CheckCircle2,
              },
              SEM_VALIDADE: {
                border: escuro ? 'border-[#26414B]' : 'border-[#D8E6E8]',
                badgeBg: 'bg-gray-500/15 text-gray-500',
                ring: 'ring-gray-400',
                icon: PackageOpen,
              },
            }[status];

            const StatusIcon = configStatus.icon;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
                  configStatus.border
                } ${
                  escuro
                    ? 'bg-[#131B36] text-[#F2F5FF]'
                    : 'bg-[#FFFFFF] text-[#14343C]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Thumbnail / Freshness Ring */}
                  <div className="relative shrink-0">
                    {item.fotoUri ? (
                      <img
                        src={item.fotoUri}
                        alt={item.nome}
                        className={`w-12 h-12 rounded-2xl object-cover ring-2 ${configStatus.ring}`}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-2xl ring-2 ${configStatus.ring} flex items-center justify-center text-xl font-bold ${
                          escuro ? 'bg-[#1A2342]' : 'bg-[#EAF3F3]'
                        }`}
                      >
                        {item.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Detalhes do Item */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-bold text-sm truncate font-display">
                        {item.nome}
                      </h4>
                      <span className="text-xs font-black text-[#0B6E5F] dark:text-[#6EE7B7] shrink-0">
                        {item.quantidade} {item.unidade}
                      </span>
                    </div>

                    {/* Tags: Local + Preço */}
                    <div className="flex items-center gap-2 text-[11px] mb-2 opacity-80">
                      <span>{emojiLocal(item.local)}</span>
                      {item.precoRef && item.precoRef > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatarReais(item.precoRef)}/{item.unidade}</span>
                        </>
                      )}
                    </div>

                    {/* Freshness Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${configStatus.badgeBg}`}
                      >
                        <StatusIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate">{textoDias}</span>
                      </div>

                      {item.validade && (
                        <span className="text-[10px] opacity-60">
                          {formatarDataBr(item.validade)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações Rápidas do Item */}
                <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => abrirModalBaixa(item, 'CONSUMIDO')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0B6E5F]/15 text-[#0B6E5F] dark:bg-[#6EE7B7]/20 dark:text-[#6EE7B7] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
                      title="Registrar consumo (salva dinheiro!)"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Consumir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirModalBaixa(item, 'DESCARTADO')}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                      title="Registrar descarte/vencimento"
                    >
                      Descartar
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setItemEmEdicao(item);
                        setDialogoCadastroAberto(true);
                      }}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoverItem(item.id)}
                      className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => {
          setItemEmEdicao(null);
          setDialogoCadastroAberto(true);
        }}
        className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:translate-x-36 z-30 w-14 h-14 rounded-2xl bg-[#0B6E5F] text-white shadow-xl hover:bg-[#0E8A77] active:scale-95 transition-all flex items-center justify-center group"
        aria-label="Adicionar Alimento"
      >
        <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Diálogo de Cadastro / Edição */}
      {dialogoCadastroAberto && (
        <DialogoCadastro
          aberto={dialogoCadastroAberto}
          onFechar={() => {
            setDialogoCadastroAberto(false);
            setItemEmEdicao(null);
          }}
          onSalvar={handleSalvarCadastro}
          itemEditando={itemEmEdicao}
          escuro={escuro}
        />
      )}

      {/* Modal de Confirmação de Baixa (Consumo ou Descarte) */}
      {itemSelecionadoBaixa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div
            className={`w-full max-w-xs rounded-3xl p-5 shadow-2xl border ${
              escuro
                ? 'bg-[#131B36] text-[#F2F5FF] border-[#26414B]'
                : 'bg-white text-[#14343C] border-[#D8E6E8]'
            }`}
          >
            <h3 className="text-base font-bold font-display mb-1">
              {motivoBaixa === 'CONSUMIDO' ? '🎉 Consumir Item' : '🗑️ Descartar Item'}
            </h3>
            <p className="text-xs opacity-75 mb-4">
              {itemSelecionadoBaixa.nome} (disponível: {itemSelecionadoBaixa.quantidade}{' '}
              {itemSelecionadoBaixa.unidade})
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1 opacity-90">
                Quantidade a dar baixa:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQtdBaixa((q) => Math.max(0.5, q - 1))}
                  className="w-9 h-9 rounded-xl border border-gray-400 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0.1"
                  max={itemSelecionadoBaixa.quantidade}
                  step="any"
                  value={qtdBaixa}
                  onChange={(e) =>
                    setQtdBaixa(
                      Math.min(
                        itemSelecionadoBaixa.quantidade,
                        Math.max(0.1, parseFloat(e.target.value) || 1)
                      )
                    )
                  }
                  className={`flex-1 py-1.5 px-3 text-center rounded-xl border font-bold text-sm ${
                    escuro
                      ? 'bg-[#1A2342] border-[#26414B] text-white'
                      : 'bg-[#F7FAFA] border-[#D8E6E8] text-black'
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setQtdBaixa((q) =>
                      Math.min(itemSelecionadoBaixa.quantidade, q + 1)
                    )
                  }
                  className="w-9 h-9 rounded-xl border border-gray-400 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>

              {/* Botão de baixar tudo */}
              <button
                type="button"
                onClick={() => setQtdBaixa(itemSelecionadoBaixa.quantidade)}
                className="w-full text-center mt-2 text-[11px] font-semibold text-[#0B6E5F] dark:text-[#6EE7B7] hover:underline"
              >
                Dar baixa em tudo ({itemSelecionadoBaixa.quantidade}{' '}
                {itemSelecionadoBaixa.unidade})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setItemSelecionadoBaixa(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-gray-400/30"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBaixa}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-sm ${
                  motivoBaixa === 'CONSUMIDO'
                    ? 'bg-[#0B6E5F] hover:bg-[#0E8A77]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
