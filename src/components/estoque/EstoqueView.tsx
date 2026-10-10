import React, { useState } from 'react';
import { Search, Plus, Check, Trash2, MoreVertical, Image as ImageIcon, X } from 'lucide-react';
import { EstoqueItem, LocalEstoque, MotivoBaixa, StatusValidade } from '../../types';
import { statusValidade, diasParaVencer } from '../../domain/validade';
import { formatarDataBr, valorTotalBaixa } from '../../domain/validacaoCadastro';
import { DialogoCadastro } from './DialogoCadastro';

interface EstoqueViewProps {
  itens: EstoqueItem[];
  escuro: boolean;
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
  onDarBaixa: (item: EstoqueItem, motivo: MotivoBaixa) => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({
  itens,
  escuro,
  onSalvarItem,
  onRemoverItem,
  onDarBaixa,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroLocal, setFiltroLocal] = useState<LocalEstoque | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [fotoAmpliada, setFotoAmpliada] = useState<{ url: string; nome: string } | null>(null);
  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);

  const agora = Date.now();

  const filtros: { label: string; valor: LocalEstoque | null }[] = [
    { label: 'Todos', valor: null },
    { label: 'Geladeira', valor: 'GELADEIRA' },
    { label: 'Freezer', valor: 'FREEZER' },
    { label: 'Despensa', valor: 'DESPENSA' },
  ];

  // Filtering
  const itensFiltrados = itens.filter((item) => {
    const matchBusca =
      !busca.trim() ||
      item.nome.toLowerCase().includes(busca.toLowerCase().trim());
    const matchLocal = filtroLocal === null || item.local === filtroLocal;
    return matchBusca && matchLocal;
  });

  const getStatusBadge = (status: StatusValidade) => {
    switch (status) {
      case 'FRESCO':
        return {
          label: 'FRESCO',
          bg: escuro ? 'bg-[#6EE7B7]/20 text-[#6EE7B7]' : 'bg-[#E0F2EE] text-[#0B6E5F]',
          ring: escuro ? '#6EE7B7' : '#0B6E5F',
        };
      case 'ATENCAO':
        return {
          label: 'ATENÇÃO',
          bg: escuro ? 'bg-[#FFB224]/20 text-[#FFB224]' : 'bg-[#FFF3D6] text-[#8A5A00]',
          ring: '#FFB224',
        };
      case 'VENCIDO':
        return {
          label: 'VENCEU',
          bg: escuro ? 'bg-[#FCA5A5]/20 text-[#FCA5A5]' : 'bg-[#FDECEC] text-[#B91C1C]',
          ring: escuro ? '#FCA5A5' : '#B91C1C',
        };
      case 'SEM_VALIDADE':
      default:
        return {
          label: 'SEM VALIDADE',
          bg: escuro ? 'bg-[#26414B]/50 text-[#9AA4C7]' : 'bg-[#EAF3F3] text-[#47626E]',
          ring: escuro ? '#26414B' : '#D8E6E8',
        };
    }
  };

  const rotuloLocal = (l: LocalEstoque) => {
    switch (l) {
      case 'GELADEIRA':
        return 'geladeira';
      case 'FREEZER':
        return 'freezer';
      case 'DESPENSA':
        return 'despensa';
    }
  };

