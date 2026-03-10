# TODO - Lista de Compras com Preços Portugueses

## Requisitos
1. Lista de compras por utilizador (não por household)
2. Preços portugueses para cada item
3. Integração com apps de supermercados (Super Save, Auchan, Continente, Pingo Doce, Intermarché)

## Plano de Implementação

### Fase 1: Links para Apps de Supermercados (Opção 1)

#### 1.1 Modificar grocery.html
- Adicionar botões/links para cada supermercado
- Criar função para gerar links com ingredientes
- Cada supermercado tem o seu próprio scheme URL:
  - **Super Save**: `supersave://`
  - **Auchan**: `auchan://`
  - **Continente**: `continente://`
  - **Pingo Doce**: `pingodoce://`
  - **Intermarché**: `intermarche://`

#### 1.2 Estrutura de Links
- Links deep que abrem os apps com lista de produtos
- Fallback para web se app não estiver instalado

### Fase 2: Web Scraping de Preços (Opção 2)

#### 2.1 Criar módulo de scraping
- Criar arquivo `src/supermarket-prices.js`
- Implementar funções para buscar preços de cada supermercado
- Usar APIs ou scraping de sites públicos

#### 2.2 Fontes de Dados
- **Super Save API**: Buscar preços das lojas disponíveis
- **Web scraping**: Sites públicos dos supermercados
- **Cache local**: Armazenar preços para evitar requisições frequentes

#### 2.3 Integração com lista de compras
- Modificar `generateGroceryListFromPlan` para incluir preços
- Atualizar UI para mostrar preços por item

### Fase 3: Lista por Utilizador

#### 3.1 Modificar estrutura de dados
- Criar coleção `userGroceryLists` no Firestore
- Cada utilizador tem a sua própria lista
- Associar ao userId em vez de householdId

#### 3.2 Atualizar funções DB
- `createUserGroceryList(userId, planId)`
- `getUserGroceryList(userId)`
- `updateUserGroceryList(userId, items)`
- `deleteUserGroceryList(userId)`

---

## Notas Técnicas

### Deep Links para Supermercados

| Supermercado | Scheme URL | Parâmetros |
|-------------|------------|-------------|
| Super Save | `supersave://list?items=` | Lista de ingredientes |
| Auchan | `auchan://shopping-list?products=` | Lista de produtos |
| Continente | `continente://app/shopping-list?items=` | Lista de itens |
| Pingo Doce | `pingodoce://list?products=` | Lista de produtos |
| Intermarché | `intermarche://shopping-list?items=` | Lista de itens |

### Estrutura do documento userGroceryLists

```javascript
{
  id: "auto-generated-id",
  userId: "firebase-auth-uid",
  planId: "weeklyPlan-id",
  householdId: "household-id",
  items: [
    {
      name: "Tomate",
      quantity: "500 g",
      category: "Hortifrutis",
      checked: false,
      prices: {
        continente: 1.99,
        pingodoce: 2.19,
        auchan: 1.89,
        intermarche: 1.95,
        supersave: null
      },
      bestPrice: {
        store: "auchan",
        price: 1.89
      }
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```


- [ ] 2. Adicionar botões de supermercados em grocery.html
- [ ] 3. Criar módulo de web scraping (supermarket-prices.js)
- [ ] 4. Implementar busca de preços para cada supermercado
- [ ] 5. Integrar preços na lista de compras
- [ ] 6. Criar estrutura de dados por utilizador
