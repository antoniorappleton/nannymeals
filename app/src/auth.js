import { auth } from "./firebase-init.js";
import { syncUserProfile, getHousehold } from "./db.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

/**
 * Lógica de Autenticação Centralizada
 */

console.log("Módulo de autenticação ativo. Path:", window.location.pathname);

// Lidar com o resultado do redirecionamento (essencial para Google Login no Telemóvel)
getRedirectResult(auth)
  .then((result) => {
    if (result) {
      console.log("Login por redirecionamento bem-sucedido para:", result.user.email);
    }
  })
  .catch((error) => {
    console.error("Erro no resultado do redirecionamento:", error.code, error.message);
    if (error.code !== "auth/credential-already-in-use") {
       // alert("Erro ao finalizar login: " + error.message);
    }
  });

// Elementos da UI de Login/Registo
const authForm = document.getElementById("auth-form");
if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const isLogin = window.isLoginMode !== false; // Default true

    try {
      if (isLogin) {
        console.log("A iniciar sessão...");
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        console.log("A criar conta...");
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // O onAuthStateChanged tratará do redirecionamento
    } catch (error) {
      console.error("Erro na autenticação:", error.code, error.message);
      let msg = "Erro: " + error.message;
      if (error.code === "auth/email-already-in-use") msg = "Este email já está registado.";
      if (error.code === "auth/wrong-password") msg = "Palavra-passe incorreta.";
      if (error.code === "auth/user-not-found") msg = "Utilizador não encontrado.";
      alert(msg);
    }
  });

  const googleBtn = document.getElementById("btn-google");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        console.log("A iniciar redirect do Google...");
        // Usar Redirect em vez de Popup para compatibilidade total com telemóveis
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Erro Google Login:", error.message);
        alert("Erro no login Google. Por favor, tente novamente.");
      }
    });
  }
}

// Observador do Estado da Sessão - Garantir que o utilizador vai para o sítio certo
onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname;
  const isLoginPage = path === "/" || path.endsWith("index.html") || path === "" || path.endsWith("/");
  const isOnboardingPage = path.endsWith("onboarding.html");

  if (user) {
    console.log("Utilizador detetado:", user.email);

    // 1. Sincronizar perfil básico
    try {
      await syncUserProfile(user);
    } catch (error) {
      console.error("Erro ao sincronizar perfil:", error);
    }

    // 2. Verificar se já tem Household (Família) para decidir o destino
    if (isLoginPage || isOnboardingPage) {
        try {
            // Obter dados do utilizador no Firestore
            const { doc, getDoc, getFirestore } = await import("https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js");
            const dbRef = getFirestore();
            const userSnap = await getDoc(doc(dbRef, "users", user.uid));
            
            const userData = userSnap.exists() ? userSnap.data() : null;
            
            if (userData && userData.householdId) {
                console.log("Household encontrado, a enviar para dashboard");
                if (!path.endsWith("dashboard.html")) {
                    window.location.href = "dashboard.html";
                }
            } else {
                console.log("Sem household, a enviar para onboarding");
                if (!isOnboardingPage) {
                    window.location.href = "onboarding.html";
                }
            }
        } catch (e) {
            console.error("Erro ao verificar destino:", e);
            if (isLoginPage) window.location.href = "onboarding.html";
        }
    }
  } else {
    console.log("Nenhum utilizador logado.");
    if (!isLoginPage && !isOnboardingPage) {
      console.log("A expulsar para index...");
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
