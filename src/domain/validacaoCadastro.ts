/**
 * Validação do cadastro de item no estoque.
 * Retorna mensagem de erro em pt-BR ou null quando válido.
 */
export function validarCadastro(nome: string, quantidade: number | null | undefined): string | null {
  if (!nome || nome.trim().length === 0) {
    return 'Nome é obrigatório';
  }
  if (nome.trim().length > 60) {
    return 'Nome deve ter no máximo 60 caracteres';
  }
  if (quantidade === null || quantidade === undefined || isNaN(quantidade)) {
    return 'Quantidade inválida';
  }
  if (quantidade <= 0) {
    return 'Quantidade deve ser maior que zero';
  }
  if (quantidade > 9999) {
    return 'Quantidade muito alta';
  }
  return null;
}

/**
 * Converte string brasileira (ex: "12,50", "R$ 12,50", "12.50") em número.
 */
export function parsePrecoBr(texto: string): number | null {
  if (!texto) return null;
  const limpo = texto.replace(/[^\d,\.]/g, '').trim();
  if (!limpo) return null;

  // Se tiver vírgula, substitui por ponto
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const num = parseFloat(normalizado);
  return isNaN(num) || num < 0 ? null : num;
}

/**
 * Calcula o valor total de uma baixa ou compra a partir de quantidade e preço unitário.
 */
export function valorTotalBaixa(quantidade: number, precoUnit?: number | null): number {
  if (!precoUnit || isNaN(precoUnit) || precoUnit <= 0) return 0;
  if (!quantidade || isNaN(quantidade) || quantidade <= 0) return 0;
  return Math.round(quantidade * precoUnit * 100) / 100;
}
