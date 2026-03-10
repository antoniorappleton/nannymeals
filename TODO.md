#s  TODO - Correção Modal Receitas

## Objetivo
Corrigir a visualização do modal detalhes das receitas - scroll apenas dentro do modal, não no screen.

## Tarefas
- [x] 1. Corrigir estrutura do modal em recipes-catalog.html
- [x] 2. Corrigir estrutura do modal em plan.html  
- [x] 3. Testar ambas as páginas

## Problema Original
- Scroll acontecia no ecrã inteiro em vez de apenas no conteúdo interno do modal
- Botões no fundo do modal não eram visíveis

## Solução Aplicada
1. **Estrutura HTML do modal:**
   - Overlay: `fixed inset-0 bg-black` (sem overflow)
   - Container interno: `h-full flex flex-col` (preenche a tela)
   - Área de conteúdo: `flex-1 overflow-y-auto` (scroll apenas aqui)
   - Header e Footer com `shrink-0` para ficarem sempre visíveis
   - Removido `mt-4 mb-4 h-[calc(100vh-2rem)]` e substituído por `h-full mt-0`

2. **JavaScript simplificado:**
   - Removido `position: fixed` do body (manter só `overflow: hidden`)
   - Removido `width: 100%` do body
   - Mantido `overscrollBehavior: none` para evitar pull-to-refresh no iOS

3. **Arquivos corrigidos:**
   - `app/public/recipes-catalog.html`
   - `app/public/plan.html`

