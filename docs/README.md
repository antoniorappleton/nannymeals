# 🍼 NannyMeal PWA

NannyMeal is a **Smart Meal Planner PWA** designed for busy families. It automates the "What's for dinner?" headache by combining personalized algorithms with real-world data from global food APIs.

---

## 🌟 Funcionalidades Atuais

### 1. **Inteligência de Planeamento**
- **Algoritmo Adaptativo**: Sugere refeições baseadas no perfil da família (adultos/crianças), tempo disponível e nível de cozinha.
- **Sugestões da Despensa**: O algoritmo prioriza receitas com base nos ingredientes que já tens em stock (>60% match).
- **Importador Inteligente (Scraper)**: Substituímos a dependência de APIs externas por um sistema de scraping direto dos maiores supermercados portugueses (**Continente**, **Pingo Doce** e **Auchan**).
- **Smart Swaps**: Troca qualquer refeição por uma alternativa sugerida pelo algoritmo que respeite as tuas restrições.

### 2. **Gestão de Compras (Grocery Intelligence)**
- **Agregação Inteligente**: Soma quantidades automaticamente (ex: 200g + 300g = 500g) e agrupa por categorias de supermercado (Talho, Hortifrutis, Laticínios).
- **Estimativa de Custos Reais**: Calcula o custo total da lista de compras com base em preços reais consultados em tempo real nos sites do Continente, Pingo Doce e Auchan.
- **Scanner de Alergénios (Open Food Facts)**: Permite verificar se um produto no supermercado é seguro para a tua família através do código de barras.

### 3. **Perfil & Feedback**
- **Onboarding 4 Passos**: Configuração completa de alergias (Glúten, Lactose, etc.), estilo alimentar e agenda semanal.
- **Loop de Feedback**: Avalia se as crianças gostaram ou se houve desperdício. O algoritmo aprende e ajusta as futuras recomendações.

### 4. **Tecnologia & Segurança**
- **PWA Ready**: Instala no telemóvel e usa como uma app nativa.
- **Firebase Backend**: Autenticação segura e base de dados em tempo real (Firestore).
- **Protected Config**: Chaves de API devem agora ser definidas apenas nas Cloud Functions (ex.: `firebase functions:config:set spoonacular.key="<KEY>"` ou usando variáveis de ambiente no ambiente de build). O frontend não contém mais a chave, todas as requisições passam por um proxy (`spoonacularProxy`).

### Arquitetura Atualizada
A arquitetura da app foi reorganizada em três camadas:

1. **Scraper Service Layer** _(Firebase Cloud Functions)_
   - Substituição total da Spoonacular por extração direta via `importFromUrlHttp`.
   - O endpoint valida se `request.auth.token.email == "antonioappleton@gmail.com"`.
   - Inclui lógica de normalização de ingredientes e matching de preços em tempo real.

2. **Base de Dados** _(Firestore)_
   - Coleção `recipes` global (Admin-only write).
   - Gestão de inventário na coleção `pantry` com sincronização automática para a `groceryList`.
   - Regras de segurança rigorosas em `firebase/firestore.rules`.
   - Nova coleção `userRecipes` para receitas pessoais, com campos customizáveis.
   - Regras documentadas no arquivo `firebase/firestore.rules`.

3. **Camada de Aplicação (Frontend)**
   - O frontend chama funções Cloud em vez de chamar Spoonacular diretamente.
   - A biblioteca `spoonacular.js` agora usa `httpsCallable` para aceder ao proxy.
   - Há páginas novas/alteradas (`my-recipes.html`, botões de guardar receita, etc.) para suportar receitas pessoais.

Essa reorganização garante segurança da API, controlo dos limites diários, e permite que apenas o administrador possa enriquecer ou importar receitas.

---

## � Guia Completo: Como Funciona a App

### 1. Fluxo de Funcionamento Geral

A NannyMeal segue este fluxo principal:

```
Utilizador autenticado
         ↓
  Perfil & Alergias
         ↓
  Seleciona estilo alimentar
         ↓
  App sugere receitas (base de dados local ou API)
         ↓
  Cria plano semanal
         ↓
  Gera lista de compras automática
         ↓
  Utilizador edita/personaliza
         ↓
  Marca itens como comprados
         ↓
  Submete feedback (gustou? desperdiçou?)
         ↓
  Algoritmo aprende e melhora próximas sugestões
```

