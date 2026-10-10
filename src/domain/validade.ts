import { StatusValidade } from '../types';

/**
 * Zera o horário de um timestamp epoch para 00:00:00 local.
 */
export function inicioDoDia(epochMillis: number): number {
  const d = new Date(epochMillis);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Calcula a diferença em dias entre a data de validade e a data atual (ambas normalizadas para 00h).
 * Retorna null se não houver validade informada.
 */
export function diasParaVencer(validadeEpochMillis: number | null, agora: number): number | null {
  if (validadeEpochMillis === null) return null;
  const hojeMeiaNoite = inicioDoDia(agora);
  const valMeiaNoite = inicioDoDia(validadeEpochMillis);
  const umDiaMs = 24 * 60 * 60 * 1000;
  return Math.round((valMeiaNoite - hojeMeiaNoite) / umDiaMs);
}

/**
 * VENCIDO se validade < hoje 00h; ATENCAO se vence em <= 3 dias;
 * FRESCO no resto; SEM_VALIDADE se null.
 */
export function statusValidade(validadeEpochMillis: number | null, agora: number): StatusValidade {
  if (validadeEpochMillis === null) return 'SEM_VALIDADE';
  const dias = diasParaVencer(validadeEpochMillis, agora);
  if (dias === null) return 'SEM_VALIDADE';
  if (dias < 0) return 'VENCIDO';
  if (dias <= 3) return 'ATENCAO';
  return 'FRESCO';
}

/**
 * Formata o texto de dias restantes de forma amigável para o usuário.
 */
export function formatarDiasRestantes(dias: number | null): string {
  if (dias === null) return 'Sem validade cadastrada';
  if (dias < -1) return `Venceu há ${Math.abs(dias)} dias`;
  if (dias === -1) return 'Venceu ontem';
  if (dias === 0) return 'Vence hoje!';
  if (dias === 1) return 'Vence amanhã';
  if (dias <= 3) return `Vence em ${dias} dias`;
  return `Vence em ${dias} dias`;
}

/**
 * Formata epoch para DD/MM/AAAA.
 */
export function formatarDataBr(epochMillis: number | null): string {
  if (!epochMillis) return '';
  const d = new Date(epochMillis);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}
