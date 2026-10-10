import { EstoqueItem, BaixaItem, ModoTema } from '../types';

const STORAGE_KEY_ITENS = 'despensa_itens_v1';
const STORAGE_KEY_BAIXAS = 'despensa_baixas_v1';
const STORAGE_KEY_TEMA = 'despensa_modo_tema';

const SCHEMA_VERSION = 1;

// Initial realistic data pre-seeded if user opens the app for the first time
function getInitialData(): { itens: EstoqueItem[]; baixas: BaixaItem[] } {
  const agora = Date.now();
  const umDia = 24 * 60 * 60 * 1000;

  const itens: EstoqueItem[] = [
    {
      id: 'item-1',
      nome: 'Iogurte natural',
      quantidade: 4,
      unidade: 'un',
      validade: agora + 5 * umDia, // Fresco: 5 dias
      local: 'GELADEIRA',
      fotoPath: null,
      precoRef: 3.50,
      createdAt: agora - 2 * umDia,
    },
    {
      id: 'item-2',
      nome: 'Queijo minas',
      quantidade: 1,
      unidade: 'un',
      validade: agora + 2 * umDia, // Atenção: 2 dias
      local: 'GELADEIRA',
      fotoPath: null,
      precoRef: 18.90,
      createdAt: agora - 4 * umDia,
    },
    {
      id: 'item-3',
      nome: 'Alface americana',
      quantidade: 1,
      unidade: 'un',
      validade: agora - 1 * umDia, // Venceu ontem
      local: 'GELADEIRA',
      fotoPath: null,
      precoRef: 3.49,
      createdAt: agora - 6 * umDia,
    },
    {
      id: 'item-4',
      nome: 'Filé de peito de frango',
      quantidade: 1.5,
      unidade: 'kg',
      validade: agora + 45 * umDia, // Fresco no freezer
      local: 'FREEZER',
      fotoPath: null,
      precoRef: 21.90,
      createdAt: agora - 10 * umDia,
    },
    {
      id: 'item-5',
      nome: 'Arroz branco tipo 1',
      quantidade: 2,
      unidade: 'kg',
      validade: agora + 120 * umDia, // Fresco na despensa
      local: 'DESPENSA',
      fotoPath: null,
      precoRef: 6.80,
      createdAt: agora - 15 * umDia,
    },
    {
      id: 'item-6',
      nome: 'Café torrado e moído',
      quantidade: 500,
      unidade: 'g',
      validade: null, // Sem validade
      local: 'DESPENSA',
      fotoPath: null,
      precoRef: 18.50,
      createdAt: agora - 8 * umDia,
    },
  ];

  const baixas: BaixaItem[] = [
    {
      id: 'baixa-1',
      nome: 'Leite integral',
      quantidade: 4,
      unidade: 'L',
      valorTotal: 21.60,
      motivo: 'CONSUMIDO',
      ts: agora - 3 * umDia,
    },
    {
      id: 'baixa-2',
      nome: 'Ovos caipiras',
      quantidade: 12,
      unidade: 'un',
      valorTotal: 16.50,
      motivo: 'CONSUMIDO',
      ts: agora - 5 * umDia,
    },
    {
      id: 'baixa-3',
      nome: 'Pão de forma',
      quantidade: 1,
      unidade: 'un',
      valorTotal: 8.90,
      motivo: 'CONSUMIDO',
      ts: agora - 7 * umDia,
    },
    {
      id: 'baixa-4',
      nome: 'Carne moída bovina',
      quantidade: 1,
      unidade: 'kg',
      valorTotal: 34.90,
      motivo: 'CONSUMIDO',
      ts: agora - 10 * umDia,
    },
    {
      id: 'baixa-5',
      nome: 'Manteiga primeira qualidade',
      quantidade: 200,
      unidade: 'g',
      valorTotal: 12.50,
      motivo: 'CONSUMIDO',
      ts: agora - 14 * umDia,
    },
    {
      id: 'baixa-6',
      nome: 'Maçã gala',
      quantidade: 1,
      unidade: 'kg',
      valorTotal: 9.80,
      motivo: 'CONSUMIDO',
      ts: agora - 18 * umDia,
    },
    {
      id: 'baixa-7',
      nome: 'Banana prata',
      quantidade: 6,
      unidade: 'un',
      valorTotal: 6.20,
      motivo: 'DESCARTADO',
      ts: agora - 12 * umDia,
    },
    {
      id: 'baixa-8',
      nome: 'Cenoura ralada',
      quantidade: 1,
      unidade: 'un',
      valorTotal: 4.50,
      motivo: 'DESCARTADO',
      ts: agora - 4 * umDia,
    },
  ];

  return { itens, baixas };
}

// Storage helpers
export function loadItens(): EstoqueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITENS);
    if (!raw) {
      const initial = getInitialData();
      localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(initial.itens));
      localStorage.setItem(STORAGE_KEY_BAIXAS, JSON.stringify(initial.baixas));
      return initial.itens;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveItens(itens: EstoqueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ITENS, JSON.stringify(itens));
    window.dispatchEvent(new Event('despensa_storage_update'));
  } catch (err) {
    console.error('Erro ao salvar itens:', err);
  }
}

