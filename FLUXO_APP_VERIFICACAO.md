# 🔍 Verificação Completa do Fluxo da App NannyMeal

## ✅ Ficheiros HTML Existentes
```
✓ index.html                 (Login)
✓ onboarding.html           (Configuração de Perfil)
✓ dashboard.html            (Home/Estatísticas)
✓ plan.html                 (Visualizar Planos)
✓ recipes-catalog.html      (Catálogo de Receitas)
✓ create-custom-plan.html   (Criar Plano Customizado)
✓ grocery.html              (Lista de Compras)
✓ feedback.html             (Feedback de Refeições)
✓ swaps.html                (Trocar Refeições)
✓ add-recipe.html           (Adicionar Receita)
```

## 🔗 Fluxo de Navegação Principal

### 1. LOGIN FLOW
```
index.html → [Autenticação] → onboarding.html (primeira vez)
          ↓
      dashboard.html (utilizadores existentes)
```

**Verificações:**
- ✅ Firebase Auth configurada
- ✅ Verificação de utilizador em tempo real com `onAuthStateChanged()`
- ✅ Redirecionamento automático

---

### 2. PRIMEIRA UTILIZAÇÃO (Onboarding)
```
onboarding.html
├─ Configuração de Perfil (dieta, alergias, etc)
├─ Guardar em `households` collection
└─ Gerar plano automático
    → plan.html
```

**Verificações:**
- ✅ Função: `createHousehold()`
- ✅ Função: `generateWeeklyPlan()`
- ✅ Redirecionamento para plan.html após login bem-sucedido

---

### 3. DASHBOARD (Home)
```
dashboard.html
├─ 📊 Estatísticas (Poupanças, Desperdício)
├─ 🎯 Quick Actions:
│  ├─ "Novo Plano" → create-custom-plan.html
│  └─ "Receitas" → recipes-catalog.html
├─ Barra de Navegação (5 abas)
└─ Link Sync (Enriquecer Receitas)
```

**Verificações:**
- ✅ Links corretos para create-custom-plan.html
- ✅ Links corretos para recipes-catalog.html
- ✅ Função: `getHouseholdStats()` importada
- ✅ Função: `enrichAllRecipes()` importada

---

### 4. CATÁLOGO DE RECEITAS
```
recipes-catalog.html
├─ 🔍 Pesquisa por nome
├─ 🏷️ Filtros (Rápidas, Vegetarianas, Kid-Friendly)
├─ 📋 Grid de receitas
├─ 📱 Clique na receita
│  └─ Modal com detalhes
│     └─ Botão "Adicionar ao Plano"
│        → create-custom-plan.html?addRecipe=[ID]
└─ Navegação de volta: Setas (4 abas)
```

**Verificações:**
- ✅ Função: `getAllRecipes()` importada e funcionando
- ✅ Links de navegação corretos (dashboard, plan, grocery, onboarding)
- ✅ ❌ CORRIGIDO: Link anterior apontava para `recipe-catalog.html` → agora `recipes-catalog.html`

---

### 5. CRIAR PLANO CUSTOMIZADO
```
create-custom-plan.html
├─ Nome do Plano (input)
├─ Seleção de Refeições
│  ├─ Botão "Adicionar Refeição"
│  │  └─ Modal de seleção
│  │     └─ Clique na receita
│  │        → Adiciona à lista
│  └─ Visualização em tempo real:
│     ├─ Nº de refeições
│     ├─ Tempo médio de prep
│     ├─ Custo estimado
│     └─ Ingredientes agregados
├─ Botão "Criar Plano"
│  → Gera lista de compras automaticamente
│  → Redirecionamento para plan.html
└─ Voltar: Recipe-catalog.html

**Verificações:**
- ✅ Função: `getAllRecipes()` importada
- ✅ Função: `createCustomPlan()` importada
- ✅ ❌ CORRIGIDO: Importação de `getGroceryListAggregation` removida (não existe)
- ✅ Link de volta correto: `recipes-catalog.html`
```

---

### 6. VER PLANOS
```
plan.html
├─ Listar TODOS os planos do utilizador
│  ├─ Navegação entre planos (Anterior/Próximo)
│  └─ Cada plano mostra:
│     ├─ Nome do plano
│     ├─ 5-7 refeições
│     ├─ Botão "Feedback" (→ feedback.html)
│     └─ Botão "Trocar" (→ swaps.html?plan=[ID]&meal=[INDEX])
├─ Se não tem planos:
│  ├─ Botão "Gerar Automático" (generateWeeklyPlan)
│  └─ Botão "Criar Plano" (→ create-custom-plan.html)
└─ Navegação: 5 abas

**Verificações:**
- ✅ Função: `getAllPlans()` importada
- ✅ Função: `getPlanById()` importada
- ✅ ❌ CORRIGIDO: Importação de `deletePlan` removida (não usada)
- ✅ Suporte a múltiplos planos
```

---

### 7. LISTA DE COMPRAS
```
grocery.html
├─ Mostrar lista de compras do plano ativo
├─ Categorização automática:
│  ├─ Talho
│  ├─ Peixaria
│  ├─ Hortifrutis
│  ├─ Laticínios
│  ├─ Despensa
│  └─ Padaria
├─ Itens com checkbox
└─ Navegação: 5 abas (com receitas)

**Verificações:**
- ✅ Função: `getLastPlan()` importada
- ✅ Função: `generateGroceryListFromPlan()` importada
- ✅ Navegação incluí "Receitas"
```

