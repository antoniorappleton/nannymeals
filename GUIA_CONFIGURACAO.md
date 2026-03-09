# 🔧 Guia de Configuração - NannyMeal

## Problema Atual
O login está a falhar com erro 400 (Bad Request) porque:
1. As Cloud Functions precisam de ser deployed
2. A API Key da Spoonacular precisa de ser configurada

---

## Passo 1: Obter API Key da Spoonacular

1. Vai a: **https://spoonacular.com/food-api**
2. Cria uma conta gratuita (tem 150 chamadas/dia gratuitas)
3. Vai ao Dashboard → API Settings
4. Copia a tua **API Key**

---

## Passo 2: Configurar a API Key no Firebase

Executa este comando no terminal (precisas ter o Firebase CLI instalado):

```bash
firebase functions:config:set spoonacular.key="A_TUA_API_KEY_AQUI"
```

Exemplo:
```bash
firebase functions:config:set spoonacular.key="abc123xyz789..."
```

---

## Passo 3: Deploy das Cloud Functions

Executa:

```bash
cd firebase/functions
npm run build
firebase deploy --only functions
```

---

## Passo 4: Importar Receitas Iniciais

1. Faz login em `admin-import.html` (ou vai ao dashboard)
2. Se fores admin (antonioappleton@gmail.com), clica no botão de sincronização
3. Isso vai importar receitas da Spoonacular

---

## Alternativa: Receitas Locais (Sem API Externa)

Se não quiseres configurar a Spoonacular, podes adicionar receitas manualmente:

1. Vai a `app/public/add-recipe.html`
2. Cria as tuas próprias receitas
3. Estas ficam disponíveis para o gerador de planos

---

## Verificar se está a funcionar

Depois de configurares, testa:
1. Faz logout e login novamente
2. Vai ao dashboard
3. Clica em "Gerar Plano Automático"
4. Devem aparecer refeições

---

## Erros Comuns

| Erro | Solução |
|------|---------|
| 400 Bad Request no login | Verifica as credenciais Firebase Auth |
| "Spoonacular key not configured" | Executa `firebase functions:config:set spoonacular.key=...` |
| npm ci failed | Já corrigido - pacote atualizado |
| TypeScript build error | Já corrigido - tsconfig.json atualizado |

---

**Data**: 6 de Março de 2026

