import { auth } from "./firebase-init.js";
import { createHousehold, getHousehold, generateWeeklyPlan } from "./db.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { logout } from "./auth.js";

// Logout
const logoutBtn = document.getElementById("btn-logout");
if (logoutBtn) logoutBtn.onclick = () => logout();

/**
 * Onboarding Wizard - Lógica de Negócio
 */

let currentUser = null;
let currentStep = 1;
const totalSteps = 4;

// Estado do Onboarding
let adults = 2;
let children = [];
let dietStyle = ["Sem restrições"];
let budgetLevel = "medium";
let leftoverTolerance = "some";
let allergies = [];
let exclusions = [];
let cookingTime = 30;
let cookingDays = 5;
let skillLevel = "intermediate";

// Elementos do DOM
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const progressBar = document.getElementById("progress-bar");
const stepLabel = document.getElementById("step-label");
const childrenList = document.getElementById("children-list");
const btnAddChild = document.getElementById("btn-add-child");
const footerNote = document.getElementById("footer-note");

// Autenticação
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadExistingProfile(user.uid);
  } else {
    window.location.href = "index.html";
  }
});

const loadExistingProfile = async (uid) => {
  try {
    const data = await getHousehold(uid);
    if (data) {
      console.log("Perfil existente carregado:", data);
      adults = data.adults || 2;
      children = data.children || [];
      dietStyle = data.dietStyle || ["Sem restrições"];
      budgetLevel = data.budgetLevel || "medium";
      leftoverTolerance = data.leftoverTolerance || "some";
      allergies = data.allergies || [];
      exclusions = data.exclusions || [];
      cookingTime = data.cookingTimeWeekday || 30;
      cookingDays = data.cookingDaysPerWeek || 5;
      skillLevel = data.skillLevel || "intermediate";

      // Re-inicializar seletores com os valores carregados
      reinitSelectors();
      renderChildren();
      updateWizardUI();
    }
  } catch (err) {
    console.warn("Nenhum perfil prévio encontrado ou erro ao carregar:", err);
  }
};

const reinitSelectors = () => {
    setupSelect("adult-selector", adults.toString(), (v) => (adults = parseInt(v)));
    setupSelect("diet-style-selector", dietStyle, (v) => (dietStyle = v), true);
    setupSelect("budget-level-selector", budgetLevel, (v) => (budgetLevel = v));
    setupSelect("leftover-selector", leftoverTolerance, (v) => (leftoverTolerance = v));
    setupSelect("allergies-selector", allergies, (v) => (allergies = v), true);
    setupSelect("exclusions-selector", exclusions, (v) => (exclusions = v), true);
    setupSelect("cooking-time-selector", cookingTime.toString(), (v) => (cookingTime = parseInt(v)));
    setupSelect("cooking-days-selector", cookingDays.toString(), (v) => (cookingDays = parseInt(v)));
    setupSelect("skill-level-selector", skillLevel, (v) => (skillLevel = v));
};

/**
 * Gestão de Crianças
 */
const renderChildren = () => {
  childrenList.innerHTML = "";
  children.forEach((child, index) => {
    const div = document.createElement("div");
    div.className =
      "flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xl shadow-primary/5 border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-left-4 group hover:border-primary/30 transition-all";
    div.innerHTML = `
      <div class="size-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-primary">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <div class="flex-1">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 block mb-1">Criança ${index + 1}</span>
        <select class="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-sm font-black shadow-sm focus:ring-2 focus:ring-primary/20 w-full" data-index="${index}">
          <option value="2-4" ${child.ageBand === "2-4" ? "selected" : ""}>2–4 anos</option>
          <option value="5-8" ${child.ageBand === "5-8" ? "selected" : ""}>5–8 anos</option>
          <option value="9-12" ${child.ageBand === "9-12" ? "selected" : ""}>9–12 anos</option>
          <option value="13-17" ${child.ageBand === "13-17" ? "selected" : ""}>13–17 anos</option>
        </select>
      </div>
      <button class="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" data-action="remove" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    `;

    // Evento de mudança de idade
    div.querySelector("select").onchange = (e) => {
      children[index].ageBand = e.target.value;
    };

    // Evento de remoção
    div.querySelector('button[data-action="remove"]').onclick = () => {
      children.splice(index, 1);
      renderChildren();
    };

    childrenList.appendChild(div);
  });
};

btnAddChild.onclick = () => {
  children.push({
    id: Date.now(),
    role: "child",
    ageBand: "5-8",
    name: `Criança ${children.length + 1}`,
  });
  renderChildren();
};

/**
 * Lógica de Seleção (Toggles)
 */