---

### 8. TROCAR REFEIÇÃO
```
swaps.html?plan=[ID]&meal=[INDEX]
├─ Mostrar refeição atual (a substituir)
├─ ↓ Seta de transição ↓
├─ Mostrar refeição sugerida
├─ Explicação da lógica
└─ Botão "Confirmar Troca"
   ├─ Função: `swapMealImproved()`
   ├─ Regenera lista de compras
   └─ Redirecionamento para plan.html

**Verificações:**
- ✅ Função: `swapMealImproved()` importada
- ✅ Função: `getPlanById()` importada
- ✅ Função: `getMealRecommendations()` importada
- ✅ ❌ CORRIGIDO: Importação de `getRecipe` removida (não usada)
- ✅ Suporte a parâmetros de URL (plan, meal)
```

---

### 9. FEEDBACK
```
feedback.html?meal=[INDEX]
├─ Avaliar a refeição
├─ Perguntas:
│  ├─ "Gostaram as crianças?"
│  ├─ "Nível de desperdício?"
│  └─ "Dificuldade de preparação?"
└─ Guardar feedback
   → Volta a plan.html

**Verificações:**
- ✅ Função: `submitMealFeedback()` importada
- ✅ Função: `getLastPlan()` importada
```

---

## 📱 Barra de Navegação (5 Abas)

Presente em **TODAS** as páginas autenticadas:
```
┌─────────────────────────────────────┐
│ HOME | PLANO | LISTA | RECEITAS | PERFIL │
└─────────────────────────────────────┘
```

**Verificações por página:**

| Página          | HOME  | PLANO | LISTA | RECEITAS | PERFIL |
| --------------- | :---: | :---: | :---: | :------: | :----: |
| dashboard       |   ✅   |   🔗   |   🔗   |    🔗     |   🔗    |
| plan            |   🔗   |   ✅   |   🔗   |    🔗     |   🔗    |
| grocery         |   🔗   |   🔗   |   ✅   |    🔗     |   🔗    |
| recipes-catalog |   🔗   |   🔗   |   🔗   |    ✅     |   🔗    |
| onboarding      |   🔗   |   🔗   |   🔗   |    🔗     |   ✅    |

Legenda:
- ✅ = Página atual (destacada)
- 🔗 = Link de navegação
- Verificar em **dashboard.html**, **plan.html**, **grocery.html**, **recipes-catalog.html**

---

## 🔧 Correções Realizadas

### 1. ❌ TYPO EM create-custom-plan.html
- **Problema**: Link apontava para `recipe-catalog.html` (sem "s")
- **Ficheiro real**: `recipes-catalog.html` (com "s")
- **Status**: ✅ CORRIGIDO
- **Linha**: 32

### 2. ❌ IMPORTAÇÃO DESNECESSÁRIA EM create-custom-plan.html
- **Problema**: Importação de `getGroceryListAggregation` que não existe
- **Status**: ✅ REMOVIDA
- **Linha**: 214

### 3. ❌ IMPORTAÇÃO DESNECESSÁRIA EM plan.html
- **Problema**: Importação de `deletePlan` que não é usada
- **Status**: ✅ REMOVIDA
- **Linha**: 203

### 4. ❌ IMPORTAÇÃO DESNECESSÁRIA EM swaps.html
- **Problema**: Importação de `getRecipe` que não é usada
- **Status**: ✅ REMOVIDA
- **Linha**: 284

---

## 🎯 CSP Error (Content Security Policy)

O erro mostrado:
```
Connecting to 'http://127.0.0.1:5500/.well-known/appspecific/com.chrome.devtools.json' 
violates CSP directive...
```

**Causa**: Chrome DevTools tentando conectar-se a um recurso não permitido
**Severidade**: ⚠️ AVISO - Não afeta funcionamento da app
**Solução**: Ignorar - é apenas um aviso do navegador

---

## ✨ Resumo do Fluxo Corrigido

```
LOGIN
  ↓
[Novo Utilizador?]
  ├─ SIM → onboarding → gerar plano automático
  └─ NÃO → dashboard
         ↓
     [Escolha]
      ├─ Ver Planos → plan.html
      ├─ Ver Receitas → recipes-catalog.html
      │               ├─ Ver Detalhes
      │               └─ Adicionar ao Plano → create-custom-plan.html
      ├─ Criar Plano Customizado → create-custom-plan.html
      ├─ Ver Lista de Compras → grocery.html
      └─ Perfil → onboarding.html
```

---

## ✅ STATUS FINAL

- ✅ Todos os ficheiros HTML existem
- ✅ Todos os links de navegação são corretos
- ✅ Todas as funções importadas existem em db.js
- ✅ Importações desnecessárias removidas
- ✅ Typo em recipe-catalog.html corrigido
- ✅ CSP warning é normal (não afeta funcionamento)
- ✅ App está pronta para uso!

---

**Data**: 6 de Março de 2026
**Versão**: V21
**Status**: ✅ VERIFICADO E CORRIGIDO
