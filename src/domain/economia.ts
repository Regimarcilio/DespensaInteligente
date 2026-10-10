import { BaixaItem } from '../types';

/**
 * Retorna o timestamp epoch do primeiro milissegundo do mês corrente (00:00:00 do dia 1).
 */
export function inicioDoMes(epochMillis: number): number {
  const d = new Date(epochMillis);
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
}

/** Soma valorTotal de itens marcados como CONSUMIDO. */
export function salvosNaLista(baixas: BaixaItem[]): number {
  return baixas
    .filter((b) => b.motivo === 'CONSUMIDO')
    .reduce((sum, b) => sum + (b.valorTotal || 0), 0);
}

/** Soma valorTotal de itens marcados como DESCARTADO. */
export function desperdicadosNaLista(baixas: BaixaItem[]): number {
  return baixas
    .filter((b) => b.motivo === 'DESCARTADO')
    .reduce((sum, b) => sum + (b.valorTotal || 0), 0);
}

/**
 * Calcula a taxa de aproveitamento (0% a 100%).
 * Se o total movimentado for 0, retorna 100%.
 */
export function proporcaoConsumida(salvos: number, desperdicados: number): number {
  const total = salvos + desperdicados;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, (salvos / total) * 100));
}

/**
 * Retorna o resumo financeiro filtrado pelo mês atual.
 */
export function resumoEconomiaMes(baixas: BaixaItem[], agora: number = Date.now()) {
  const mesInicio = inicioDoMes(agora);
  const baixasDoMes = baixas.filter((b) => b.ts >= mesInicio);

  const salvosMes = salvosNaLista(baixasDoMes);
  const desperdicadosMes = desperdicadosNaLista(baixasDoMes);
  const taxaAproveitamento = proporcaoConsumida(salvosMes, desperdicadosMes);

  const salvosTotal = salvosNaLista(baixas);
  const desperdicadosTotal = desperdicadosNaLista(baixas);

  return {
    salvosMes,
    desperdicadosMes,
    taxaAproveitamento,
    salvosTotal,
    desperdicadosTotal,
    quantidadeAcoesMes: baixasDoMes.length,
  };
}
