import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { EstoqueView } from './components/estoque/EstoqueView';
import { ListaView } from './components/lista/ListaView';
import { EconomiaView } from './components/economia/EconomiaView';
import { ThemeDialog } from './components/ThemeDialog';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { EstoqueItem, BaixaItem, ModoTema, MotivoBaixa, LocalEstoque, StatusValidade } from './types';
import {
  loadItens,
  saveItens,
  loadBaixas,
  saveBaixas,
  loadTema,
  saveTema,
} from './storage/db';
import { valorTotalBaixa } from './domain/validacaoCadastro';

export const App: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<'ESTOQUE' | 'LISTA' | 'ECONOMIA'>('ESTOQUE');
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [baixas, setBaixas] = useState<BaixaItem[]>([]);
  const [modoTema, setModoTema] = useState<ModoTema>('SISTEMA');
  const [systemDark, setSystemDark] = useState<boolean>(false);
  const [dialogoTemaAberto, setDialogoTemaAberto] = useState(false);
  const [dialogoInstallAberto, setDialogoInstallAberto] = useState(false);
  const [dialogoGithubAberto, setDialogoGithubAberto] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusValidade | null>(null);

  // Recarregar dados
  const recarregarDados = () => {
    setItens(loadItens());
    setBaixas(loadBaixas());
    setModoTema(loadTema());
  };

  useEffect(() => {
    recarregarDados();

    // System dark mode listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // Custom storage event listener
    const handleStorageChange = () => {
      recarregarDados();
    };
    window.addEventListener('despensa_storage_update', handleStorageChange);
    window.addEventListener('despensa_tema_update', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('despensa_storage_update', handleStorageChange);
      window.removeEventListener('despensa_tema_update', handleStorageChange);
    };
  }, []);

  const escuro =
    modoTema === 'ESCURO' || (modoTema === 'SISTEMA' && systemDark);

  // Apply dark mode class to html element
  useEffect(() => {
    if (escuro) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0A0E1A';
      document.body.style.color = '#F2F5FF';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FFFBF4';
      document.body.style.color = '#14343C';
    }
  }, [escuro]);

  const exibirNotificacao = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Actions
  const handleSalvarItem = (dados: {
    nome: string;
    quantidade: number;
    unidade: string;
    validade: number | null;
    local: LocalEstoque;
    precoRef: number | null;
    fotoPath: string | null;
  }) => {
    const novoItem: EstoqueItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}`,
      nome: dados.nome,
      quantidade: dados.quantidade,
      unidade: dados.unidade,
      validade: dados.validade,
      local: dados.local,
      precoRef: dados.precoRef,
      fotoUri: dados.fotoPath,
      fotoPath: dados.fotoPath,
      createdAt: Date.now(),
    };

    const novaLista = [novoItem, ...itens];
    saveItens(novaLista);
    setItens(novaLista);
    exibirNotificacao(`${novoItem.nome} adicionado ao estoque! ✅`);
  };

  const handleRemoverItem = (id: string) => {
    const item = itens.find((i) => i.id === id);
    const novaLista = itens.filter((i) => i.id !== id);
    saveItens(novaLista);
    setItens(novaLista);
    if (item) {
      exibirNotificacao(`${item.nome} removido.`);
    }
  };

  const handleDarBaixa = (item: EstoqueItem, motivo: MotivoBaixa) => {
    const valor = valorTotalBaixa(item.quantidade, item.precoRef);
    const novaBaixa: BaixaItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `baixa-${Date.now()}`,
      nome: item.nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
      valorTotal: valor,
      motivo,
      ts: Date.now(),
    };

    // Remove do estoque
    const novoEstoque = itens.filter((i) => i.id !== item.id);
    saveItens(novoEstoque);
    setItens(novoEstoque);

    // Registra baixa
    const novoHistorico = [novaBaixa, ...baixas];
    saveBaixas(novoHistorico);
    setBaixas(novoHistorico);

    exibirNotificacao(
      motivo === 'CONSUMIDO'
        ? `${item.nome} consumido! ✅ Salvo R$ ${valor.toFixed(2).replace('.', ',')}`
        : `${item.nome} descartado 🗑️ Registrado R$ ${valor.toFixed(2).replace('.', ',')}`
    );
  };

  const handleEscolherTema = (tema: ModoTema) => {
    saveTema(tema);
    setModoTema(tema);
    setDialogoTemaAberto(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        escuro
          ? 'bg-[#0A0E1A] text-[#F2F5FF] fundo-feira-dark'
          : 'bg-[#FFFBF4] text-[#14343C] fundo-feira-light'
      }`}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative shadow-xl">
        {/* Top App Bar with creative header */}
        <Navbar
          abaAtiva={abaAtiva}
          itens={itens}
          baixas={baixas}
          modoTema={modoTema}
          escuro={escuro}
          onAbrirTema={() => setDialogoTemaAberto(true)}
          onAbrirInstallModal={() => setDialogoInstallAberto(true)}
          onAbrirGithubModal={() => setDialogoGithubAberto(true)}
          filtroStatus={filtroStatus}
          onFiltrarStatus={setFiltroStatus}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-1">
          {abaAtiva === 'ESTOQUE' && (
            <EstoqueView
              itens={itens}
              escuro={escuro}
              filtroStatus={filtroStatus}
              onLimparFiltroStatus={() => setFiltroStatus(null)}
              onSalvarItem={handleSalvarItem}
              onRemoverItem={handleRemoverItem}
              onDarBaixa={handleDarBaixa}
            />
          )}

          {abaAtiva === 'LISTA' && (
            <ListaView
              itensEstoque={itens}
              baixas={baixas}
              escuro={escuro}
              onNotificar={exibirNotificacao}
            />
          )}

          {abaAtiva === 'ECONOMIA' && (
            <EconomiaView
              baixas={baixas}
              itensEstoque={itens}
              escuro={escuro}
              onNotificar={exibirNotificacao}
              onRecarregar={recarregarDados}
              onAbrirGithubModal={() => setDialogoGithubAberto(true)}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          abaAtiva={abaAtiva}
          onMudarAba={setAbaAtiva}
          escuro={escuro}
          totalItens={itens.length}
        />

        {/* Theme Dialog */}
        {dialogoTemaAberto && (
          <ThemeDialog
            modoAtual={modoTema}
            onEscolher={handleEscolherTema}
            onFechar={() => setDialogoTemaAberto(false)}
            escuro={escuro}
          />
        )}

        {/* Android Install Modal */}
        {dialogoInstallAberto && (
          <AndroidInstallModal
            onFechar={() => setDialogoInstallAberto(false)}
            escuro={escuro}
          />
        )}

        {/* GitHub Sync Modal */}
        {dialogoGithubAberto && (
          <GitHubSyncModal
            onFechar={() => setDialogoGithubAberto(false)}
            escuro={escuro}
          />
        )}

        {/* Toast Notification Banner */}
        {toastMsg && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none">
            <div
              className={`p-3.5 rounded-2xl shadow-xl border text-xs font-bold text-center pointer-events-auto backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                escuro
                  ? 'bg-[#131B36]/95 border-[#6EE7B7] text-[#6EE7B7]'
                  : 'bg-[#14343C]/95 border-[#0B6E5F] text-[#FFFBF4]'
              }`}
            >
              {toastMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
