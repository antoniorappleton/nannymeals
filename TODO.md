# TODO - Melhorar Lista de Compras

## ✅ Completed

## 🔄 In Progress
- [ ] 1. Melhorar parsing de quantidades em db.js
- [ ] 2. Expandir base de preços portugueses em supermarket-links.js

## 📋 Pending
- [ ] 3. Integrar preços na generateGroceryListFromPlan
- [ ] 4. Melhorar UI de preços em grocery.html

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


- [x] 1. Analisar código existente
- [x] 2. Criar plano de implementação
- [x] 3. Obter confirmação do utilizador

