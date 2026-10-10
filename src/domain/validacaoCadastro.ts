/** Validação do cadastro (US01). Retorna mensagem de erro pt-BR ou null quando válido. */
export function validarCadastro(nome: string, quantidade: number | null): string | null {
  if (!nome || nome.trim().length === 0) return 'Nome obrigatório';
  if (quantidade == null || isNaN(quantidade) || quantidade <= 0) return 'Quantidade deve ser > 0';
  return null;
}

/** Cálculo do valor da baixa (RF-003/RF-005). Sem preço → 0.0. */
export function valorTotalBaixa(quantidade: number, precoRef: number | null): number {
  if (quantidade <= 0) return 0;
  if (precoRef == null || isNaN(precoRef) || precoRef <= 0) return 0;
  return quantidade * precoRef;
}

/** Converte "dd/MM/yyyy" em epoch millis (00h local). */
export function parseDataBr(texto: string): number | null {
  const t = texto.trim();
  if (!t) return null;
  const parts = t.split('/');
  if (parts.length !== 3) throw new Error('Data inválida');
  const dia = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10);
  const ano = parseInt(parts[2], 10);
  if (isNaN(dia) || isNaN(mes) || isNaN(ano)) throw new Error('Data inválida');
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 2000 || ano > 2100) {
    throw new Error('Data inválida');
  }
  const date = new Date(ano, mes - 1, dia, 0, 0, 0, 0);
  return date.getTime();
}

/** Converte epoch millis para dd/MM/yyyy */
export function formatarDataBr(epoch: number): string {
  const date = new Date(epoch);
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/** Converte "12,50"/"12.50" em number. */
export function parsePrecoBr(texto: string): number | null {
  const t = texto.replace('R$', '').trim();
  if (!t) return null;
  const num = parseFloat(t.replace(',', '.'));
  if (isNaN(num) || num < 0) throw new Error('Preço inválido');
  return num;
}
