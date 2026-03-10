# 🔍 Análise do Erro de Autenticação

## Erro Encontrado

```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAXYDmdlxSvPMHdazuQzJ29QB-hlb1rMOY 400 (Bad Request)

FirebaseError: Firebase: Error (auth/invalid-credential)
```

## O que está a acontecer

O erro `auth/invalid-credential` (código HTTP 400) indica que:
1. O pedido está a chegar ao servidor do Firebase Authentication
2. O servidor está a rejeitar as credenciais fornecidas

## Causas Possíveis

| #   | Causa                                                                                   | Probabilidade | Sintomas                                        |
| --- | --------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------- |
| 1   | **Provider mismatch** - Utilizador criado com Google mas tenta login com email/password | **Alta**      | Email/password não funciona                     |
| 2   | **Email/Password não ativado** no Firebase Console                                      | Alta          | Sempre dá erro ao fazer login/registo com email |
| 3   | **Credenciais incorretas**                                                              | Média         | Password errada                                 |
| 4   | **Restrições na API Key**                                                               | Baixa         | API Key pode estar restringida                  |

---

## ❓ O problema é ser utilizador E administrador?

**NÃO!** Isso não é o problema.

O facto de um email ser usado como administrador nas **regras do Firestore** (`antonioappleton@gmail.com` em `firestore.rules`) **NÃO afecta a autenticação**. O Firebase Authentication e o Firestore são serviços separados.

O que PODE acontecer:
- O utilizador **`antonioappleton@gmail.com` foi criado com login Google** (provider "Google")
- Mas agora tentas fazer login com **email/password**
- Isto causa o erro `auth/invalid-credential` porque as credenciais não correspondem ao método original

---

## 🔧 Passos para Resolver

### PASSO 1: Verificar se Email/Password está ATIVADO

1. Vai ao **Firebase Console**: https://console.firebase.google.com/project/nannymeal-d966b/authentication/providers

2. Encontra o provider **"Email/Password"**

3. Confirma que está **ATIVADO** (Enabled)
   - Se estiver Desativado, clica em/ataca em "Enable"
   - **NÃO ESQUECER DE CLICAR EM "Save"**

### PASSO 2: Verificar se o utilizador existe

No Firebase Console → **Authentication** → **Users**

- Verifica o **Provider** do teu utilizador:
  - Se mostra **"Google"** → Tens de fazer login com Google
  - Se mostra **"Email/Password"** → Podes fazer login com email/password

### PASSO 3: Testar com novo utilizador

1. Na app, clica em **"Registe-se grátis"**
2. Cria uma conta nova com email/password diferente
3. Se conseguir criar conta → o problema eram as credenciais antigas

### PASSO 4: Verificar restrições da API Key (se ainda falhar)

1. Vai ao **Google Cloud Console**: https://console.cloud.google.com/apis/credentials

2. Encontra a API Key: `AIzaSyAXYDmdlxSvPMHdazuQzJ29QB-hlb1rMOY`

3. Verifica em **"Application restrictions"**:
   - Deve estar como **"None"** ou incluir **"HTTP referrers"** do teu domínio
   - Se estiver restringida a apps específicos, pode bloquear a autenticação

---

## ✅ Código da App (Verificado - está correto)

O código em `app/public/src/auth.js` e `firebase-init.js` está correto:
- Usa Firebase SDK v11.3.1
- Configuração da API está correta
- Métodos de autenticação estão a ser chamados corretamente

---

## 📝 Resumo para Verificação Rápida

```
1. Firebase Console → Authentication → Providers → Email/Password → ENABLE
2. Firebase Console → Authentication → Users → Verificar provider do utilizador
3. Se provider é Google → Login com Google button
4. Se provider é Email/Password → Testar registo novo
```

---

**Data**: 6 de Março 2026

