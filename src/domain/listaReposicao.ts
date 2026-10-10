import { EstoqueItem, BaixaItem, SugestaoItem } from '../types';
import { diasParaVencer } from './validade';

export interface ItemReposicaoParam {
  nome: string;
  quantidade: number;
  unidade?: string;
  precoUnit?: number | null;
}

/** Formata número em moeda brasileira R$ 0,00 */
export function formatarReais(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formata quantidade sem zeros à direita se for inteiro */
export function formatarQtdReposicao(qtd: number): string {
  if (qtd % 1 === 0) return qtd.toFixed(0);
  return qtd.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

/**
 * Gera texto para exportação no WhatsApp / Compartilhamento:
 * "Lista de Compras - Despensa Inteligente"
 * - 2x Arroz
 * - 1x Azeite
 */
export function gerarTextoCompartilhamento(
  itens: Array<{ nome: string; quantidade: number; unidade?: string }>,
  titulo: string = 'Lista de Compras — Despensa Inteligente'
): string {
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR');
  const linhas = [
    `🛒 *${titulo}* (${dataFormatada})`,
    '─────────────────────────',
  ];

  if (itens.length === 0) {
    linhas.push('Nenhum item selecionado para compra.');
  } else {
    itens.forEach((it) => {
      const unidadeStr = it.unidade && it.unidade !== 'un' ? ` ${it.unidade}` : '';
      linhas.push(`• [ ] ${formatarQtdReposicao(it.quantidade)}${unidadeStr} ${it.nome}`);
    });
  }

  linhas.push('─────────────────────────');
  linhas.push('Criado com Despensa Inteligente 🥑');

  return linhas.join('\n');
}

/**
 * Gera sugestões automáticas baseadas em:
 * 1. Consumo recente (baixas nos últimos 30 dias que não estão em estoque em quantidade suficiente)
 * 2. Itens do estoque vencendo em até 3 dias ou com quantidade <= 1
 */
export function gerarSugestoesReposicao(
  estoque: EstoqueItem[],
  baixas: BaixaItem[],
  agora: number = Date.now()
): SugestaoItem[] {
  const umDiaMs = 24 * 60 * 60 * 1000;
  const limite30Dias = agora - 30 * umDiaMs;

  const resultadoMap = new Map<string, SugestaoItem>();

  // 1. Sugestões por validade próxima (<= 3 dias) ou vencidos
  estoque.forEach((item) => {
    const dias = diasParaVencer(item.validade, agora);
    const estoqueBaixo = item.quantidade <= 1;
    const venceLogo = dias !== null && dias <= 3;

    if (venceLogo || estoqueBaixo) {
      const chave = item.nome.trim().toLowerCase();
      resultadoMap.set(chave, {
        id: `sug-est-${item.id}`,
        nome: item.nome,
        quantidadeSugerida: Math.max(1, Math.ceil(item.quantidade)),
        unidade: item.unidade,
        precoUnit: item.precoRef || null,
        origem: venceLogo ? 'VALIDADE' : 'CONSUMO',
        selecionado: true,
      });
    }
  });

  // 2. Sugestões por consumo recente (últimos 30 dias)
  const baixasRecentes = baixas.filter((b) => b.ts >= limite30Dias && b.motivo === 'CONSUMIDO');

  baixasRecentes.forEach((baixa) => {
    const chave = baixa.nome.trim().toLowerCase();
    // Se não está no mapa e não há estoque sobrando desse item
    const itemEmEstoque = estoque.find(
      (e) => e.nome.trim().toLowerCase() === chave && e.quantidade > 0
    );

    if (!itemEmEstoque && !resultadoMap.has(chave)) {
      resultadoMap.set(chave, {
        id: `sug-bx-${baixa.id}`,
        nome: baixa.nome,
        quantidadeSugerida: Math.max(1, Math.ceil(baixa.quantidade)),
        unidade: baixa.unidade || 'un',
        precoUnit: baixa.valorTotal && baixa.quantidade > 0 ? baixa.valorTotal / baixa.quantidade : null,
        origem: 'CONSUMO',
        selecionado: true,
      });
    }
  });

  return Array.from(resultadoMap.values());
}
