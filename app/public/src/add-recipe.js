import { auth, db } from "./firebase-init.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-storage.js";
const storage = getStorage();
import { saveUserRecipe, getHousehold } from "./db.js";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

// Initialize app
document.addEventListener("DOMContentLoaded", initAddRecipe);

async function initAddRecipe() {
  setupEventListeners();
  await loadTailwindConfig();
}

function setupEventListeners() {
  // PDF dropzone
  const dropzone = document.getElementById("pdf-dropzone");
  const pdfInput = document.getElementById("pdf-input");

  dropzone.addEventListener("click", () => pdfInput.click());
  dropzone.addEventListener("dragover", handleDragOver);
  dropzone.addEventListener("drop", handlePdfDrop);
  pdfInput.addEventListener("change", handlePdfSelect);

  // Text paste & parse
  const textarea = document.getElementById("recipe-text-paste");
  const parseBtn = document.getElementById("btn-parse-text");
  textarea.addEventListener("input", debounce(parseTextDebounced, 500));
  parseBtn.addEventListener("click", parseRecipeFromText);

  // Dynamic lists
  document
    .getElementById("btn-add-ingredient")
    .addEventListener("click", () => addIngredientField());
  document
    .getElementById("btn-add-step")
    .addEventListener("click", addStepField);

  // Image upload
  const imageInput = document.getElementById("image-input");
  const uploadArea = document.getElementById("image-upload");
  imageInput.addEventListener("change", handleImageUpload);
  uploadArea.addEventListener("click", () => imageInput.click());

  // Form submit
  document
    .getElementById("recipe-form")
    .addEventListener("submit", handleSubmit);

  // Auth check
  auth.onAuthStateChanged((user) => {
    if (!user) window.location.href = "index.html";
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add("bg-primary/20");
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove("bg-primary/20");
}

async function handlePdfDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("bg-primary/20");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    await parsePdf(file);
  }
}

async function handlePdfSelect(e) {
  const file = e.target.files[0];
  if (file) await parsePdf(file);
}

async function parsePdf(file) {
  try {
    showLoading("pdf-dropzone", true);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getPageTextContent();
      fullText += textContent.items.map((item) => item.str).join(" ") + "\n";
    }
    document.getElementById("recipe-text-paste").value = fullText;
    parseRecipeFromText();
  } catch (error) {
    console.error("PDF parse error:", error);
    showToast("Erro ao ler PDF", "error");
  } finally {
    showLoading("pdf-dropzone", false);
  }
}

function parseTextDebounced() {
  parseRecipeFromText();
}

function parseRecipeFromText() {
  const text = document.getElementById("recipe-text-paste").value;
  if (!text.trim()) return;

  showLoading("parse-feedback", true);
  setTimeout(() => {
    // Simulate async parse
    const parsed = parseYammiRecipe(text);
    populateForm(parsed);
    showParseFeedback(parsed);
  }, 800);
}

