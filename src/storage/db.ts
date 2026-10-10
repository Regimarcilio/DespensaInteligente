import { EstoqueItem, BaixaItem, ModoTema, BackupPayload } from '../types';

const STORAGE_KEY_ITENS = 'despensa_itens_v1';
const STORAGE_KEY_BAIXAS = 'despensa_baixas_v1';
const STORAGE_KEY_TEMA = 'despensa_modo_tema';

const SCHEMA_VERSION = 1;

/**
 * Itens iniciais de exemplo para a primeira utilização do app
 */
const ITENS_INICIAIS: EstoqueItem[] = [
  {
    id: 'seed-1',
    nome: 'Leite Integral 1L',
    quantidade: 2,
    unidade: 'cx',
    local: 'GELADEIRA',
    // Vence em 2 dias (ATENÇÃO)
    validade: Date.now() + 2 * 24 * 60 * 60 * 1000,
    precoRef: 4.89,
    categoria: 'Laticínios',
    dataCadastro: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-2',
    nome: 'Iogurte Natural',
    quantidade: 3,
    unidade: 'pote',
    local: 'GELADEIRA',
    // Venceu ontem (VENCIDO)
    validade: Date.now() - 1 * 24 * 60 * 60 * 1000,
    precoRef: 3.5,
    categoria: 'Laticínios',
    dataCadastro: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-3',
    nome: 'Filé de Frango 1kg',
    quantidade: 2,
    unidade: 'pct',
    local: 'FREEZER',
    // Vence em 60 dias (FRESCO)
    validade: Date.now() + 60 * 24 * 60 * 60 * 1000,
    precoRef: 19.9,
    categoria: 'Carnes',
    dataCadastro: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-4',
    nome: 'Arroz Branco 5kg',
    quantidade: 1,
    unidade: 'pct',
    local: 'DESPENSA',
    // Vence em 180 dias (FRESCO)
    validade: Date.now() + 180 * 24 * 60 * 60 * 1000,
    precoRef: 28.5,
    categoria: 'Grãos',
    dataCadastro: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-5',
    nome: 'Tomate Italiano',
    quantidade: 6,
    unidade: 'un',
    local: 'GELADEIRA',
    // Vence amanhã (ATENÇÃO)
    validade: Date.now() + 1 * 24 * 60 * 60 * 1000,
    precoRef: 1.2,
    categoria: 'Hortifrúti',
    dataCadastro: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-6',
    nome: 'Azeite Extra Virgem 500ml',
    quantidade: 1,
    unidade: 'un',
    local: 'DESPENSA',
    validade: Date.now() + 240 * 24 * 60 * 60 * 1000,
    precoRef: 34.9,
    categoria: 'Temperos',
    dataCadastro: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
];

const BAIXAS_INICIAIS: BaixaItem[] = [
  {
    id: 'seed-bx-1',
    nome: 'Manteiga com Sal 200g',
    quantidade: 1,
    unidade: 'pote',
    motivo: 'CONSUMIDO',
    valorTotal: 11.5,
    ts: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-bx-2',
    nome: 'Queijo Muçarela 300g',
    quantidade: 1,
    unidade: 'pct',
    motivo: 'CONSUMIDO',
    valorTotal: 16.8,
    ts: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'seed-bx-3',
    nome: 'Pão de Forma',
    quantidade: 1,
    unidade: 'pct',
    motivo: 'DESCARTADO',
    valorTotal: 7.9,
    ts: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
];

export function loadItens(): EstoqueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITENS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(ITENS_INICIAIS));
      return ITENS_INICIAIS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ITENS_INICIAIS;
  } catch (err) {
    console.error('Erro ao ler estoque do localStorage:', err);
    return ITENS_INICIAIS;
  }
}

export function saveItens(itens: EstoqueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(itens));
    window.dispatchEvent(new Event('despensa_storage_update'));
  } catch (err) {
    console.error('Erro ao salvar estoque no localStorage:', err);
  }
}

export function loadBaixas(): BaixaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BAIXAS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BAIXAS, JSON.stringify(BAIXAS_INICIAIS));
      return BAIXAS_INICIAIS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : BAIXAS_INICIAIS;
  } catch (err) {
    console.error('Erro ao ler baixas do localStorage:', err);
    return BAIXAS_INICIAIS;
  }
}

export function saveBaixas(baixas: BaixaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BAIXAS, JSON.stringify(baixas));
    window.dispatchEvent(new Event('despensa_storage_update'));
  } catch (err) {
    console.error('Erro ao salvar baixas no localStorage:', err);
  }
}

export function loadTema(): ModoTema {
  try {
    const tema = localStorage.getItem(STORAGE_KEY_TEMA) as ModoTema | null;
    if (tema === 'CLARO' || tema === 'ESCURO' || tema === 'SISTEMA') {
      return tema;
    }
    return 'SISTEMA';
  } catch {
    return 'SISTEMA';
  }
}

export function saveTema(tema: ModoTema): void {
  try {
    localStorage.setItem(STORAGE_KEY_TEMA, tema);
    window.dispatchEvent(new Event('despensa_tema_update'));
  } catch (err) {
    console.error('Erro ao salvar tema:', err);
  }
}

export function exportarBackupJson(): string {
  const payload: BackupPayload = {
    versao: SCHEMA_VERSION,
    exportadoEm: Date.now(),
    itens: loadItens(),
    baixas: loadBaixas(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importarBackupJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.itens)) {
      throw new Error('Formato inválido: array de itens não encontrado');
    }
    saveItens(data.itens);
    if (Array.isArray(data.baixas)) {
      saveBaixas(data.baixas);
    }
    return true;
  } catch (err) {
    console.error('Falha ao importar backup JSON:', err);
    return false;
  }
}

export function resetarDados(): void {
  saveItens(ITENS_INICIAIS);
  saveBaixas(BAIXAS_INICIAIS);
}
