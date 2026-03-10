import { auth, db, doc, getDoc, setDoc } from "./firebase-init.js";
import { syncUserProfile, getUserProfile, checkHouseholdExists } from "./db.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut,
  linkWithPopup,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

/**
 * Lógica de Autenticação Centralizada (Refatorada)
 * Com suporte para linking de contas (Google + Email)
 */

console.log("Módulo de autenticação ativo. [V19]");

// Helper para evitar redirecionamentos redundantes e loops
const safeReplace = (url) => {
  const currentPath = window.location.pathname.toLowerCase();
  const cleanTarget = url.toLowerCase().replace(".html", "");

  // Check if we are already on the target page (supporting both with and without .html)
  if (
    currentPath.endsWith(`/${cleanTarget}.html`) ||
    currentPath.endsWith(`/${cleanTarget}`) ||
    currentPath === `/${cleanTarget}` ||
    (cleanTarget === "index" &&
      (currentPath === "/" || currentPath.endsWith("/")))
  ) {
    return;
  }

  console.log(`Encaminhando: ${currentPath} -> ${url}`);
  window.location.replace(url);
};

// Capturar erros globais para diagnóstico
window.onerror = function (message, source, lineno, colno, error) {
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
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const isLogin = window.isLoginMode !== false;

    // Validações locais
    if (!email || !email.includes("@")) {
      showError("Por favor, insira um email válido.");
      return;
    }
    if (!password || password.length < 6) {
      showError("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      console.log("A tentar autenticar:", email);
      console.log("Auth config:", auth.config);

      if (isLogin) {
        console.log("A fazer signInWithEmailAndPassword...");
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const confirm = document.getElementById("confirm-password").value;
        if (password !== confirm) {
          showError("As passwords não coincidem.");
          return;
        }
        if (password.length < 6) {
          showError("A password deve ter pelo menos 6 caracteres.");
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error("Erro de autenticação:", error);

      // Tratar erros específicos do Firebase
      let errorMessage = error.message;

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está registado. Tente fazer login.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Utilizador não encontrado. Registe-se primeiro.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Password incorreta. Tente novamente.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido. Verifique o formato.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiadas tentativas. Aguarde alguns minutos.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erro de rede. Verifique a sua conexão.";
      } else if (error.code === "auth/invalid-credential") {
        // Este erro pode ter várias causas - vamos dar uma mensagem mais útil
        console.log("Erro de credencial inválida - detalhes:", error);
        if (isLogin) {
          errorMessage =
            "Não foi possível fazer login. Verifique o email e password, ou crie uma nova conta.";
        } else {
          errorMessage =
            "Não foi possível criar conta. O email pode já estar em uso ou há um problema com a configuração.";
        }
      }

      showError(errorMessage);
    }
  });

  const googleBtn = document.getElementById("btn-google");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      if (window.setGoogleLoading) window.setGoogleLoading(true);

      const provider = new GoogleAuthProvider();
      // Adicionar escopo para solicitar email
      provider.addScope("email");
      provider.addScope("profile");

      try {
        // Primeiro tenta com popup (mais confiável)
        await signInWithPopup(auth, provider);
      } catch (error) {
        // Verificar se é erro de conta existente - tentar fazer link
        if (
          error.code === "auth/credential-already-in-use" ||
          error.code === "auth/email-already-in-use"
        ) {
          console.log("Conta já existe com outro método. A tentar link...");

          try {
            // Obter as credenciais do Google do erro
            const googleCredential =
              GoogleAuthProvider.credentialFromError(error);

            // Tentar fazer login com email/password primeiro se o utilizador tiver conta
            const email = error.customData?.email;
            if (email) {
              // Pedir para fazer login com password para depois linkar
              showError(
                "Já existe uma conta com este email. Faça login com a sua password e depois poderá linkar o Google.",
              );
              if (window.setGoogleLoading) window.setGoogleLoading(false);
              return;
            }
          } catch (linkError) {
            console.error("Erro ao linkar contas:", linkError);
          }
        }

        console.log("Popup falhou, a tentar redirect:", error);
        // Se popup falhar, usa redirect
        if (error.code !== "auth/popup-closed-by-user") {
          try {
            await signInWithRedirect(auth, provider);
          } catch (redirectError) {
            if (window.setGoogleLoading) window.setGoogleLoading(false);
            showError("Erro no login Google: " + redirectError.message);
          }
        } else {
          if (window.setGoogleLoading) window.setGoogleLoading(false);
        }
      }
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
  const isLoginPage =
    path === "/" ||
    path.includes("index") ||
    !!document.getElementById("auth-form");
  const isOnboardingPage = path.includes("onboarding");
  const isProtectedPage =
    path.includes("dashboard") ||
    path.includes("plan") ||
    path.includes("grocery");

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
    if (
      !isCheckingRedirect &&
      !isLoginPage &&
      !isOnboardingPage &&
      !path.includes("assets")
    ) {
      safeReplace("index.html");
    }
  }
});

export const logout = async () => {
  await signOut(auth);
  safeReplace("index.html");
};

export const initAuth = () => console.log("Auth Init");
