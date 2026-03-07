# 🍼 NannyMeal PWA

NannyMeal is a **Smart Meal Planner PWA** designed for busy families. It automates the "What's for dinner?" headache by combining personalized algorithms with real-world data from global food APIs.

---

## 🌟 Funcionalidades Atuais

### 1. **Inteligência de Planeamento**
- **Algoritmo Adaptativo**: Sugere refeições baseadas no perfil da família (adultos/crianças), tempo disponível e nível de cozinha.
- **Auto-Discovery (Spoonacular)**: Se não houver receitas locais suficientes para a sua dieta (ex: Vegan), a app procura e importa automaticamente novas opções da API Spoonacular.
- **Smart Swaps**: Troca qualquer refeição por uma alternativa sugerida pelo algoritmo que respeite as tuas restrições.

### 2. **Gestão de Compras (Grocery Intelligence)**
- **Agregação Inteligente**: Soma quantidades automaticamente (ex: 200g + 300g = 500g) e agrupa por categorias de supermercado (Talho, Hortifrutis, Laticínios).
- **Estimativa de Custos**: Calcula o custo total aproximado da ida ao supermercado com base em preços reais da Spoonacular.
- **Scanner de Alergénios (Open Food Facts)**: Permite simular o scan de um código de barras para verificar se um produto no supermercado é seguro para a tua família.

### 3. **Perfil & Feedback**
- **Onboarding 4 Passos**: Configuração completa de alergias (Glúten, Lactose, etc.), estilo alimentar e agenda semanal.
- **Loop de Feedback**: Avalia se as crianças gostaram ou se houve desperdício. O algoritmo aprende e ajusta as futuras recomendações.

### 4. **Tecnologia & Segurança**
- **PWA Ready**: Instala no telemóvel e usa como uma app nativa.
- **Firebase Backend**: Autenticação segura e base de dados em tempo real (Firestore).
- **Protected Config**: Chaves de API devem agora ser definidas apenas nas Cloud Functions (ex.: `firebase functions:config:set spoonacular.key="<KEY>"` ou usando variáveis de ambiente no ambiente de build). O frontend não contém mais a chave, todas as requisições passam por um proxy (`spoonacularProxy`).

### Arquitetura Atualizada
A arquitetura da app foi reorganizada em três camadas:

1. **API Control Layer** _(Firebase Cloud Functions)_
   - Todas as chamadas à Spoonacular só podem ser feitas por `spoonacularProxy`.
   - O endereço `/spoonacularProxy` valida se `request.auth.token.email == "antonioappleton@gmail.com"`.
   - Funções como `enrichAllRecipes` e ações de pesquisa são executadas aqui para proteger a chave e gerir limites.

2. **Base de Dados** _(Firestore)_
   - Coleção `recipes` global que apenas o administrador pode escrever.
   - Nova coleção `userRecipes` para receitas pessoais, com campos customizáveis.
   - Regras documentadas no arquivo `firebase/firestore.rules`.

3. **Camada de Aplicação (Frontend)**
   - O frontend chama funções Cloud em vez de chamar Spoonacular diretamente.
   - A biblioteca `spoonacular.js` agora usa `httpsCallable` para aceder ao proxy.
   - Há páginas novas/alteradas (`my-recipes.html`, botões de guardar receita, etc.) para suportar receitas pessoais.

Essa reorganização garante segurança da API, controlo dos limites diários, e permite que apenas o administrador possa enriquecer ou importar receitas.

---

## 🛠️ Stack Tecnológica

- **Frontend**: HTML5, Vanilla JavaScript (ES Modules), Tailwind CSS.
- **Backend/Hosting**: Firebase (Auth, Firestore, Cloud Functions).
- **APIs Externas**: 
  - [Spoonacular](https://spoonacular.com/food-api) (Receitas, Preços, Nutrição).
  - [Open Food Facts](https://world.openfoodfacts.org/) (Informação de produtos & Alergénios).

---

## � Próximos Passos (Roadmap)

- [ ] **Integração com Continente/Pingo Doce**: Carrinho de compras direto nos supermercados locais.
- [ ] **NannyBot AI**: Chatbot para ajudar a substituir ingredientes em tempo real (ex: "Não tenho ovos, o que uso?").
- [ ] **Modo Offline**: Sincronização avançada para usar a lista de compras sem internet dentro do supermercado.
- [ ] **Gamificação**: Medalhas por redução de desperdício e poupança mensal.

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