---

## 🔌 Supermarket Scraper: Dados & Fluxo

### Como Funciona?

O sistema utiliza a Cloud Function `importFromUrlHttp` para processar URLs de receitas de supermercados portugueses.

#### A. Extração Inteligente
- **Continente Feed**: Captura automática de doses, tempo, ingredientes e passos.
- **Pingo Doce**: Extração estruturada de detalhes da receita e imagens.
- **Auchan**: Novo suporte para extração de receitas do site receitas.auchan.pt.

#### B. Matching de Preços
Para cada ingrediente extraído, o sistema realiza uma pesquisa heurística nos catálogos online:
1. Limpeza do nome do ingrediente (ex: "350g de arroz" -> "arroz").
2. Query ao motor de busca do supermercado escolhido.
3. Seleção do melhor preço para estimar o custo total da receita.

### Fluxo de Importação (Admin Only)

1. **Admin** cola o URL no ecrã de importação.
2. **Cloud Function** valida a identidade (`antonioappleton@gmail.com`).
3. **Scraper** obtém o HTML e converte para o formato NannyMeals.
4. **Calculadora** enriquece os ingredientes com preços locais.
5. **Firebase** guarda a nova receita na coleção `recipes`.

---

## 💾 Armazenamento Firestore

### Estrutura de Coleções

#### A. **recipes** (Global, Read-Only para Utilizadores)
```
collection("recipes")
├── doc("recipe-1")
│   ├── name: "Pasta Carbonara"
│   ├── ingredients: ["pasta", "ovos", "bacon", ...]
│   ├── instructions: "Ferva a pasta..."
│   ├── prepTime: 30  (minutos)
│   ├── calories: 450
│   ├── pricePerServing: 2.50€
│   ├── tags: ["pasta", "Italian", "quick"]
│   ├── createdBy: "admin"
│   ├── spoonacularId: 123456
│   └── spoonacularSource: "https://spoonacular.com/..."
│
└── doc("recipe-2")
    └── ...
```

**Regra de Acesso:**
```firestore
match /recipes/{recipeId} {
  allow read: if request.auth != null;      // todos autenticados leem
  allow write: if request.auth.token.email == "antonioappleton@gmail.com";  // só admin escreve
}
```

#### B. **userRecipes** (Receitas Personalizadas por Utilizador)
```
collection("userRecipes")
├── doc("user-recipe-1")
│   ├── userId: "uid-do-utilizador"
│   ├── recipeId: "recipe-1"  (referência à receita global)
│   ├── customName: "Carbonara da Mãe"
│   ├── customIngredients: ["500g pasta", "broa de ovos", ...]
│   ├── customInstructions: "Uso azeite em vez de bacon..."
│   ├── notes: "Adoram! Pedir segunda vez."
│   └── createdAt: timestamp
│
└── doc("user-recipe-2")
    └── ...
```

**Regra de Acesso:**
```firestore
match /userRecipes/{docId} {
  allow read, create, update, delete:
    if request.auth != null &&
       request.auth.uid == resource.data.userId;  // cada utilizador só acede às suas
}
```

#### C. **weeklyPlans** (Planos Semanais por Família)
```
collection("weeklyPlans")
└── doc("plan-1")
    ├── householdId: "household-1"  (referência à família)
    ├── createdAt: timestamp
    ├── expiresAt: timestamp  (30 dias depois de criado)
    ├── locked: false  (se true, não é eliminado automaticamente)
    ├── status: "active"
    ├── meals: [
    │   {
    │     recipeId: "recipe-1",
    │     recipeName: "Pasta Carbonara",
    │     prepTime: 30,
    │     completed: false,
    │     ingredients: [...],
    │     calories: 450,
    │     pricePerServing: 2.50
    │   },
    │   {...}
    │ ]
    ├── groceryList: [
    │   {
    │     category: "Talho",
    │     items: [
    │       { name: "Bacon", quantity: "200g", checked: false },
    │       { name: "Ovos", quantity: "6 unid.", checked: false }
    │     ]
    │   },
    │   {...}
    │ ]
    └── totalEstimatedCost: 45.90
```

