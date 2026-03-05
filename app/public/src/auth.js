import { auth } from "./firebase-init.js";
import { syncUserProfile, getHousehold, getUserProfile, checkHouseholdExists } from "./db.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";

/**
 * Lógica de Autenticação Centralizada
 */

console.log("Módulo de autenticação ativo. Host:", window.location.hostname, "Versão: [GLOBAL-AUTH-V6.0]");
console.log("Estado do Browser - Cookies:", window.navigator.cookieEnabled, "| IndexedDB:", !!window.indexedDB);

// Capturar erros globais para diagnóstico na UI (útil para telemóveis)
window.onerror = function(message, source, lineno, colno, error) {
  const errorMsg = `Erro Crítico: ${message} em ${source}:${lineno}`;
  console.error(errorMsg);
  // Apenas mostrar erros que venham do nosso domínio
  if (source && source.includes(window.location.hostname)) {
    showError(errorMsg);
  }
  return false;
};

// Estado para evitar loops durante o processamento do redirect
let isCheckingRedirect = true;

// Função auxiliar para mostrar erros na UI
const showError = (message) => {
  const errorContainer = document.getElementById("auth-error");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    console.warn("UI de erro não encontrada, usando fallback alert:", message);
    // Evitar alerts repetitivos em loops
    if (!window._alertTimeout) {
      alert(message);
      window._alertTimeout = setTimeout(() => window._alertTimeout = null, 3000);
    }
  }
};

// Mostrar loading inicial se estivermos no ecrã de login
if (window.setGoogleLoading) window.setGoogleLoading(true);

// Configurar persistência local explícita ANTES de verificar o redirect
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistência configurada: LOCAL");
    
    // Lidar com o resultado do redirecionamento
    return getRedirectResult(auth);
  })
  .then((result) => {
    isCheckingRedirect = false;
    if (window.setGoogleLoading) window.setGoogleLoading(false);

    if (result) {
      console.log("Login por redirecionamento bem-sucedido para:", result.user.email);
    } else {
      console.log("Nenhum resultado de redirecionamento detectado.");
    }
  })
  .catch((error) => {
    isCheckingRedirect = false;
    if (window.setGoogleLoading) window.setGoogleLoading(false);
    console.error("Erro no arranque/redirect:", error.code, error.message);
    if (error.code === "auth/unauthorized-domain") {
       showError("ERRO DE DOMÍNIO: O domínio '" + window.location.hostname + "' não está autorizado no Firebase Console.");
    } else if (error.code !== "auth/credential-already-in-use") {
       showError("Erro ao finalizar login: " + error.message);
    }
  });

// Elementos da UI de Login/Registo
const authForm = document.getElementById("auth-form");
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password") ? document.getElementById("confirm-password").value : null;
    const isLogin = window.isLoginMode !== false;

    const errorContainer = document.getElementById("auth-error");
    if (errorContainer) errorContainer.classList.add("hidden");

    try {
      if (isLogin) {
        console.log("A iniciar sessão...");
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        console.log("A criar conta...");
        if (password !== confirmPassword) {
          throw new Error("As palavras-passe não coincidem.");
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Erro na autenticação:", error.code, error.message);
      let msg = error.message;
      if (error.code === "auth/email-already-in-use") msg = "Este email já está registado.";
      if (error.code === "auth/wrong-password") msg = "Palavra-passe incorreta.";
      if (error.code === "auth/user-not-found") msg = "Utilizador não encontrado.";
      if (error.code === "auth/weak-password") msg = "A palavra-passe deve ter pelo menos 6 caracteres.";
      showError(msg);
    }
  });

  const googleBtn = document.getElementById("btn-google");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        console.log("A iniciar redirect do Google...");
        if (window.setGoogleLoading) window.setGoogleLoading(true);
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Erro Google Login:", error.message);
        if (window.setGoogleLoading) window.setGoogleLoading(false);
        showError("Erro no login Google: " + error.message);
      }
    });
  }
}

// Observador do Estado da Sessão
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;
  const hasAuthForm = !!document.getElementById("auth-form");
  const isLoginPage = path === "/" || path.endsWith("index.html") || path === "" || path.endsWith("/") || hasAuthForm;
  
  const isOnboardingPage = path.endsWith("onboarding.html");
  const isDashboardPage = path.endsWith("dashboard.html");

  console.log("--- Diagnóstico Auth ---");
  console.log("Path:", path, "| User:", user ? user.email : "Nenhum", "| isCheckingRedirect:", isCheckingRedirect);

  if (user) {
    try {
      // 1. Sincronizar e esperar pelo perfil
      console.log("A sincronizar perfil...");
      await syncUserProfile(user);
      
      let userData = await getUserProfile(user.uid);
      let householdId = userData ? userData.householdId : null;

      // 2. FALLBACK: Se o perfil não tem ID, verificar diretamente na coleção
      if (!householdId) {
        console.log("Verificando fallback direto em households...");
        householdId = await checkHouseholdExists(user.uid);
      }

      console.log("Resumo da Sessão - HouseholdId:", householdId || "Nenhum");

      // 3. Lógica de Redirecionamento Defensiva
      if (householdId) {
        if (!isDashboardPage && !path.includes("plan") && !path.includes("grocery")) {
          console.log("Usuário com família encontrado -> Dashboard");
          location.replace("dashboard.html");
        }
      } 
      else {
        console.log("Sem household detectado.");
        if (!isOnboardingPage && !isLoginPage) {
          console.log("Redirecionando para Onboarding...");
          location.replace("onboarding.html");
        }
      }
    } catch (error) {
      console.error("Erro crítico na gestão de sessão:", error);
    }
  } else {
    // IMPORTANTE: Só redirecionar se não estivermos a processar um resultado de redirect do Google
    if (!isCheckingRedirect && !isLoginPage && !isOnboardingPage && !path.includes("assets")) {
      console.log("Acesso não autorizado -> Redirect Login");
      location.replace("index.html");
    }
  }
});

/**
 * Função utilitária para Logout
 */
export const logout = async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro ao sair:", error);
  }
};

export const initAuth = () => {
  console.log("Módulo de autenticação inicializado.");
};
