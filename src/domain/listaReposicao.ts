export interface ItemReposicaoParam {
  nome: string;
  quantidade: number;
  unidade?: string;
  precoUnit?: number | null;
}

export function formatarQtdReposicao(qtd: number): string {
  return qtd % 1 === 0 ? qtd.toFixed(0) : qtd.toString();
}

/** "4,99" — sempre vírgula (formato brasileiro determinístico). */
export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function dataAtualReposicao(): string {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}

/**
 * Monta o texto de reposição no formato EXATO que o ListaCompras v2.0 importa:
 * 🛒 <nome> (<data>)
 * • <nome> — <qtd><un> x R$ <unit> = R$ <sub>
 * TOTAL: R$ <x>
 */
export function gerarTexto(
  nomeLista: string,
  itens: ItemReposicaoParam[],
  data: string = dataAtualReposicao()
): string {
  const nome = (nomeLista.trim() || 'Reposição Despensa');
  let sb = `🛒 ${nome} (${data})\n`;
  let total = 0;

  itens
    .filter((it) => it.nome.trim().length > 0 && it.quantidade > 0)
    .forEach((item) => {
      const unidade = (item.unidade || 'un').trim() || 'un';
      const unit = item.precoUnit && item.precoUnit > 0 ? item.precoUnit : 0;
      const sub = item.quantidade * unit;
      total += sub;
      sb += `• ${item.nome.trim()} — ${formatarQtdReposicao(item.quantidade)}${unidade} x R$ ${formatarReais(unit)} = R$ ${formatarReais(sub)}\n`;
    });

  sb += `TOTAL: R$ ${formatarReais(total)}`;
  return sb;
}