function parseYammiRecipe(text) {
  // Enhanced Yämmi format parser
  const parsed = {
    name: "",
    time: "",
    difficulty: "medium",
    portions: 4,
    description: "",
    author: "",
    ingredients: [],
    steps: [],
  };

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  // Title: first substantial line
  const titleLine = lines.find((l) => l.length > 10 && !/[0-9]{2,}/.test(l));
  parsed.name = titleLine || lines[0] || "Receita sem título";

  // Time
  const timeMatch = text.match(/([0-9]+).*?min/);
  parsed.time = timeMatch ? timeMatch[1] : "";

  // Difficulty
  if (text.includes("Fácil")) parsed.difficulty = "easy";
  else if (text.includes("Média") || text.includes("Médio"))
    parsed.difficulty = "medium";
  else if (text.includes("Difícil") || text.includes("Chef"))
    parsed.difficulty = "hard";

  // Portions
  const portionsMatch = text.match(/([0-9]+)\s*(porções?|pessoas?)/i);
  parsed.portions = portionsMatch ? parseInt(portionsMatch[1]) : 4;

  // Description
  const descMatch = text.match(/Descrição:?\s*([\s\S]*?)(?=\n[0-9])/i);
  parsed.description = descMatch ? descMatch[1].trim() : "";

  // Ingredients section
  const ingSection = text.match(
    /Ingredientes:?\s*([\s\S]*?)(?=Passos|Modo de|Preparação)/i,
  );
  if (ingSection) {
    const ingLines = ingSection[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.match(/^[0-9]+$/));
    parsed.ingredients = ingLines.slice(0, 20).map((line) => {
      // Parse qty unit name: e.g., "2 dentes alho" or "1 colher sopa azeite"
      const match = line.match(
        /^([0-9]+(?:\.[0-9]+)?)\s*([a-zàáâãéíóôõúç]*)\s*(.*)$/i,
      );
      if (match) {
        return {
          quantity: match[1],
          unit: match[2] || "",
          name: match[3].trim(),
        };
      }
      return {
        quantity: "",
        unit: "",
        name: line.replace(/^[•\-\d\.\s]+/i, "").trim(),
      };
    });
  }

  // Steps section - improved numbered grouping
  const stepsSection = text.match(/Passos?:?\s*([\s\S]*)$/i);
  if (stepsSection) {
    const stepLines = stepsSection[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let currentStep = "";
    parsed.steps = [];
    stepLines.forEach((line) => {
      if (/^[1-9][0-9]*[.)]\s/i.test(line)) {
        // New numbered step
        if (currentStep) parsed.steps.push(currentStep.trim());
        currentStep = line;
      } else {
        currentStep += " " + line;
      }
    });
    if (currentStep) parsed.steps.push(currentStep.trim());
    parsed.steps = parsed.steps.slice(0, 15);
  }

  return parsed;
}

function populateForm(data) {
  document.getElementById("recipe-name").value = data.name;
  document.getElementById("recipe-time").value = data.time;
  document.getElementById("recipe-difficulty").value = data.difficulty;

  // Clear & repopulate
  document.getElementById("ingredients-list").innerHTML = "";
  data.ingredients.forEach((ing) => addIngredientField(ing));

  document.getElementById("steps-list").innerHTML = "";
  data.steps.forEach((step) => addStepField(step));
}

function showParseFeedback(data) {
  const feedback = document.getElementById("parse-feedback");
  const stats = document.getElementById("parse-stats");
  const warnings = document.getElementById("parse-warnings");

  const parsedIngs = data.ingredients.filter(
    (ing) => ing.quantity && ing.name,
  ).length;
  stats.innerHTML = `
    <div>📝 Título: ${data.name ? "OK" : "❌"}</div>
    <div>⏱️ Tempo: ${data.time ? "OK" : "⚠️"}</div>
    <div>🥘 ${data.ingredients.length} ingredientes (${parsedIngs} parseados)</div>
    <div>📋 ${data.steps.length} passos</div>
  `;

  warnings.textContent =
    parsedIngs < data.ingredients.length / 2
      ? "Aviso: Alguns ingredientes não foram totalmente parseados (qty/unit)."
      : "";

  feedback.classList.remove("hidden");
  showLoading("parse-feedback", false);
}

function addIngredientField(ing = { quantity: "", unit: "", name: "" }) {
  const list = document.getElementById("ingredients-list");
  const id = Date.now();
  const html = `
    <div class="group flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary transition-all items-end">
      <input type="text" placeholder="2" value="${ing.quantity}" class="flex-1 bg-transparent border-none focus:ring-0 p-2 w-16 font-mono text-sm" data-ing-qty="${id}" />
      <input type="text" placeholder="dentes" value="${ing.unit}" class="flex-1 bg-transparent border-none focus:ring-0 p-2 w-20 text-sm" data-ing-unit="${id}" />
      <input type="text" placeholder="alho" value="${ing.name}" class="flex-2 bg-transparent border-none focus:ring-0 p-2 font-medium" data-ing-name="${id}" data-ing-id="${id}" />
      <button type="button" class="size-8 text-slate-400 hover:text-red-500 group-hover:text-red-400 self-start" onclick="removeIngredient(${id})">
        <span class="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  `;
  list.insertAdjacentHTML("beforeend", html);
}

