export type LocalEstoque = 'GELADEIRA' | 'FREEZER' | 'DESPENSA';

export type MotivoBaixa = 'CONSUMIDO' | 'DESCARTADO';

export type StatusValidade = 'VENCIDO' | 'ATENCAO' | 'FRESCO' | 'SEM_VALIDADE';

export type ModoTema = 'SISTEMA' | 'CLARO' | 'ESCURO';

export interface EstoqueItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  local: LocalEstoque;
  validade: number | null; // epoch ms ou null
  precoRef?: number | null; // preço unitário em R$
  fotoUri?: string | null; // dataURL ou URL
  fotoPath?: string | null; // compatibility
  dataCadastro?: number; // epoch ms
  createdAt?: number;
  categoria?: string;
}

export interface BaixaItem {
  id: string;
  estoqueId?: string;
  nome: string;
  quantidade: number;
  unidade: string;
  motivo: MotivoBaixa;
  valorTotal: number;
  ts: number; // epoch ms
}

export interface SugestaoItem {
  id: string;
  nome: string;
  quantidadeSugerida: number;
  unidade: string;
  precoUnit?: number | null;
  origem: 'CONSUMO' | 'VALIDADE' | 'MANUAL';
  selecionado: boolean;
  comprado?: boolean;
}

export interface BackupPayload {
  versao: number;
  exportadoEm: number;
  itens: EstoqueItem[];
  baixas: BaixaItem[];
}
