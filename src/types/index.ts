export type LocalEstoque = 'GELADEIRA' | 'FREEZER' | 'DESPENSA';

export type MotivoBaixa = 'CONSUMIDO' | 'DESCARTADO';

export type StatusValidade = 'VENCIDO' | 'ATENCAO' | 'FRESCO' | 'SEM_VALIDADE';

export type ModoTema = 'SISTEMA' | 'CLARO' | 'ESCURO';

export interface EstoqueItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  validade: number | null; // epoch millis nullable
  local: LocalEstoque;
  fotoPath: string | null; // base64 or photo url
  precoRef: number | null; // unit price in R$
  createdAt: number;
}

export interface BaixaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  valorTotal: number;
  motivo: MotivoBaixa;
  ts: number;
}

export type OrigemSugestao = 'CONSUMO' | 'VALIDADE';

export interface SugestaoItem {
  nome: string;
  quantidade: number;
  unidade: string;
  precoUnit: number | null;
  origem: OrigemSugestao;
  marcada: boolean;
}