function addStepField(text = "") {
  const list = document.getElementById("steps-list");
  const id = Date.now();
  const html = `
    <div class="group p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary transition-all">
      <textarea rows="2" placeholder="1. Pique a cebola finamente..." class="w-full bg-transparent border-none focus:ring-0 p-0 resize-vertical font-medium">${text}</textarea>
      <button type="button" class="mt-2 text-slate-400 hover:text-red-500 group-hover:text-red-400 self-end" onclick="removeStep(${id})">
        <span class="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  `;
  list.insertAdjacentHTML("beforeend", html);
}

window.removeIngredient = function (id) {
  const row = document.querySelector(`[data-ing-id="${id}"]`);
  if (row) row.closest("div").remove();
};

window.removeStep = function (id) {
  const row =
    document.querySelector(`[data-ing-id="${id}"]`) ||
    document.querySelector(`textarea`);
  if (row) row.closest("div").remove();
};

let imageFile = null;
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  imageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById("image-preview");
    preview.src = e.target.result;
    preview.classList.remove("hidden");
    document.getElementById("upload-placeholder").style.display = "none";
  };
  reader.readAsDataURL(file);
}

async function handleSubmit(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) {
    showToast("Faça login primeiro", "error");
    return;
  }

  showLoading("recipe-form", true);

  try {
    const formData = collectFormData();
    formData.userId = user.uid;
    formData.householdId = (await getHousehold(user.uid))?.id || "personal";
    formData.source = "user";
    formData.createdAt = new Date();

    if (imageFile) {
      const imageRef = ref(
        storage,
        `recipes/${user.uid}/${Date.now()}_${imageFile.name}`,
      );
      await uploadBytes(imageRef, imageFile);
      formData.imageUrl = await getDownloadURL(imageRef);
    }

    const recipeId = await saveUserRecipe(formData);

    sessionStorage.setItem(
      "savedRecipe",
      JSON.stringify({
        id: recipeId,
        ...formData,
      }),
    );
    window.location.href = "my-recipes.html";
  } catch (error) {
    console.error("Save error:", error);
    showToast("Erro ao guardar: " + error.message, "error");
  } finally {
    showLoading("recipe-form", false);
  }
}

function collectFormData() {
  const ingredients = [];
  document.querySelectorAll("[data-ing-id]").forEach((el) => {
    const id = el.dataset.ingId;
    const qty = document.querySelector(`[data-ing-qty="${id}"]`)?.value || "";
    const unit = document.querySelector(`[data-ing-unit="${id}"]`)?.value || "";
    const name = el.value;
    if (name.trim()) {
      ingredients.push({ quantity: qty, unit, name: name.trim() });
    }
  });

  return {
    name: document.getElementById("recipe-name").value,
    prepTime: document.getElementById("recipe-time").value,
    difficulty: document.getElementById("recipe-difficulty").value,
    portions: 4,
    ingredients,
    instructions: Array.from(document.querySelectorAll("#steps-list textarea"))
      .map((textarea) => textarea.value)
      .filter(Boolean),
    imageUrl: "",
    nutrition: {},
    tags: [],
  };
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function showLoading(selector, show = true) {
  const el =
    typeof selector === "string" ? document.getElementById(selector) : selector;
  if (show) {
    el.classList.add("loading");
  } else {
    el.classList.remove("loading");
    // Remove spinner if exists
    const spinner = el.querySelector(".spinner");
    if (spinner) spinner.remove();
  }
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `fixed top-20 right-4 p-4 rounded-2xl shadow-xl z-50 ${type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function loadTailwindConfig() {
  console.log("Tailwind configured");
}

// Global window functions
window.removeIngredient = removeIngredient;
window.removeStep = removeStep;