**Regra de Acesso:**
```firestore
match /weeklyPlans/{planId} {
  allow read, update: if request.auth != null &&
    get(/databases/$(database)/documents/households/$(resource.data.householdId))
      .data.ownerUid == request.auth.uid;  // utilizador é dono da família
  allow delete: if false;  // deletado só por função automática
}
```

#### D. **households** (Famílias/Contas)
```
collection("households")
└── doc("household-1")
    ├── ownerUid: "uid-do-proprietario"
    ├── displayName: "Família Silva"
    ├── dietaryPreferences: ["Vegetariano"]
    ├── allergies: ["Glúten", "Lactose"]
    ├── cookingTimeWeekday: 45  (minutos máx por dia)
    ├── dinnersPerWeek: 5
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

#### E. **users** (Perfis Utilizadores)
```
collection("users")
└── doc("uid-do-utilizador")
    ├── uid: "..."
    ├── email: "user@example.com"
    ├── displayName: "João Silva"
    ├── photoURL: "https://..."
    ├── householdId: "household-1"
    └── lastLogin: timestamp
```

#### F. **feedback** (Avaliações de Refeições)
```
collection("feedback")
└── doc("feedback-1")
    ├── planId: "plan-1"
    ├── mealIndex: 0
    ├── recipeId: "recipe-1"
    ├── rating: 5  (1-5)
    ├── kidsEatenPct: 100  (0-100%)
    ├── wasteLevel: 1  (1-3: pouco/médio/muito)
    ├── actualTimeOver: false
    ├── stress: 2  (1-5)
    └── timestamp: serverTimestamp
```

---

## 👥 Como os Utilizadores Acedem aos Dados

### Fluxo de Leitura (User Perspective)

#### 1. **Listar Receitas Globais**
```javascript
// Frontend (recipes-catalog.html)
const allRecipes = await getAllRecipes(userId);
// Retorna: receitas globais + versões personalizadas do utilizador
```

**O que acontece:**
- `db.js` lê de `collection("recipes")`
- Se user ID foi passado, também lê de `collection("userRecipes").where("userId", "==", userId)`
- Une os dois conjuntos no cliente

#### 2. **Ver Receitas Pessoais**
```javascript
// Frontend (my-recipes.html)
const myRecipes = await getUserRecipes(userId);
// Retorna: array com customName, customIngredients, notes, etc.
```

**O que acontece:**
- Firestore valida: `request.auth.uid == userId`
- Retorna apenas documentos onde `userId` corresponde ao utilizador autenticado

#### 3. **Criar Novo Plano Semanal**
```javascript
// Frontend (plan.html ou create-custom-plan.html)
const plan = await generateWeeklyPlan(userId);
// ou
const customPlan = await createCustomPlan(userId, planData);
```

**O que acontece:**
- Busca a família do utilizador: `getHousehold(userId)`
- Chama `getMealRecommendations(householdId, count)` com filtros (dieta, alergias, tempo)
- Se não houver receitas locais suficientes, a função **não** chama a API diretamente
  - Avisa que apenas o admin pode importar receitas
  - Usa as receitas locais que existem
- Cria documento em `weeklyPlans` com `householdId, expiresAt (now + 30 dias), locked: false`
- Chama `generateGroceryListFromPlan()` para criar lista de compras
- Retorna plan ID

#### 4. **Ver Lista de Compras**
```javascript
// Frontend (grocery.html)
const plan = await getLastPlan(userId);
const groceryList = plan.groceryList;
// Já está pré-gerada e salva no documento weeklyPlans
```

**O que acontece:**
- Busca o último plano onde `householdId` = household do utilizador
- Firestore valida a permissão automaticamente
- Retorna a `groceryList` já formatada (categorias, quantidades, preços)

#### 5. **Guardar Receita Pessoal**
```javascript
// Frontend (recipes-catalog.html - botão "Guardar na Minha Cozinha")
await saveUserRecipe(userId, recipeId);
```

**O que acontece:**
- Cria novo doc em `userRecipes` com:
  - `userId: request.auth.uid`
  - `recipeId: global-recipe-id`
  - `customName, customIngredients, notes`
- Firestore valida que `userId == request.auth.uid`
- Próxima vez que chama `getAllRecipes(userId)`, receita aparece com dados customizados

#### 6. **Submeter Feedback**
```javascript
// Frontend (plan.html - após completar refeição)
await submitMealFeedback(planId, mealIndex, feedbackData);
```

**O que acontece:**
- Atualiza `weeklyPlans/{planId}/meals[mealIndex].feedback`
- Cria entrada em `collection("feedback")` para análise histórica
- Backend job `onFeedbackWrite` ajusta pesos no algoritmo adaptativo

---

## 🔄 Sincronização & Fluxo de Dados

### Exemplo Completo: Do API ao Utilizador

**Cenário:** Admin quer enriquecer receita com dados da Spoonacular

```
1. ADMIN acessa dashboard.html
   └─ Clica botão "Enriquecer Receitas" (só aparece se email == admin)

