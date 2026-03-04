import { auth } from "./firebase-init.js";
import { createHousehold } from "./db.js";
import { onAuthStateChanged } from "firebase/auth";

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
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    window.location.href = "index.html";
  }
});

/**
 * Gestão de Crianças
 */
const renderChildren = () => {
  childrenList.innerHTML = "";
  children.forEach((child, index) => {
    const div = document.createElement("div");
    div.className =
      "flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-3 animate-in fade-in slide-in-from-left-4";
    div.innerHTML = `
      <span class="text-sm font-bold flex-1">Criança ${index + 1}</span>
      <select class="bg-white dark:bg-slate-700 border-none rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm" data-index="${index}">
        <option value="2-4" ${child.ageBand === "2-4" ? "selected" : ""}>2–4 anos</option>
        <option value="5-8" ${child.ageBand === "5-8" ? "selected" : ""}>5–8 anos</option>
        <option value="9-12" ${child.ageBand === "9-12" ? "selected" : ""}>9–12 anos</option>
        <option value="13-17" ${child.ageBand === "13-17" ? "selected" : ""}>13–17 anos</option>
      </select>
      <button class="text-slate-400 hover:text-red-500 transition-colors" data-action="remove" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
        btn.classList.add("bg-primary", "text-slate-900", "shadow-md");
        btn.classList.remove(
          "text-slate-500",
          "bg-slate-100",
          "dark:bg-slate-800",
        );
      } else {
        btn.classList.remove("bg-primary", "text-slate-900", "shadow-md");
        btn.classList.add(
          "text-slate-500",
          "bg-slate-100",
          "dark:bg-slate-800",
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
      'Criar Plano <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 ml-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>';
  } else {
    btnNext.innerHTML =
      'Seguinte <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 ml-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>';
  }

  // Atualizar botão Anterior com ícone
  btnPrev.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mr-1 inline-block"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg> Anterior';

  // Notas do rodapé
  const notes = [
    "Escolha quem vai jantar para começar a planear.",
    "Estas preferências ajudam-nos a escolher os melhores sabores.",
    "A segurança alimentar é a nossa prioridade.",
    "Quase lá! Vamos planear de acordo com o teu tempo.",
  ];
  footerNote.textContent = notes[currentStep - 1];
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
