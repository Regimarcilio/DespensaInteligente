import { BaixaItem } from '../types';

/** Soma CONSUMIDO (R$ salvos no mês). */
export function salvosNaLista(baixas: BaixaItem[]): number {
  return baixas
    .filter((b) => b.motivo === 'CONSUMIDO')
    .reduce((sum, b) => sum + b.valorTotal, 0);
}

/** Soma DESCARTADO (R$ perdidos no mês). */
export function perdidosNaLista(baixas: BaixaItem[]): number {
  return baixas
    .filter((b) => b.motivo === 'DESCARTADO')
    .reduce((sum, b) => sum + b.valorTotal, 0);
}

/** 1º dia do mês 00h local */
export function inicioDoMes(agora: number): number {
  const date = new Date(agora);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Fração consumida p/ a barra consumido×descartado (0..1; 0 quando nada lançado). */
export function proporcaoConsumida(consumido: number, descartado: number): number {
  const total = consumido + descartado;
  if (total <= 0) return 0;
  return Math.min(Math.max(consumido / total, 0), 1);
}
