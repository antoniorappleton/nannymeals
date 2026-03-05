import { auth, doc, getDoc } from "./firebase-init.js";
import { syncUserProfile, getUserProfile, checkHouseholdExists } from "./db.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

/**
 * Lógica de Autenticação Centralizada (Refatorada)
 */

console.log("Módulo de autenticação ativo. [V18]");

// Helper para evitar redirecionamentos redundantes e loops
const safeReplace = (url) => {
  const currentPath = window.location.pathname;
  
  // Se já estamos na página alvo, não fazemos nada
  if (currentPath.endsWith(url) || (url === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')))) {
    return;
  }
  
  console.log(`Encaminhando: ${currentPath} -> ${url}`);
  window.location.replace(url);
};

// Capturar erros globais para diagnóstico
window.onerror = function(message, source, lineno, colno, error) {
  if (source && source.includes(window.location.hostname)) {
    showError(`Erro: ${message}`);
  }
  return false;
};

const showError = (message) => {
  const container = document.getElementById("auth-error");
  if (container) {
    container.textContent = message;
    container.classList.remove("hidden");
  } else {
    alert(message);
  }
};

// Estado do redirect do Google
let isCheckingRedirect = true;

if (window.setGoogleLoading) window.setGoogleLoading(true);

setPersistence(auth, browserLocalPersistence)
  .then(() => getRedirectResult(auth))
  .then((result) => {
    isCheckingRedirect = false;
    if (window.setGoogleLoading) window.setGoogleLoading(false);
    if (result) console.log("Login Google sucesso:", result.user.email);
  })
  .catch((error) => {
    isCheckingRedirect = false;
    if (window.setGoogleLoading) window.setGoogleLoading(false);
    showError("Erro no login: " + error.message);
  });

// Handler do Formulário
const authForm = document.getElementById("auth-form");
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const isLogin = window.isLoginMode !== false;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const confirm = document.getElementById("confirm-password").value;
        if (password !== confirm) throw new Error("As passwords não coincidem.");
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      showError(error.message);
    }
  });

  const googleBtn = document.getElementById("btn-google");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      if (window.setGoogleLoading) window.setGoogleLoading(true);
      signInWithRedirect(auth, new GoogleAuthProvider());
    });
  }
}

// Recuperação de Password
export const resetPassword = async (email) => {
  if (!email) throw new Error("Email é obrigatório.");
  await sendPasswordResetEmail(auth, email);
};

// Observer de Estado
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname.toLowerCase();
  const isLoginPage = path === "/" || path.endsWith("index.html") || !!document.getElementById("auth-form");
  const isOnboardingPage = path.endsWith("onboarding.html");
  const isProtectedPage = path.endsWith("dashboard.html") || path.endsWith("plan.html") || path.endsWith("grocery.html");

  if (user) {
    try {
      await syncUserProfile(user);
      const profile = await getUserProfile(user.uid);
      let hid = profile ? profile.householdId : null;

      if (!hid) hid = await checkHouseholdExists(user.uid);

      if (hid) {
        // Se tem família e está no login/onboarding, vai para dashboard
        // Se tem família e está no login, vai para dashboard.
        // Removemos isOnboardingPage daqui para permitir edição de perfil.
        if (isLoginPage) {
          safeReplace("dashboard.html");
        }
      } else {
        // Se NÃO tem família e está numa página protegida, vai para onboarding
        if (isProtectedPage || isLoginPage) {
          safeReplace("onboarding.html");
        }
      }
    } catch (error) {
      console.error("Erro no fluxo auth:", error);
    }
  } else {
    // Se não há user e não estamos no login, expulsa
    if (!isCheckingRedirect && !isLoginPage && !isOnboardingPage && !path.includes("assets")) {
      safeReplace("index.html");
    }
  }
});

export const logout = async () => {
  await signOut(auth);
  safeReplace("index.html");
};

export const initAuth = () => console.log("Auth Init");
