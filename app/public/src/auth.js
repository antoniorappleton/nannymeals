import { auth } from "./firebase-init.js";
import { syncUserProfile } from "./db.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

/**
 * Lógica de Autenticação Centralizada
 */

// Lidar com o resultado do redirecionamento (necessário após o retorno do Google)
getRedirectResult(auth)
  .then((result) => {
    if (result) {
      console.log("Login por redirecionamento bem-sucedido");
      // O utilizador será detetado pelo onAuthStateChanged abaixo
    }
  })
  .catch((error) => {
    console.error("Erro no resultado do redirecionamento:", error.message);
  });

// Elementos da UI de Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged tratará do redirecionamento
    } catch (error) {
      console.error("Erro no login:", error.message);
      alert("Erro ao entrar: " + error.message);
    }
  });

  const googleBtn = document.getElementById("btn-google");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        // Usar Redirect em vez de Popup para compatibilidade com telemóveis
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Erro Google Login:", error.message);
        alert("Erro no login Google. Por favor, tente novamente.");
      }
    });
  }
}

// Observador do Estado da Sessão
onAuthStateChanged(auth, async (user) => {
  // Agora index.html é a página de login
  const isLoginPage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html");

  if (user) {
    console.log("Usuário autenticado:", user.email);

    // Sincronizar dados com o Firestore
    try {
      await syncUserProfile(user);
    } catch (error) {
      console.error("Erro ao sincronizar perfil:", error);
    }

    if (isLoginPage) {
      window.location.href = "dashboard.html";
    }
  } else {
    console.log("Nenhum usuário logado.");
    if (!isLoginPage && !window.location.pathname.endsWith("onboarding.html")) {
      window.location.href = "index.html";
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
