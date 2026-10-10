import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  ShieldCheck,
  TrendingUp,
  History,
  RotateCcw,
  Github,
  CheckCircle2,
} from 'lucide-react';
import { BaixaItem, EstoqueItem } from '../../types';
import { resumoEconomiaMes } from '../../domain/economia';
import { formatarReais } from '../../domain/listaReposicao';
import { exportarBackupJson, importarBackupJson, resetarDados } from '../../storage/db';

interface EconomiaViewProps {
  baixas: BaixaItem[];
  itensEstoque?: EstoqueItem[];
  itens?: EstoqueItem[];
  escuro: boolean;
  onNotificar?: (msg: string) => void;
  onRecarregar?: () => void;
  onAbrirGithubModal?: () => void;
}

export const EconomiaView: React.FC<EconomiaViewProps> = ({
  baixas,
  escuro,
  onNotificar,
  onRecarregar,
  onAbrirGithubModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  const resumo = resumoEconomiaMes(baixas);
  const ultimasBaixas = [...baixas].sort((a, b) => b.ts - a.ts).slice(0, 15);

  const handleExportar = () => {
    const jsonStr = exportarBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `despensa_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    if (onNotificar) onNotificar('Backup JSON baixado com sucesso! 📦');
    setMensagemSucesso('Backup baixado com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const ok = importarBackupJson(reader.result);
        if (ok) {
          if (onRecarregar) onRecarregar();
          if (onNotificar) onNotificar('Backup restaurado com sucesso! 🎉');
          setMensagemSucesso('Backup restaurado com sucesso!');
          setTimeout(() => setMensagemSucesso(null), 3500);
        } else {
          alert('Arquivo de backup inválido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetarExemplos = () => {
    if (confirm('Deseja recarregar os alimentos e dados de exemplo?')) {
      resetarDados();
      if (onRecarregar) onRecarregar();
      if (onNotificar) onNotificar('Dados de exemplo recarregados.');
      setMensagemSucesso('Dados restaurados para os exemplos iniciais.');
      setTimeout(() => setMensagemSucesso(null), 3000);
    }
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto space-y-3.5">
      {mensagemSucesso && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Hero Metric Card: Dinheiro Salvo no Mês */}
      <div
        className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${
          escuro
            ? 'bg-gradient-to-br from-[#131B36] to-[#0A0E1A] border-[#26414B] text-[#F2F5FF]'
            : 'bg-gradient-to-br from-[#FFFFFF] to-[#F2F8F7] border-[#D8E6E8] text-[#14343C]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0B6E5F] dark:text-[#6EE7B7] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Economia deste Mês
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0B6E5F]/10 text-[#0B6E5F] dark:text-[#6EE7B7] font-bold">
            {resumo.taxaAproveitamento.toFixed(0)}% aproveitado
          </span>
        </div>

        <div className="text-3xl font-extrabold font-display text-[#0B6E5F] dark:text-[#6EE7B7] mb-1">
          {formatarReais(resumo.salvosMes)}
        </div>
        <p className="text-xs opacity-70 mb-4">
          Valor economizado consumindo alimentos a tempo sem jogar fora.
        </p>

        {/* Progress bar de aproveitamento */}
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="bg-[#0B6E5F] dark:bg-[#30B09E] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${resumo.taxaAproveitamento}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-black/5 dark:border-white/5 text-xs">
          <div>
            <span className="opacity-70 text-[11px]">Desperdiçado no mês:</span>
            <div className="font-bold text-red-500">
              {formatarReais(resumo.desperdicadosMes)}
            </div>
          </div>
          <div>
            <span className="opacity-70 text-[11px]">Total acumulado salvo:</span>
            <div className="font-bold text-[#0B6E5F] dark:text-[#6EE7B7]">
              {formatarReais(resumo.salvosTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Histórico Recente de Baixas */}
      <div
        className={`p-4 rounded-3xl border shadow-xs ${
          escuro
            ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF]'
            : 'bg-white border-[#D8E6E8] text-[#14343C]'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7]" />
          <h4 className="font-display font-bold text-sm">Histórico Recente</h4>
        </div>

        {ultimasBaixas.length === 0 ? (
          <p className="text-xs opacity-60 text-center py-4">
            Nenhuma movimentação registrada ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {ultimasBaixas.map((b) => {
              const consumido = b.motivo === 'CONSUMIDO';
              const dataStr = new Date(b.ts).toLocaleDateString('pt-BR');

              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2 rounded-xl text-xs bg-black/5 dark:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{consumido ? '✅' : '🗑️'}</span>
                    <div>
                      <div className="font-semibold">{b.nome}</div>
                      <div className="text-[10px] opacity-60">
                        {dataStr} • {b.quantidade} {b.unidade}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`font-bold ${
                      consumido
                        ? 'text-[#0B6E5F] dark:text-[#6EE7B7]'
                        : 'text-red-500'
                    }`}
                  >
                    {consumido ? '+' : '-'}{formatarReais(b.valorTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Backup & Sincronização */}
      <div
        className={`p-4 rounded-3xl border shadow-xs space-y-3 ${
          escuro
            ? 'bg-[#131B36] border-[#26414B] text-[#F2F5FF]'
            : 'bg-white border-[#D8E6E8] text-[#14343C]'
        }`}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0B6E5F] dark:text-[#6EE7B7]" />
          <h4 className="font-display font-bold text-sm">Seus Dados e Backup</h4>
        </div>
        <p className="text-xs opacity-75">
          Tudo fica guardado com segurança no seu dispositivo (offline-first).
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportar}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              escuro
                ? 'border-[#26414B] hover:bg-white/5'
                : 'border-[#D8E6E8] hover:bg-black/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportar}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              escuro
                ? 'border-[#26414B] hover:bg-white/5'
                : 'border-[#D8E6E8] hover:bg-black/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar JSON</span>
          </button>
        </div>

        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetarExemplos}
            className="text-[11px] opacity-70 hover:opacity-100 text-amber-600 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restaurar exemplos</span>
          </button>

          {onAbrirGithubModal && (
            <button
              type="button"
              onClick={onAbrirGithubModal}
              className="text-[11px] font-semibold text-[#0B6E5F] dark:text-[#6EE7B7] flex items-center gap-1 hover:underline"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Sincronizar GitHub</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
