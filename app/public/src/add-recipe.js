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
      const textContent = await page.getTextContent();
      // Better line structure
      fullText += textContent.items.map((item) => item.str).join(" ") + "\n\n\n";
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
    const parsed = parseYammiRecipe(text);
    populateForm(parsed);
    showParseFeedback(parsed);
  }, 800);
}

function preprocessPdfText(text) {
  return text
    .replace(/ {3,}/g, '\n') // qty\nname pairs
    .replace(/\s*\n\s*/g, "\n")
    .replace(/ {2,}/g, " ")
    .replace(/\t/g, " ")
    .trim();
}

function parseYammiRecipe(text) {
  const cleanText = preprocessPdfText(text);
  const lines = cleanText.split("\n").map(l => l.trim()).filter(l => l);
  const parsed = {
    name: "",
    prepTime: 0,
    time: "",
    difficulty: "medium",
    portions: 4,
    servings: 4,
    summary: "",
    description: "",
    analyzedInstructions: [{ name: "Preparação", steps: [] }],
    ingredients: [],
    steps: [],
    nutrition: {}
  };

  // Title/metadata from end
  const revLines = [...lines].reverse();
  const prepIdx = revLines.findIndex(l => l.includes('Prep:'));
  if (prepIdx !== -1) {
    parsed.name = revLines[prepIdx - 1]?.trim() || 'Receita sem título';
    const meta = revLines[prepIdx];
    const prepM = meta.match(/Prep[ :]*(\\d+)/i);
    parsed.prepTime = prepM ? parseInt(prepM[1]) : 0;
    parsed.time = parsed.prepTime.toString();
    const portM = meta.match(/(\\d+)\\s*(pessoas?|porç)/i);
    parsed.portions = portM ? parseInt(portM[1]) : 4;
    parsed.servings = parsed.portions;
    const diffM = meta.match(/(Fácil|Média|Difícil)/i);
    if (diffM) parsed.difficulty = diffM[1].toLowerCase().includes('fácil') ? 'easy' : 'medium';
  } else {
    parsed.name = lines.find(l => l.length > 20) || lines[0] || 'Receita sem título';
  }

  // Desc: before Ingredientes
  const ingIdx = lines.findIndex(l => l.match(/Ingredientes/i));
  if (ingIdx > 5) parsed.summary = lines.slice(ingIdx - 5, ingIdx).join(' ').trim().substring(0, 300);
  parsed.description = parsed.summary;

  // Ingredients pair qty + name
  const prepIngIdx = lines.findIndex(l => l.match(/Preparação/i));
  const ingEnd = prepIngIdx !== -1 ? prepIngIdx : lines.length;
  const ingLines = lines.slice(ingIdx + 1, ingEnd);
  for (let i = 0; i < ingLines.length; i += 2) {
    const qty = ingLines[i]?.trim();
    const name = ingLines[i+1]?.trim();
    if (qty && name && qty.match(/^\\d/) && !name.match(/^\\d/)) {
      const amtMatch = qty.match(/^(\\d+(?:,\\d+)?)/);
      const amount = amtMatch ? parseFloat(amtMatch[1].replace(',', '.')) : null;
      const unit = qty.replace(/^\\d+(?:,\\d+)?/, '').trim().toLowerCase();
      parsed.ingredients.push({
        amount,
        unit,
        name: name.replace(/^[•\\s]/, ''),
        original: `${qty} ${name}`
      });
    }
  }

  // Steps under Preparação, plain numbers
  if (prepIngIdx !== -1) {
    const stepLines = lines.slice(prepIngIdx + 1, lines.length - 5);
    let currentNum = 1;
    stepLines.forEach(line => {
      const numM = line.match(/^(\\d+)/);
      if (numM) {
        currentNum = parseInt(numM[1]);
        const step = line.replace(/^\\d+\\.?[\\s)]*/, '').trim();
        parsed.steps.push(step);
        parsed.analyzedInstructions[0].steps.push({number: currentNum, step});
      } else if (parsed.steps.length) {
        parsed.steps[parsed.steps.length - 1] += ' ' + line.trim();
      }
    });
  }

  // Nutrition rough parse end lines
  const nutLines = lines.slice(-10);
  ['Energia (\\d+(,\\d+)?) Kcal', 'Gordura (\\d+(,\\d+)?) g', 'Hidratos (\\d+(,\\d+)?) g', 'Proteínas (\\d+(,\\d+)?) g'].forEach(pat => {
    const m = cleanText.match(new RegExp(pat, 'i'));
    if (m && m[1]) {
      const amt = parseFloat(m[1].replace(',', '.'));
      if (pat.includes('Energia')) parsed.nutrition.calories = {amount: amt, unit: 'kcal'};
      if (pat.includes('Gordura')) parsed.nutrition.fatTotal = {amount: amt, unit: 'g'};
      if (pat.includes('Hidratos')) parsed.nutrition.carbohydrates = {amount: amt, unit: 'g'};
      if (pat.includes('Proteínas')) parsed.nutrition.protein = {amount: amt, unit: 'g'};
    }
  });

  window.parsedRecipe = parsed;
  sessionStorage.setItem('parsedRecipe', JSON.stringify(parsed));

  return parsed;
}