export function loadBaixas(): BaixaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BAIXAS);
    if (!raw) {
      const initial = getInitialData();
      return initial.baixas;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBaixas(baixas: BaixaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BAIXAS, JSON.stringify(baixas));
    window.dispatchEvent(new Event('despensa_storage_update'));
  } catch (err) {
    console.error('Erro ao salvar baixas:', err);
  }
}

export function loadTema(): ModoTema {
  try {
    return (localStorage.getItem(STORAGE_KEY_TEMA) as ModoTema) || 'SISTEMA';
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

// Backup JSON Export & Import (Schema v1, matching Room and BackupJson.kt)
export function exportBackupJson(): string {
  const itens = loadItens();
  const baixas = loadBaixas();
  const exportedAt = new Date().toISOString();

  const backupObj = {
    app: 'Despensa',
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    itens: itens.map((i) => ({
      id: i.id,
      nome: i.nome,
      quantidade: i.quantidade,
      unidade: i.unidade,
      validade: i.validade ?? undefined,
      local: i.local,
      fotoPath: i.fotoPath || undefined,
      precoRef: i.precoRef ?? undefined,
      createdAt: i.createdAt,
    })),
    baixas: baixas.map((b) => ({
      id: b.id,
      nome: b.nome,
      quantidade: b.quantidade,
      unidade: b.unidade,
      valorTotal: b.valorTotal,
      motivo: b.motivo,
      ts: b.ts,
    })),
  };

  return JSON.stringify(backupObj, null, 2);
}

export interface ImportResult {
  itens: EstoqueItem[];
  baixas: BaixaItem[];
  erros: string[];
}

export function importBackupJson(texto: string): ImportResult {
  const erros: string[] = [];
  let root: any;

  try {
    root = JSON.parse(texto);
  } catch (e: any) {
    return { itens: [], baixas: [], erros: [`JSON inválido: ${e.message}`] };
  }

  const schemaVer = root.schemaVersion ?? 0;
  if (schemaVer > SCHEMA_VERSION) {
    return {
      itens: [],
      baixas: [],
      erros: [`schemaVersion ${schemaVer} maior que suportado (${SCHEMA_VERSION})`],
    };
  }

  const itensImportados: EstoqueItem[] = [];
  if (Array.isArray(root.itens)) {
    root.itens.forEach((o: any, idx: number) => {
      try {
        if (!o.nome || typeof o.nome !== 'string' || !o.nome.trim()) {
          throw new Error('nome ausente');
        }
        const qtd = Number(o.quantidade ?? 1);
        if (isNaN(qtd) || qtd <= 0) throw new Error('quantidade deve ser > 0');

        const preco = o.precoRef != null ? Number(o.precoRef) : null;
        if (preco != null && (isNaN(preco) || preco < 0)) throw new Error('preço negativo');

        const validade = o.validade != null ? Number(o.validade) : null;
        if (validade != null && (isNaN(validade) || validade < 0)) throw new Error('validade negativa');

        const localVal = ['GELADEIRA', 'FREEZER', 'DESPENSA'].includes(o.local) ? o.local : 'DESPENSA';

        itensImportados.push({
          id: o.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${idx}`),
          nome: o.nome.trim(),
          quantidade: qtd,
          unidade: o.unidade || 'un',
          validade,
          local: localVal,
          fotoPath: o.fotoPath || null,
          precoRef: preco,
          createdAt: Number(o.createdAt ?? Date.now()),
        });
      } catch (err: any) {
        erros.push(`itens[${idx}]: ${err.message}`);
      }
    });
  }

  const baixasImportadas: BaixaItem[] = [];
  if (Array.isArray(root.baixas)) {
    root.baixas.forEach((o: any, idx: number) => {
      try {
        if (!o.nome || typeof o.nome !== 'string' || !o.nome.trim()) {
          throw new Error('nome ausente');
        }
        const qtd = Number(o.quantidade ?? 1);
        if (isNaN(qtd) || qtd <= 0) throw new Error('quantidade deve ser > 0');

        const valor = Number(o.valorTotal ?? 0);
        if (isNaN(valor) || valor < 0) throw new Error('valorTotal negativo');

        const motivo = o.motivo === 'DESCARTADO' ? 'DESCARTADO' : 'CONSUMIDO';

        baixasImportadas.push({
          id: o.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `baixa-${Date.now()}-${idx}`),
          nome: o.nome.trim(),
          quantidade: qtd,
          unidade: o.unidade || 'un',
          valorTotal: valor,
          motivo,
          ts: Number(o.ts ?? Date.now()),
        });
      } catch (err: any) {
        erros.push(`baixas[${idx}]: ${err.message}`);
      }
    });
  }

  // Upsert into local storage (merge by ID)
  if (itensImportados.length > 0 || baixasImportadas.length > 0) {
    const atuaisItens = loadItens();
    const itemMap = new Map(atuaisItens.map((i) => [i.id, i]));
    itensImportados.forEach((i) => itemMap.set(i.id, i));
    saveItens(Array.from(itemMap.values()));

    const atuaisBaixas = loadBaixas();
    const baixaMap = new Map(atuaisBaixas.map((b) => [b.id, b]));
    baixasImportadas.forEach((b) => baixaMap.set(b.id, b));
    saveBaixas(Array.from(baixaMap.values()));
  }

  return {
    itens: itensImportados,
    baixas: baixasImportadas,
    erros,
  };
}
