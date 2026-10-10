import { StatusValidade } from '../types';

/**
 * VENCIDO se validade < hoje 00h; ATENÇÃO se vence em ≤3 dias;
 * FRESCO no resto; SEM_VALIDADE se null.
 */
export function statusValidade(validadeEpochMillis: number | null, agora: number): StatusValidade {
  if (validadeEpochMillis == null) return 'SEM_VALIDADE';
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);
  const hoje00h = hoje.getTime();

  if (validadeEpochMillis < hoje00h) return 'VENCIDO';

  const dataValidade = new Date(validadeEpochMillis);
  dataValidade.setHours(0, 0, 0, 0);

  const diffMs = dataValidade.getTime() - hoje00h;
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return dias <= 3 ? 'ATENCAO' : 'FRESCO';
}

/**
 * Dias (data − hoje) até vencer; null quando sem validade. Negativo = vencido há N dias.
 */
export function diasParaVencer(validadeEpochMillis: number | null, agora: number): number | null {
  if (validadeEpochMillis == null) return null;
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);
  const hoje00h = hoje.getTime();

  const dataValidade = new Date(validadeEpochMillis);
  dataValidade.setHours(0, 0, 0, 0);

  const diffMs = dataValidade.getTime() - hoje00h;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
