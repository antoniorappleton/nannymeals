# Tarefas de Correção do Modal de Receitas

## Objetivo
Corrigir o problema de scroll quando o modal de receita abre - o ecrã fica "bloqueado" e não permite scroll até ao fundo.

## Tarefas

- [x] Editar plan.html - Adicionar gestão de scroll no body quando modal abre/fecha
- [x] Editar recipes-catalog.html - Adicionar gestão de scroll no body quando modal abre/fecha

## Detalhes da Correção

A correção consiste em:
1. Adicionar `document.body.style.overflow = 'hidden'` quando o modal abre
2. Remover `document.body.style.overflow = ''` quando o modal fecha

Isto vai garantir que o utilizador só pode fazer scroll dentro do modal quando está aberto.

