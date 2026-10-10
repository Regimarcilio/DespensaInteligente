# 🧊 Despensa Inteligente — chega de jogar comida (e dinheiro) fora

App **offline-first** que guarda sua despensa com validade, **avisa antes de vencer**, gera a **lista de reposição sozinho** e mostra o **desperdício evitado em R$**. Irmão do [ListaCompras](https://github.com/Regimarcilio/Projeto_ListaCompras) — ele cuida da ida ao mercado, este cuida da volta. **100% open-source, sem conta, sem rastreio.**

## ✨ Funcionalidades

- 📦 **Estoque Inteligente**: Busca instantânea, filtros por local (Geladeira, Freezer, Despensa), anel de frescor e foto do item com ampliação
- 🚦 **Semáforo de Validade**: FRESCO (> 3 dias), ATENÇÃO (≤ 3 dias), VENCEU (passou da data) e SEM VALIDADE
- 👆 **Baixa em 1 Gesto**: Ações rápidas de Consumir ✅ e Descartar 🗑️ com cálculo automático do valor em R$ (qtd × preço de referência)
- 🛒 **Lista de Reposição Automática**: Sugestões baseadas nos itens consumidos nos últimos 30 dias e nos que estão vencendo em 7 dias, com ajuste de quantidade e exportação no formato exato do ListaCompras v2.0
- 💰 **Painel R$ & Economia**: Salvos vs. perdidos no mês corrente, barra de proporção Consumido × Descartado e medidor de aproveitamento
- 💾 **Backup & Restauração JSON**: Importação e exportação de dados sem dependência de nuvem (Schema v1 compatível)
- 🌗 **Modos de Tema**: Sistema, Claro (Maré) e Escuro (Noite E-commerce)

## 🚀 Execução

- `npm run dev`: Inicia o servidor local na porta 3000
- `npm run build`: Compila para produção usando Vite e TypeScript