2. Frontend chama:
   enrichAllRecipes() (de db.js)
   └─ Chama httpsCallable(functions, "enrichAllRecipes")

3. Cloud Function `enrichAllRecipes` executa:
   └─ IF request.auth.token.email != "antonioappleton@gmail.com" THEN throw
   └─ LOOP através de todos os docs em "recipes"
   └─ Para cada receita sem calories ou pricePerServing:
      ├─ Chama fetchSpoonacular() com API key privada
      ├─ Recebe: { calories, protein, pricePerServing, ... }
      ├─ Atualiza doc em Firestore com: updateDoc(rDoc.ref, enriched)
      └─ Aguarda 500ms entre chamadas (respeitar API rate limits)
   └─ Retorna count de receitas atualizadas

4. Frontend recebe resposta:
   └─ alert("47 receitas enriquecidas!")
   └─ location.reload() para carregar dados novos

5. UTILIZADOR normal acessa recipes-catalog.html
   └─ Chama getAllRecipes(userId)
   └─ Recebe pelo Firestore rules (apenas leitura):
      ├─ Documentos de "recipes" (agora com calories, preço)
      └─ Documentos de "userRecipes" do utilizador (personalizações)
   └─ UI mostra receitas com calorias, preço, tempo
```

---

## 🔐 Acesso Administrativo

O acesso às ferramentas de gestão de receitas e migração de sistema é restrito ao administrador principal.

### Como aceder?
1. Faça login na aplicação usando a conta Google: **antonioappleton@gmail.com**.
2. No menu de navegação lateral (ou nas definições de perfil), clique em **Admin Import**.
3. Apenas esta conta tem permissões para:
   - Utilizar o **Importador Inteligente** via URL.
   - Executar scripts de **Migração de Dados**.
   - Atualizar a coleção global de receitas.

---

## 🛠️ Tecnologias Principais

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS.
- **Backend/Hosting**: Firebase (Auth, Firestore, Cloud Functions).
- **APIs Externas**: 
  - [Spoonacular](https://spoonacular.com/food-api) (Receitas, Preços, Nutrição).
  - [Open Food Facts](https://world.openfoodfacts.org/) (Informação de produtos & Alergénios).

---

## � Próximos Passos (Roadmap)

- [x] **Integração com Continente/Pingo Doce/Auchan**: Web scraping de receitas e preços reais.
- [ ] **NannyBot AI**: Chatbot para ajudar a substituir ingredientes em tempo real.
- [ ] **Modo Offline**: Sincronização avançada para usar a lista de compras sem internet.
- [ ] **Gamificação**: Medalhas por redução de desperdício.

---

## 📦 Instalação para Programadores

1. **Clonar e Configurar**:
   ```bash
   git clone https://github.com/antoniorappleton/nannymeals.git
   cd nannymeals
   ```

2. **Configurar API Keys**:
   - Não é mais necessário copiar `config.template.js` para `config.js` a menos que precise de variáveis próprias; a API Spoonacular é chamada exclusivamente de dentro de funções Cloud.
   - Adiciona a tua `SPOONACULAR_API_KEY`.

3. **Deploy**:
   ```bash
   firebase deploy
   ```

---
*Desenvolvido por antonioappleton@gmail.com para transformar a rotina alimentar das famílias.*