  return (
    <div className="pb-28">
      {/* Search Input */}
      <div className="relative mb-3">
        <Search
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
            escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
          }`}
        />
        <input
          type="text"
          placeholder="Buscar item no estoque..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium border transition-colors outline-none focus:ring-2 focus:ring-[#0B6E5F] ${
            escuro
              ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF] placeholder-[#9AA4C7]'
              : 'bg-[#FFFFFF] border-[#D8E6E8] text-[#14343C] placeholder-[#47626E]/60 shadow-xs'
          }`}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        {filtros.map((f) => {
          const ativo = filtroLocal === f.valor;
          return (
            <button
              key={f.label}
              type="button"
              onClick={() => setFiltroLocal(f.valor)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 active:scale-95 ${
                ativo
                  ? escuro
                    ? 'bg-[#6EE7B7] text-[#0A0E1A] border-[#6EE7B7]'
                    : 'bg-[#0B6E5F] text-white border-[#0B6E5F]'
                  : escuro
                  ? 'bg-[#131B36] text-[#9AA4C7] border-[#26414B] hover:text-[#F2F5FF]'
                  : 'bg-[#FFFFFF] text-[#47626E] border-[#D8E6E8] hover:text-[#14343C] shadow-xs'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Quick guide */}
      <div className="flex items-center justify-between text-xs mb-3 px-1 font-medium text-[#47626E] dark:text-[#9AA4C7]">
        <span>{itensFiltrados.length} {itensFiltrados.length === 1 ? 'item' : 'itens'} encontrados</span>
        <span>Ações: Consumir / Descartar</span>
      </div>

      {/* Items List */}
      {itensFiltrados.length === 0 ? (
        <div
          className={`p-8 text-center rounded-[24px] border ${
            escuro
              ? 'bg-[#131B36] border-[#26414B] text-[#9AA4C7]'
              : 'bg-white border-[#D8E6E8] text-[#47626E] shadow-sm'
          }`}
        >
          <div className="text-4xl mb-3">🧺</div>
          <h3 className="font-bold text-base mb-1 font-display text-[#14343C] dark:text-[#F2F5FF]">
            Sua feira está vazia
          </h3>
          <p className="text-xs">
            {busca.trim()
              ? `Nenhum item corresponde a "${busca}".`
              : 'Toque em Adicionar para cadastrar o primeiro item.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {itensFiltrados.map((item) => {
            const status = statusValidade(item.validade, agora);
            const badge = getStatusBadge(status);
            const dias = diasParaVencer(item.validade, agora);
            const temFoto = !!item.fotoPath;

            let validadeTexto = 'Sem validade';
            if (item.validade != null) {
              const dataFormatada = formatarDataBr(item.validade);
              if (dias != null && dias < 0) {
                validadeTexto = `Venceu há ${-dias}d • ${dataFormatada}`;
              } else if (dias != null && dias === 0) {
                validadeTexto = `Vence hoje • ${dataFormatada}`;
              } else if (dias != null) {
                validadeTexto = `Vence em ${dias}d • ${dataFormatada}`;
              } else {
                validadeTexto = dataFormatada;
              }
            }

            return (
              <div
                key={item.id}
                className={`relative rounded-[24px] p-3.5 border transition-all shadow-sm ${
                  escuro
                    ? 'bg-[#131B36] border-[#26414B] hover:border-[#6EE7B7]/40'
                    : 'bg-[#FFFFFF] border-[#D8E6E8] hover:border-[#0B6E5F]/30 shadow-[#14343C]/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail with colored 3px ring */}
                  <div
                    onClick={() => {
                      if (temFoto && item.fotoPath) {
                        setFotoAmpliada({ url: item.fotoPath, nome: item.nome });
                      }
                    }}
                    style={{ borderColor: badge.ring }}
                    className={`w-14 h-14 rounded-full border-[3px] shrink-0 overflow-hidden flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                      escuro ? 'bg-[#0A0E1A]' : 'bg-[#F2F5FF]'
                    }`}
                    title={temFoto ? 'Clique para ampliar foto' : item.nome}
                  >
                    {temFoto ? (
                      <img
                        src={item.fotoPath!}
                        alt={item.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl">
                        {item.local === 'GELADEIRA'
                          ? '🥛'
                          : item.local === 'FREEZER'
                          ? '🧊'
                          : '🥫'}
                      </span>
                    )}
                  </div>

                  {/* Main Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`font-bold text-base truncate ${
                          escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
                        }`}
                      >
                        {item.nome}
                      </h4>
                    </div>

                    <p
                      className={`text-xs truncate ${
                        escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
                      }`}
                    >
                      {item.quantidade} {item.unidade} · {rotuloLocal(item.local)}
                      {item.precoRef && item.precoRef > 0 && ` · R$ ${item.precoRef.toFixed(2).replace('.', ',')}`}
                    </p>

                    <p
                      className={`text-xs font-medium mt-0.5 ${
                        status === 'VENCIDO'
                          ? escuro
                            ? 'text-[#FCA5A5]'
                            : 'text-[#B91C1C]'
                          : status === 'ATENCAO'
                          ? escuro
                            ? 'text-[#FFB224]'
                            : 'text-[#C2410C]'
                          : escuro
                          ? 'text-[#9AA4C7]'
                          : 'text-[#47626E]'
                      }`}
                    >
                      {validadeTexto}
                    </p>
                  </div>

                  {/* Pill Badge */}
                  <span
                    className={`inline-block font-extrabold text-[11px] px-2.5 py-1 rounded-full tracking-wide shrink-0 ${badge.bg}`}
                  >
                    {badge.label}
                  </span>

                  {/* Action Menu button */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setMenuAbertoId(menuAbertoId === item.id ? null : item.id)
                      }
                      className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {menuAbertoId === item.id && (
                      <div
                        className={`absolute right-0 top-8 z-30 w-48 rounded-2xl p-1.5 shadow-xl border text-sm font-semibold transition-all ${
                          escuro
                            ? 'bg-[#0A0E1A] border-[#26414B] text-[#F2F5FF]'
                            : 'bg-white border-[#D8E6E8] text-[#14343C]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuAbertoId(null);
                            onDarBaixa(item, 'CONSUMIDO');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-[#0B6E5F]/15 hover:text-[#0B6E5F] dark:hover:text-[#6EE7B7]"
                        >
                          <Check className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7]" />
                          Consumir
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuAbertoId(null);
                            onDarBaixa(item, 'DESCARTADO');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-red-500/15 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                          Descartar
                        </button>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setMenuAbertoId(null);
                            onRemoverItem(item.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          Remover sem baixa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct 1-tap action buttons */}
                <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => onDarBaixa(item, 'CONSUMIDO')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E0F2EE] text-[#0B6E5F] dark:bg-[#6EE7B7]/20 dark:text-[#6EE7B7] hover:brightness-95 active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Consumir
                  </button>
                  <button
                    type="button"
                    onClick={() => onDarBaixa(item, 'DESCARTADO')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FDECEC] text-[#B91C1C] dark:bg-[#FCA5A5]/20 dark:text-[#FCA5A5] hover:brightness-95 active:scale-95 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Descartar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Extended Floating Action Button */}
      <button
        type="button"
        onClick={() => setDialogoAberto(true)}
        className="fixed bottom-20 right-4 z-30 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#FF8A00] text-[#14343C] font-extrabold text-sm shadow-xl shadow-[#FF8A00]/30 hover:brightness-105 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        Adicionar
      </button>

      {/* Modal Cadastro */}
      {dialogoAberto && (
        <DialogoCadastro
          onSalvar={(dados) => {
            onSalvarItem(dados);
            setDialogoAberto(false);
          }}
          onFechar={() => setDialogoAberto(false)}
          escuro={escuro}
        />
      )}

      {/* Modal Foto Ampliada */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setFotoAmpliada(null)}
        >
          <div
            className={`w-full max-w-sm rounded-[28px] p-5 shadow-2xl relative ${
              escuro ? 'bg-[#131B36] text-[#F2F5FF]' : 'bg-white text-[#14343C]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg font-display truncate">
                {fotoAmpliada.nome}
              </h3>
              <button
                type="button"
                onClick={() => setFotoAmpliada(null)}
                className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square bg-black">
              <img
                src={fotoAmpliada.url}
                alt={fotoAmpliada.nome}
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setFotoAmpliada(null)}
              className="mt-4 w-full py-2.5 rounded-xl font-bold text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