const setupSelect = (containerId, initialValue, callback, multi = false) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const btns = container.querySelectorAll("button");

  const updateStyles = (currentVal) => {
    btns.forEach((btn) => {
      const val = btn.getAttribute("data-value");
      const isActive = multi ? currentVal.includes(val) : currentVal === val;

      if (isActive) {
        btn.classList.add("bg-primary", "text-slate-900", "shadow-xl", "shadow-primary/20", "border-2", "border-primary", "scale-105");
        btn.classList.remove(
          "text-slate-500",
          "bg-white",
          "dark:bg-slate-900",
          "border-slate-100",
          "dark:border-slate-800"
        );
      } else {
        btn.classList.remove("bg-primary", "text-slate-900", "shadow-xl", "shadow-primary/20", "border-2", "border-primary", "scale-105");
        btn.classList.add(
          "text-slate-500",
          "bg-white",
          "dark:bg-slate-900",
          "border",
          "border-slate-100",
          "dark:border-slate-800",
          "hover:border-primary/50"
        );
      }
    });
  };

  updateStyles(initialValue);

  btns.forEach((btn) => {
    btn.onclick = () => {
      const val = btn.getAttribute("data-value");
      if (multi) {
        let newVal = [...initialValue];
        if (newVal.includes(val)) {
          newVal = newVal.filter((i) => i !== val);
        } else {
          newVal.push(val);
        }
        initialValue = newVal;
        callback(newVal);
      } else {
        initialValue = val;
        callback(val);
      }
      updateStyles(initialValue);
    };
  });
};

// Inicializar seletores
setupSelect("adult-selector", adults.toString(), (v) => (adults = parseInt(v)));
setupSelect("diet-style-selector", dietStyle, (v) => (dietStyle = v), true);
setupSelect("budget-level-selector", budgetLevel, (v) => (budgetLevel = v));
setupSelect(
  "leftover-selector",
  leftoverTolerance,
  (v) => (leftoverTolerance = v),
);
setupSelect("allergies-selector", allergies, (v) => (allergies = v), true);
setupSelect("exclusions-selector", exclusions, (v) => (exclusions = v), true);
setupSelect(
  "cooking-time-selector",
  cookingTime.toString(),
  (v) => (cookingTime = parseInt(v)),
);
setupSelect(
  "cooking-days-selector",
  cookingDays.toString(),
  (v) => (cookingDays = parseInt(v)),
);
setupSelect("skill-level-selector", skillLevel, (v) => (skillLevel = v));

/**
 * Navegação do Wizard
 */
const updateWizardUI = () => {
  // Passos
  document.querySelectorAll(".setup-step").forEach((s, i) => {
    s.classList.toggle("hidden", i + 1 !== currentStep);
  });

  // Barra de Progresso
  progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
  stepLabel.textContent = `Passo ${currentStep} de ${totalSteps}`;

  // Botões
  btnPrev.classList.toggle("hidden", currentStep === 1);

  if (currentStep === totalSteps) {
    btnNext.innerHTML =
      'Criar Plano <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5 ml-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
  } else {
    btnNext.innerHTML =
      'Seguinte <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5 ml-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>';
  }

  // Atualizar botão Anterior com ícone
  btnPrev.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5 mr-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg> Anterior';

  // Notas do rodapé
  const notes = [
    "CONFIGURE O PERFIL PARA UM PLANO 100% À MEDIDA.",
    "ESTAS PREFERÊNCIAS AJUDAM-NOS A ESCOLHER OS MELHORES SABORES.",
    "A SEGURANÇA ALIMENTAR É A NOSSA PRIORIDADE.",
    "QUASE LÁ! VAMOS PLANEAR DE ACORDO COM O TEU TEMPO.",
  ];
  if (footerNote) footerNote.textContent = notes[currentStep - 1];
};

btnNext.onclick = async () => {
  if (currentStep < totalSteps) {
    currentStep++;
    updateWizardUI();
  } else {
    // Finalizar
    if (!currentUser) return;

    try {
      btnNext.disabled = true;
      btnNext.innerHTML = "A criar plano...";

      const finalData = {
        adults,
        children,
        dietStyle,
        budgetLevel,
        leftoverTolerance,
        allergies,
        exclusions,
        cookingTimeWeekday: cookingTime,
        cookingDaysPerWeek: cookingDays,
        skillLevel,
        // Manter compatibilidade com lógica anterior se necessário
        maxPrepTime: cookingTime,
        dinnersPerWeek: cookingDays,
      };

      await createHousehold(currentUser.uid, finalData);
      
      // Gerar o novo plano IMEDIATAMENTE com base nas alterações
      console.log("Perfil guardado. A gerar novo plano inteligente...");
      await generateWeeklyPlan(currentUser.uid);
      
      window.location.href = "dashboard.html";
    } catch (error) {
      console.error("Erro no onboarding:", error);
      alert("Houve um problema ao guardar os seus dados. Tente novamente.");
      btnNext.disabled = false;
      btnNext.innerHTML =
        'Criar Plano <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 ml-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
    }
  }
};

btnPrev.onclick = () => {
  if (currentStep > 1) {
    currentStep--;
    updateWizardUI();
  }
};

// Botão de voltar no Header (se existir)
const globalBack = document.getElementById("btn-back");
if (globalBack) {
  globalBack.onclick = () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardUI();
    } else {
      window.location.href = "index.html";
    }
  };
}

// Inicialização
renderChildren();
updateWizardUI();
