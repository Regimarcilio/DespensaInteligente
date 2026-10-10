import React, { useRef } from 'react';
import { Download, Upload, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { BaixaItem, EstoqueItem } from '../../types';
import { inicioDoMes, proporcaoConsumida } from '../../domain/economia';
import { formatarReais } from '../../domain/listaReposicao';
import { exportBackupJson, importBackupJson } from '../../storage/db';

interface EconomiaViewProps {
  baixas: BaixaItem[];
  itensEstoque: EstoqueItem[];
  escuro: boolean;
  onNotificar: (msg: string) => void;
  onRecarregar: () => void;
}

export const EconomiaView: React.FC<EconomiaViewProps> = ({
  baixas,
  escuro,
  onNotificar,
  onRecarregar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agora = Date.now();
  const marco = inicioDoMes(agora);

  // Filter current month
  const baixasNoMes = baixas.filter((b) => b.ts >= marco);

  const salvosNoMes = baixasNoMes
    .filter((b) => b.motivo === 'CONSUMIDO')
    .reduce((acc, b) => acc + b.valorTotal, 0);

  const perdidosNoMes = baixasNoMes
    .filter((b) => b.motivo === 'DESCARTADO')
    .reduce((acc, b) => acc + b.valorTotal, 0);

  const proporcao = proporcaoConsumida(salvosNoMes, perdidosNoMes);
  const pctConsumido = Math.round(proporcao * 100);

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const mesFormatado = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);

  // Backup Export
  const handleExportarBackup = () => {
    try {
      const json = exportBackupJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date();
      const dataStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const horaStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-despensa-${dataStr}-${horaStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onNotificar('Backup JSON exportado com sucesso! ✅');
    } catch (err: any) {
      onNotificar(`Erro ao exportar: ${err.message}`);
    }
  };

  // Backup Import
  const handleImportarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const conteudo = event.target?.result as string;
        const res = importBackupJson(conteudo);
        if (res.itens.length === 0 && res.baixas.length === 0 && res.erros.length > 0) {
          onNotificar(`Backup inválido: ${res.erros[0]}`);
        } else {
          const msg = `Backup restaurado: ${res.itens.length} itens + ${res.baixas.length} baixas ✅`;
          onNotificar(res.erros.length === 0 ? msg : `${msg} (${res.erros.length} erros)`);
          onRecarregar();
        }
      } catch (err: any) {
        onNotificar(`Erro ao ler arquivo: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const corHero = escuro ? '#6EE7B7' : '#0B6E5F';
  const corPerda = escuro ? '#FCA5A5' : '#B91C1C';

  return (
    <div className="pb-28">
      {/* Month greeting */}
      <div className="mb-2">
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
          }`}
        >
          Você salvou em {mesFormatado}
        </span>
      </div>

      {/* Main Hero in Fraunces Display */}
      <div className="mb-6">
        <h2
          className="text-5xl font-extrabold font-display tracking-tight leading-none my-1"
          style={{ color: corHero }}
        >
          R$ {formatarReais(salvosNoMes)}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-base font-bold"
            style={{ color: corPerda }}
          >
            R$ {formatarReais(perdidosNoMes)} perdidos
          </span>
          <span
            className={`text-xs ${
              escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
            }`}
          >
            neste mês
          </span>
        </div>
      </div>

      {/* Two Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Consumido (Salvo) */}
        <div
          className={`p-4 rounded-[24px] border shadow-xs transition-all ${
            escuro
              ? 'bg-[#131B36] border-[#26414B]'
              : 'bg-white border-[#D8E6E8]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: corHero }} />
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider"
              style={{ color: corHero }}
            >
              Consumido
            </span>
          </div>
          <div
            className="text-xl font-bold font-display"
            style={{ color: corHero }}
          >
            R$ {formatarReais(salvosNoMes)}
          </div>
        </div>

        {/* Descartado (Perda) */}
        <div
          className={`p-4 rounded-[24px] border shadow-xs transition-all ${
            escuro
              ? 'bg-[#131B36] border-[#26414B]'
              : 'bg-white border-[#D8E6E8]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: corPerda }} />
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider"
              style={{ color: corPerda }}
            >
              Descartado
            </span>
          </div>
          <div
            className="text-xl font-bold font-display"
            style={{ color: corPerda }}
          >
            R$ {formatarReais(perdidosNoMes)}
          </div>
        </div>
      </div>

      {/* Proportion Gauge Section */}
      <div
        className={`p-5 rounded-[24px] border shadow-xs mb-6 ${
          escuro
            ? 'bg-[#131B36] border-[#26414B]'
            : 'bg-white border-[#D8E6E8]'
        }`}
      >
        <h4
          className={`text-sm font-bold font-display mb-3 ${
            escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
          }`}
        >
          Consumido × descartado
        </h4>

        {/* Custom Proportion Bar */}
        <div
          className={`relative w-full h-4 rounded-full overflow-hidden ${
            escuro ? 'bg-[#0A0E1A]' : 'bg-[#EAF3F3]'
          }`}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(pctConsumido, 0)}%`,
              backgroundColor: corHero,
            }}
          />
          {/* Knob indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FF8A00] border-2 border-white dark:border-[#0A0E1A] shadow-md transition-all duration-700"
            style={{
              left: `calc(${Math.min(Math.max(pctConsumido, 2), 98)}% - 8px)`,
            }}
          />
        </div>

        {/* Label */}
        <p
          className={`text-xs mt-3 font-medium ${
            escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
          }`}
        >
          {salvosNoMes + perdidosNoMes <= 0
            ? 'Nada lançado este mês — dê baixa nos itens do estoque para acompanhar o aproveitamento.'
            : `${pctConsumido}% consumido · ${100 - pctConsumido}% descartado`}
        </p>
      </div>

      {/* Backup JSON Section (Issue #2, US09) */}
      <div
        className={`p-5 rounded-[24px] border shadow-xs ${
          escuro
            ? 'bg-[#131B36] border-[#26414B]'
            : 'bg-white border-[#D8E6E8]'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
          <h4
            className={`text-sm font-bold font-display ${
              escuro ? 'text-[#F2F5FF]' : 'text-[#14343C]'
            }`}
          >
            Backup & Restauração
          </h4>
        </div>
        <p
          className={`text-xs mb-4 ${
            escuro ? 'text-[#9AA4C7]' : 'text-[#47626E]'
          }`}
        >
          Salve todo o seu estoque e histórico em formato JSON puro. Seguro, sem conta e offline.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExportarBackup}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-[#FF8A00] text-[#14343C] shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            Exportar JSON
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 ${
              escuro
                ? 'border-[#6EE7B7] text-[#6EE7B7] hover:bg-[#6EE7B7]/10'
                : 'border-[#0B6E5F] text-[#0B6E5F] hover:bg-[#0B6E5F]/10'
            }`}
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportarArquivo}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
