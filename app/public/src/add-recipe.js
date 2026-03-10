import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// State
let currentUser = null;
let recipeImageBase64 = null;

// Elements
const ingredientsList = document.getElementById("ingredients-list");
const stepsList = document.getElementById("steps-list");
const btnAddIngredient = document.getElementById("btn-add-ingredient");
const btnAddStep = document.getElementById("btn-add-step");
const recipeForm = document.getElementById("recipe-form");
const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");
const imageUpload = document.getElementById("image-upload");
const uploadPlaceholder = document.getElementById("upload-placeholder");
const pdfInput = document.getElementById("pdf-input");
const pdfDropzone = document.getElementById("pdf-dropzone");

// Auth
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
  } else {
    window.location.href = "index.html";
  }
});

/**
 * Dynamic Lists Handling
 */
const createListItem = (placeholder, isStep = false) => {
  const div = document.createElement("div");
  div.className = "flex gap-3 animate-in fade-in slide-in-from-left-4";
  div.innerHTML = `
    <input type="${isStep ? 'text' : 'text'}" placeholder="${placeholder}" class="flex-1 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl p-3 text-sm font-bold shadow-sm focus:ring-primary focus:border-primary" />
    <button type="button" class="size-11 bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-red-500 rounded-xl flex items-center justify-center transition-all">
      <span class="material-symbols-outlined text-xl">remove</span>
    </button>
  `;
  
  div.querySelector("button").onclick = () => div.remove();
  return div;
};

btnAddIngredient.onclick = () => ingredientsList.appendChild(createListItem("Ex: 200g de Frango"));
btnAddStep.onclick = () => stepsList.appendChild(createListItem("Ex: Cortar o frango em cubos...", true));

// Initial items
btnAddIngredient.onclick();
btnAddStep.onclick();

/**
 * Image Handling
 */
imageUpload.onclick = () => imageInput.click();
imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      recipeImageBase64 = event.target.result;
      imagePreview.src = recipeImageBase64;
      imagePreview.classList.remove("hidden");
      uploadPlaceholder.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  }
};

/**
 * PDF Parsing Logic
 */
pdfDropzone.onclick = () => pdfInput.click();
pdfInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    try {
      pdfDropzone.innerHTML = `
        <div class="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
        <p class="font-black text-xs uppercase tracking-widest text-primary">A ler PDF...</p>
      `;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + "\n";
      }

      console.log("PDF TEXT EXTRACTED:", fullText);
      parseRecipeFromText(fullText);
      
      pdfDropzone.innerHTML = `
        <span class="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
        <p class="font-black text-slate-700 dark:text-slate-300">Importação Concluída!</p>
      `;
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Erro ao ler PDF. Tente introduzir manualmente.");
    }
  }
};

const parseRecipeFromText = (text) => {
  // Simple heuristic parsing for demonstration
  // Real implemention might use regex or LLM (not available client-side)
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 5);
  
  // Attempt to find a title
  if (lines[0]) document.getElementById("recipe-name").value = lines[0].slice(0, 50);
  
  // Look for ingredient patterns
  const maybeIngredients = lines.filter(l => 
    l.match(/^\d+/) || l.includes("g de") || l.includes("kg") || l.includes("ml")
  );
  
  if (maybeIngredients.length > 0) {
    ingredientsList.innerHTML = "";
    maybeIngredients.forEach(ing => {
      const item = createListItem("Ingrediente");
      item.querySelector("input").value = ing;
      ingredientsList.appendChild(item);
    });
  }
};

/**
 * Form Submission
 */
recipeForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  try {
    const btn = recipeForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "A guardar magicamente...";

    const ingredients = Array.from(ingredientsList.querySelectorAll("input"))
      .map(i => i.value.trim())
      .filter(Boolean);
      
    const instructionSteps = Array.from(stepsList.querySelectorAll("input"))
      .map(i => i.value.trim())
      .filter(Boolean);

    const recipeData = {
      name: document.getElementById("recipe-name").value,
      prepTime: parseInt(document.getElementById("recipe-time").value) || 30,
      difficulty: document.getElementById("recipe-difficulty").value,
      ingredients,
      instructionSteps,
      image: recipeImageBase64,
      ownerUid: currentUser.uid,
      source: "user",
      createdAt: serverTimestamp(),
      tags: ["user-submitted"]
    };

    await addDoc(collection(db, "recipes"), recipeData);
    
    alert("Receita guardada com sucesso! Já podes usá-la nos teus planos.");
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error("Save error:", err);
    alert("Erro ao guardar receita. Verifique a ligação.");
  }
};

