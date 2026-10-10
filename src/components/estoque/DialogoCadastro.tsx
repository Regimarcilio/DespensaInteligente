import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle, Calendar, Plus, Check } from 'lucide-react';
import { LocalEstoque, EstoqueItem } from '../../types';
import { validarCadastro, parsePrecoBr } from '../../domain/validacaoCadastro';

interface DialogoCadastroProps {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (item: Omit<EstoqueItem, 'id'>) => void;
  itemEditando?: EstoqueItem | null;
  escuro: boolean;
}

const UNIDADES_COMUNS = ['un', 'kg', 'g', 'L', 'ml', 'cx', 'pct', 'pote', 'lata'];

export const DialogoCadastro: React.FC<DialogoCadastroProps> = ({
  aberto,
  onFechar,
  onSalvar,
  itemEditando,
  escuro,
}) => {
  const [nome, setNome] = useState('');
  const [quantidadeStr, setQuantidadeStr] = useState('1');
  const [unidade, setUnidade] = useState('un');
  const [local, setLocal] = useState<LocalEstoque>('GELADEIRA');
  const [dataValidadeStr, setDataValidadeStr] = useState('');
  const [precoRefStr, setPrecoRefStr] = useState('');
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [categoria, setCategoria] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar formulário
  useEffect(() => {
    if (itemEditando) {
      setNome(itemEditando.nome);
      setQuantidadeStr(itemEditando.quantidade.toString());
      setUnidade(itemEditando.unidade || 'un');
      setLocal(itemEditando.local || 'GELADEIRA');
      setPrecoRefStr(itemEditando.precoRef ? itemEditando.precoRef.toFixed(2).replace('.', ',') : '');
      setFotoUri(itemEditando.fotoUri || null);
      setCategoria(itemEditando.categoria || '');

      if (itemEditando.validade) {
        const d = new Date(itemEditando.validade);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDataValidadeStr(`${yyyy}-${mm}-${dd}`);
      } else {
        setDataValidadeStr('');
      }
    } else {
      setNome('');
      setQuantidadeStr('1');
      setUnidade('un');
      setLocal('GELADEIRA');
      setDataValidadeStr('');
      setPrecoRefStr('');
      setFotoUri(null);
      setCategoria('');
    }
    setErro(null);
  }, [itemEditando, aberto]);

  if (!aberto) return null;

  // Atalhos de validade rápida
  const aplicarAtalhoValidade = (dias: number | null) => {
    if (dias === null) {
      setDataValidadeStr('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDataValidadeStr(`${yyyy}-${mm}-${dd}`);
  };

  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFotoUri(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmeter = (e: React.FormEvent) => {
    e.preventDefault();

    const qtdNum = parseFloat(quantidadeStr.replace(',', '.'));
    const erroValidacao = validarCadastro(nome, qtdNum);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    let validadeEpoch: number | null = null;
    if (dataValidadeStr.trim()) {
      const partes = dataValidadeStr.split('-');
      if (partes.length === 3) {
        const dataObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]), 23, 59, 59);
        validadeEpoch = dataObj.getTime();
      }
    }

    const precoRef = parsePrecoBr(precoRefStr);

    onSalvar({
      nome: nome.trim(),
      quantidade: qtdNum,
      unidade: unidade.trim() || 'un',
      local,
      validade: validadeEpoch,
      precoRef,
      fotoUri,
      categoria: categoria.trim() || undefined,
      dataCadastro: itemEditando?.dataCadastro || Date.now(),
    });

    onFechar();
  };

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
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/5 dark:border-white/5">
          <h2 className="text-xl font-bold font-display">
            {itemEditando ? 'Editar Item' : 'Novo Item na Despensa'}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmeter} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-inherit opacity-90">
              Nome do Item *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="ex: Leite Integral, Iogurte de Frutas..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
                escuro
                  ? 'bg-[#1A2342] border-[#26414B] text-[#F2F5FF] placeholder-gray-500'
                  : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#14343C] placeholder-gray-400'
              }`}
            />
          </div>

          {/* Quantidade e Unidade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-90">
                Quantidade *
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantidadeStr}
                onChange={(e) => setQuantidadeStr(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#1A2342] border-[#26414B] text-[#F2F5FF]'
                    : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#14343C]'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 opacity-90">
                Unidade
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#1A2342] border-[#26414B] text-[#F2F5FF]'
                    : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#14343C]'
                }`}
              >
                {UNIDADES_COMUNS.map((u) => (
                  <option key={u} value={u} className="text-black">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Local de Armazenamento */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 opacity-90">
              Onde vai guardar?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'GELADEIRA', label: 'Geladeira', emoji: '🥛' },
                  { id: 'FREEZER', label: 'Freezer', emoji: '❄️' },
                  { id: 'DESPENSA', label: 'Despensa', emoji: '🥫' },
                ] as const
              ).map((loc) => {
                const sel = local === loc.id;
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocal(loc.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      sel
                        ? escuro
                          ? 'bg-[#30B09E]/20 border-[#30B09E] text-[#6EE7B7]'
                          : 'bg-[#0B6E5F]/15 border-[#0B6E5F] text-[#0B6E5F]'
                        : escuro
                        ? 'bg-[#1A2342] border-[#26414B] text-[#9CB3B8]'
                        : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#506368]'
                    }`}
                  >
                    <span>{loc.emoji}</span>
                    <span>{loc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data de Validade */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold opacity-90 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Data de Validade (Semáforo)</span>
              </label>
              {dataValidadeStr && (
                <button
                  type="button"
                  onClick={() => setDataValidadeStr('')}
                  className="text-[11px] text-[#FF8A00] hover:underline"
                >
                  Sem validade
                </button>
              )}
            </div>

            <input
              type="date"
              value={dataValidadeStr}
              onChange={(e) => setDataValidadeStr(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
                escuro
                  ? 'bg-[#1A2342] border-[#26414B] text-[#F2F5FF]'
                  : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#14343C]'
              }`}
            />

            {/* Atalhos rápidos de validade */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => aplicarAtalhoValidade(0)}
                className="px-2 py-1 rounded-lg text-[11px] bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoValidade(3)}
                className="px-2 py-1 rounded-lg text-[11px] bg-amber-500/10 text-amber-500 font-medium hover:bg-amber-500/20"
              >
                +3 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoValidade(7)}
                className="px-2 py-1 rounded-lg text-[11px] bg-teal-500/10 text-teal-600 font-medium hover:bg-teal-500/20"
              >
                +7 dias
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoValidade(30)}
                className="px-2 py-1 rounded-lg text-[11px] bg-teal-500/10 text-teal-600 font-medium hover:bg-teal-500/20"
              >
                +1 mês
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoValidade(null)}
                className="px-2 py-1 rounded-lg text-[11px] bg-gray-500/10 text-gray-500 font-medium hover:bg-gray-500/20"
              >
                Sem prazo
              </button>
            </div>
          </div>

          {/* Preço Unitário Estimado (R$) */}
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-90">
              Preço Estimado (R$) <span className="opacity-60 font-normal">opcional, para cálculo de economia</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold opacity-60">
                R$
              </span>
              <input
                type="text"
                placeholder="0,00"
                value={precoRefStr}
                onChange={(e) => setPrecoRefStr(e.target.value)}
                className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B6E5F] ${
                  escuro
                    ? 'bg-[#1A2342] border-[#26414B] text-[#F2F5FF]'
                    : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#14343C]'
                }`}
              />
            </div>
          </div>

          {/* Foto (opcional) */}
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-90">
              Foto do Alimento <span className="opacity-60 font-normal">opcional</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFotoUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  escuro
                    ? 'bg-[#1A2342] border-[#26414B] text-[#9CB3B8] hover:text-[#F2F5FF]'
                    : 'bg-[#F7FAFA] border-[#D8E6E8] text-[#506368] hover:text-[#14343C]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>{fotoUri ? 'Alterar foto' : 'Tirar / Selecionar foto'}</span>
              </button>

              {fotoUri && (
                <div className="relative group">
                  <img
                    src={fotoUri}
                    alt="Foto do item"
                    className="w-10 h-10 rounded-xl object-cover border border-[#0B6E5F]"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoUri(null)}
                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white shadow-xs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 pt-3 border-t border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={onFechar}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                escuro
                  ? 'border-[#26414B] text-[#9CB3B8] hover:bg-white/5'
                  : 'border-[#D8E6E8] text-[#506368] hover:bg-black/5'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#0B6E5F] text-white hover:bg-[#0E8A77] shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Item</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
