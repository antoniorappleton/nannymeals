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
    .addEventListener("click", addIngredientField);
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
      const textContent = await page.getTextContent();
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
  // Yämmi format parser
  const parsed = {
    name: "",
    time: "",
    difficulty: "medium",
    portions: 4,
    description: "",
    author: "",
    ingredients: [],
    nutrition: {},
    steps: [],
  };

// Title: first substantial line
  const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
  const titleLine = lines.find(l => l.length > 10 && !/[0-9]{2,}/.test(l));
  parsed.name = titleLine || lines[0] || "Receita sem título";

// Time: various formats
  const timeMatch = text.match(/([0-9]+).*?min/);
  parsed.time = timeMatch ? timeMatch[1] : "";

// Difficulty
  if (text.includes("Fácil")) parsed.difficulty = "easy";
  else if (text.includes("Média") || text.includes("Médio")) parsed.difficulty = "medium";
  else if (text.includes("Difícil") || text.includes("Chef")) parsed.difficulty = "hard";

// Portions
  const portionsMatch = text.match(/([0-9]+)\s*(porções?|pessoas?)/i);
  parsed.portions = portionsMatch ? parseInt(portionsMatch[1]) : 4;

  // Description/Author
  const descMatch = text.match(/Descrição:?\s*([\s\S]*?)(?=\n[0-9])/i);
  parsed.description = descMatch ? descMatch[1].trim() : "";

  // Ingredients: numbered list after "Ingredientes"
  const ingSection = text.match(
    /Ingredientes:?\s*([\s\S]*?)(?=Passos|Modo de|Preparação)/i,
  );
  if (ingSection) {
    const lines = ingSection[1]
      .split("\n")
      .filter((l) => l.trim() && !l.match(/^[0-9]+$/));
    parsed.ingredients = lines
      .map((line) => ({
        name: line.replace(/^[•\-\d\.\s]+/i, "").trim(),
        quantity: "",
        unit: "",
      }))
      .slice(0, 20); // Limit
  }

  // Steps: numbered after "Passos"
  const stepsSection = text.match(/Passos?:?\s*([\s\S]*)$/i);
  if (stepsSection) {
    const lines = stepsSection[1]
      .split("\n")
      .map((l) => l.replace(/^[0-9\.\)\s]+/, "").trim())
      .filter(Boolean);
    parsed.steps = lines.slice(0, 15);
  }

  return parsed;
}

function populateForm(data) {
  document.getElementById("recipe-name").value = data.name;
  document.getElementById("recipe-time").value = data.time;
  document.getElementById("recipe-difficulty").value = data.difficulty;

  // Clear & repopulate lists
  document.getElementById("ingredients-list").innerHTML = "";
  data.ingredients.forEach((ing) => addIngredientField(ing.name));

  document.getElementById("steps-list").innerHTML = "";
  data.steps.forEach((step) => addStepField(step));
}

function showParseFeedback(data) {
  const feedback = document.getElementById("parse-feedback");
  const stats = document.getElementById("parse-stats");
  const warnings = document.getElementById("parse-warnings");

  stats.innerHTML = `
    <div>📝 Título: ${data.name ? "OK" : "❌"}</div>
    <div>⏱️ Tempo: ${data.time ? "OK" : "⚠️"}</div>
    <div>🥘 ${data.ingredients.length} ingredientes</div>
    <div>📋 ${data.steps.length} passos</div>
  `;

  warnings.textContent =
    data.ingredients.length < 3
      ? "Aviso: Poucos ingredientes detectados - verifique o texto."
      : "";

  feedback.classList.remove("hidden");
  showLoading("parse-feedback", false);
}

function addIngredientField(name = "") {
  const list = document.getElementById("ingredients-list");
  const id = Date.now();
  const html = `
    <div class="group flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary transition-all">
      <input type="text" placeholder="ex: 2 dentes alho" value="${name}" class="flex-1 bg-transparent border-none focus:ring-0 p-0 font-medium" data-ing-id="${id}" />
      <button type="button" class="size-8 text-slate-400 hover:text-red-500 group-hover:text-red-400" onclick="removeIngredient(${id})">
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
      <textarea rows="2" placeholder="1. Pique a cebola finamente..." class="w-full bg-transparent border-none focus:ring-0 p-0 resize-vertical">${text}</textarea>
      <button type="button" class="mt-2 text-slate-400 hover:text-red-500 group-hover:text-red-400 self-end" onclick="removeStep(${id})">
        <span class="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  `;
  list.insertAdjacentHTML("beforeend", html);
}

window.removeIngredient = function (id) {
  const input = document.querySelector(`[data-ing-id="\${id}"]`);
  if (input) input.closest("div").remove();
};

window.removeStep = function (event, id) {
  event.target.closest("div").remove();
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

    // Show in my-recipes
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
  return {
    name: document.getElementById("recipe-name").value,
    prepTime: document.getElementById("recipe-time").value,
    difficulty: document.getElementById("recipe-difficulty").value,
    portions: 4, // Default, extend if field added
    ingredients: Array.from(document.querySelectorAll("[data-ing-id]"))
      .map((input) => input.value)
      .filter(Boolean),
    instructions: Array.from(document.querySelectorAll("#steps-list textarea"))
      .map((textarea) => textarea.value)
      .filter(Boolean),
    imageUrl: "",
    nutrition: {}, // From parser if available
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
    el.innerHTML += '<div class="spinner"></div>';
  } else {
    el.classList.remove("loading");
  }
}

function showToast(message, type = "success") {
  // Simple toast
  const toast = document.createElement("div");
  toast.className = `fixed top-20 right-4 p-4 rounded-2xl shadow-xl z-50 ${type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function loadTailwindConfig() {
  // Placeholder for tailwind
  console.log("Tailwind configured");
}

// Global removes
window.removeIngredient = removeIngredient;
window.removeStep = removeStep;