function populateForm(data) {
  document.getElementById("recipe-name").value = data.name || '';
  document.getElementById("recipe-time").value = data.prepTime || data.time || '';
  document.getElementById("recipe-difficulty").value = data.difficulty || 'medium';

  document.getElementById("ingredients-list").innerHTML = "";
  data.ingredients.forEach(ing => addIngredientField({
    quantity: ing.amount ? ing.amount.toString() : '',
    unit: ing.unit || '',
    name: ing.name || ''
  }));

  document.getElementById("steps-list").innerHTML = "";
  (data.analyzedInstructions[0]?.steps || data.steps || []).forEach(s => addStepField(s.step || s));

  // Store for collectFormData
  window.parsedRecipe = data;
  sessionStorage.setItem('parsedRecipe', JSON.stringify(data));
}

function showParseFeedback(data) {
  const feedback = document.getElementById("parse-feedback");
  const stats = document.getElementById("parse-stats");
  const warnings = document.getElementById("parse-warnings");

  const goodIngs = data.ingredients.filter(ing => ing.amount && ing.name).length;
  const nutKeys = Object.keys(data.nutrition).length;
  stats.innerHTML = `
    <div>📝 Título: ${data.name ? 'OK' : '❌'}</div>
    <div>⏱️ Tempo: ${data.prepTime ? 'OK' : '⚠️'}</div>
    <div>👥 ${data.servings || 4} porções</div>
    <div>🥘 ${data.ingredients.length} ingredientes (${goodIngs} estruturados)</div>
    <div>📋 ${data.steps.length} passos</div>
    <div>🥗 Nutrição: ${nutKeys} campos</div>
  `;

  warnings.textContent = goodIngs < 5 ? 'Alguns ingredientes precisam edição manual.' : '';

  feedback.classList.remove("hidden");
  showLoading("parse-feedback", false);
}

function addIngredientField(ing = { quantity: "", unit: "", name: "" }) {
  const list = document.getElementById("ingredients-list");
  const id = Date.now();
  const html = `
    <div class="group flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary transition-all items-end">
      <input type="text" placeholder="2" value="${ing.quantity}" class="flex-1 bg-transparent border-none focus:ring-0 p-2 w-16 font-mono text-sm" data-ing-qty="${id}" />
      <input type="text" placeholder="kg" value="${ing.unit}" class="flex-1 bg-transparent border-none focus:ring-0 p-2 w-20 text-sm" data-ing-unit="${id}" />
      <input type="text" placeholder="tomate" value="${ing.name}" class="flex-2 bg-transparent border-none focus:ring-0 p-2 font-medium" data-ing-name="${id}" data-ing-id="${id}" />
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
      <textarea rows="2" placeholder="1. Pré-aqueça o forno..." class="w-full bg-transparent border-none focus:ring-0 p-0 resize-vertical font-medium">${text}</textarea>
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
  const row = document.querySelector(`[data-ing-id="${id}"]`) || document.querySelector(`textarea`);
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
  // Merge form + parsed data for full seed format
  const parsed = JSON.parse(sessionStorage.getItem('parsedRecipe') || '{}');
  const formIngs = [];
  document.querySelectorAll("[data-ing-id]").forEach((el) => {
    const id = el.dataset.ingId;
    const qty = document.querySelector(`[data-ing-qty="${id}"]`)?.value || "";
    const unit = document.querySelector(`[data-ing-unit="${id}"]`)?.value || "";
    const name = el.value.trim();
    if (name) {
      const amt = parseFloat(qty) || null;
      formIngs.push({ amount: amt, unit, name, original: `${qty} ${unit} ${name}` });
    }
  });

  const instructions = Array.from(document.querySelectorAll("#steps-list textarea"))
    .map((ta) => ta.value.trim())
    .filter(Boolean);

  return {
    name: document.getElementById("recipe-name").value.trim(),
    prepTime: parseInt(document.getElementById("recipe-time").value) || parsed.prepTime || 30,
    difficulty: document.getElementById("recipe-difficulty").value,
    servings: parsed.servings || 4,
    portions: parsed.portions || 4,
    summary: parsed.summary || parsed.description || '',
    analyzedInstructions: parsed.analyzedInstructions || [{ name: "Passos", steps: instructions.map((s, i) => ({number: i+1, step: s})) }],
    nutrition: parsed.nutrition || {},
    ingredients: formIngs.length ? formIngs : parsed.ingredients || [],
    instructions, // backward compat
    imageUrl: "",
    tags: [],
    source: "imported-pdf"
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
  const el = typeof selector === "string" ? document.getElementById(selector) : selector;
  if (show) {
    el.classList.add("loading");
  } else {
    el.classList.remove("loading");
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
window.removeIngredient = function(id) { 
  const row = document.querySelector(`[data-ing-id="${id}"]`);
  if (row) row.closest("div").remove();
};
window.removeStep = function(id) { 
  const row = document.querySelector(`[data-ing-id="${id}"]`) || document.querySelector('textarea');
  if (row) row.closest("div").remove();
};
