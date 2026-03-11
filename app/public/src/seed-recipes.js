import { db } from "./firebase-init.js";
import { collection, addDoc, getDocs, query, limit, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const recipes = [
  {
    id: "native_salmao_cozido",
    name: "Salmão Cozido",
    image: null,
    prepTime: 25,
    preparationMinutes: 15,
    cookingMinutes: 10,
    servings: 4,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: [],
    cuisines: ["portuguesa"],
    dishTypes: ["prato principal", "peixe"],
    flags: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: true,
      veryPopular: false,
      whole30: false,
    },
    tags: ["pescado", "saudável", "fácil", "clássico", "família"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "O salmão tem um elevado teor de ômega 3, com especial benefício para a memória. Aprenda a preparar um prato de salmão cozido, com esta simples e deliciosa receita.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Sem Robô",
        steps: [
          { number: 1, step: "Numa taça, misture o mel com o sumo de lima. Reserve." },
          { number: 2, step: "Noutra taça, coloque as framboesas, o vinagre balsâmico e o manjericão picado. Envolva delicadamente e reserve." },
          { number: 3, step: "Num tacho com água, disponha as postas de salmão e deixe cozer durante cerca de 10 minutos. Retire o salmão do tacho." },
          { number: 4, step: "Sirva o salmão cozido acompanhado com espargos cozidos e batata cozida." },
          { number: 5, step: "Decore com as framboesas e regue com a mistura de mel e lima. Finalize com pimenta rosa." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 320, unit: "kcal" },
      protein: { amount: 35, unit: "g" },
      fat: { amount: 18, unit: "g" },
      carbohydrates: { amount: 12, unit: "g" },
      sugar: { amount: 8, unit: "g" },
      fiber: { amount: 2, unit: "g" },
      sodium: { amount: 400, unit: "mg" }
    },
    ingredients: [
      { name: "Salmão", amount: 3, unit: "postas", original: "3 postas de salmão" },
      { name: "Mel", amount: 2, unit: "colher de sopa", original: "2 c. sopa de mel" },
      { name: "Lima", amount: 1, unit: "unid", original: "Sumo de 1 lima" },
      { name: "Framboesas", amount: 100, unit: "g", original: "100 g de framboesas" },
      { name: "Vinagre balsâmico", amount: 2, unit: "colher de sopa", original: "2 c. sopa de vinagre balsâmico" },
      { name: "Manjericão", amount: null, unit: "q.b.", original: "Manjericão picado q.b." },
      { name: "Espargos", amount: null, unit: "q.b.", original: "Espargos cozidos, para acompanhar" },
      { name: "Batata", amount: null, unit: "q.b.", original: "Batata cozida, para acompanhar" },
      { name: "Pimenta rosa", amount: null, unit: "q.b.", original: "Pimenta rosa q.b." }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_salada_queijos",
    name: "Salada de Queijos",
    image: null,
    prepTime: 15,
    preparationMinutes: 15,
    cookingMinutes: 0,
    servings: 2,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: ["vegetarian"],
    cuisines: ["portuguesa"],
    dishTypes: ["salada", "almoço"],
    flags: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["vegetariano", "rápido", "fresco", "leve"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "A Salada de Queijos é uma opção fresca, leve e cheia de sabor. Combina diferentes texturas e aromas, criando uma refeição simples, mas deliciosa.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Lave bem a rúcula e escorra-a." },
          { number: 2, step: "Lave os tomates cherry e corte-os ao meio." },
          { number: 3, step: "Lave as peras, retire o caroço e corte-as em fatias finas (pode manter a casca)." },
          { number: 4, step: "Lamine finamente a cebola roxa." },
          { number: 5, step: "Coloque a rúcula numa taça grande ou prato de servir." },
          { number: 6, step: "Distribua por cima as fatias de pera, o tomate cherry e os cubos de queijo." },
          { number: 7, step: "Junte a cebola roxa laminada." },
          { number: 8, step: "Polvilhe com as sementes de papoila e acrescente a cebola frita para dar crocância." },
          { number: 9, step: "Regue com um fio de azeite e acrescente creme de balsâmico a gosto." },
          { number: 10, step: "Ajuste o sal, se necessário." },
          { number: 11, step: "Sirva de imediato, para manter a frescura da rúcula e a crocância da cebola frita." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 480, unit: "kcal" },
      protein: { amount: 18, unit: "g" },
      fat: { amount: 34, unit: "g" },
      carbohydrates: { amount: 32, unit: "g" },
      sugar: { amount: 22, unit: "g" },
      fiber: { amount: 6, unit: "g" },
      sodium: { amount: 1400, unit: "mg" }
    },
    ingredients: [
      { name: "Rúcula", amount: 1, unit: "embalagem", original: "1 embalagem de rúcula" },
      { name: "Pera", amount: 2, unit: "unid", original: "2 peras" },
      { name: "Tomate cherry", amount: 100, unit: "g", original: "100 gramas tomate cherry" },
      { name: "Queijo cheddar", amount: null, unit: "q.b.", original: "1 embalagem de queijos em cubos (cheddar Gouda e emmental)" },
      { name: "Cebola roxa", amount: 0.5, unit: "unid", original: "1/2 cebola roxa laminada" },
      { name: "Sementes de papoila", amount: 1, unit: "colher de chá", original: "1 colher de chá de sementes de papoila" },
      { name: "Cebola frita", amount: 1, unit: "colher de sopa", original: "1 colher de sopa de cebola frita" },
      { name: "Creme de balsâmico", amount: null, unit: "q.b.", original: "Creme de balsâmico q.b." },
      { name: "Azeite", amount: null, unit: "q.b.", original: "Azeite q.b." },
      { name: "Sal", amount: null, unit: "q.b.", original: "Sal q.b." }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_lasanha_espinafres_ricota",
    name: "Lasanha de Espinafres e Ricota",
    image: null,
    prepTime: 40,
    preparationMinutes: 25,
    cookingMinutes: 15,
    servings: 6,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: ["vegetarian"],
    cuisines: ["portuguesa", "italiana"],
    dishTypes: ["prato principal", "lasanha"],
    flags: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["vegetariano", "intermediário", "família", "reconfortante"],
    skillLevel: "intermediate",
    leftoverFriendly: true,
    summary: "Uma lasanha vegetariana, saborosa e fácil de fazer. Uma receita reconfortante para o seu dia!",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Numa frigideira, aqueça o azeite e junte o tomate pelado e os espinafres. Deixe cozinhar durante cerca de 5 minutos, até os espinafres reduzirem de volume." },
          { number: 2, step: "Retire do lume e transfira para uma taça. Junte o queijo ricota, o sal, a pimenta e a noz-moscada. Envolva bem até obter uma mistura homogénea." },
          { number: 3, step: "Numa travessa de forno, disponha uma camada de molho bechamel. Coloque por cima folhas de lasanha." },
          { number: 4, step: "Espalhe uma camada da mistura de ricota e espinafres e polvilhe com mozzarella ralada." },
          { number: 5, step: "Repita as camadas até terminar os ingredientes, finalizando com queijo mozzarella e parmesão." },
          { number: 6, step: "Leve ao forno a 180°C durante 25-30 minutos, até ficar dourado e borbulhante." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 420, unit: "kcal" },
      protein: { amount: 18, unit: "g" },
      fat: { amount: 22, unit: "g" },
      carbohydrates: { amount: 38, unit: "g" },
      sugar: { amount: 6, unit: "g" },
      fiber: { amount: 4, unit: "g" },
      sodium: { amount: 650, unit: "mg" }
    },
    ingredients: [
      { name: "Azeite", amount: 1, unit: "colher de sopa", original: "1 c. sopa de azeite" },
      { name: "Tomate pelado", amount: 1, unit: "lata", original: "1 lata de tomate pelado" },
      { name: "Espinafres", amount: 500, unit: "g", original: "500 g de espinafres" },
      { name: "Queijo ricota", amount: 350, unit: "g", original: "350 g de queijo ricota" },
      { name: "Sal", amount: 1, unit: "colher de café", original: "1 c. café de sal" },
      { name: "Pimenta", amount: null, unit: "q.b.", original: "Pimenta q.b." },
      { name: "Noz-moscada", amount: null, unit: "q.b.", original: "Noz moscada q.b." },
      { name: "Molho bechamel", amount: 500, unit: "ml", original: "500 ml bechamel" },
      { name: "Massa para lasanha", amount: null, unit: "q.b.", original: "Massa para lasanha q.b." },
      { name: "Queijo parmesão", amount: 80, unit: "g", original: "80 g de queijo parmesão ralado" },
      { name: "Queijo mozzarella", amount: 100, unit: "g", original: "100 g de queijo mozzarella ralado" }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_sopa_tomate_ovo",
    name: "Sopa de Tomate com Ovo Escalfado",
    image: null,
    prepTime: 40,
    preparationMinutes: 31,
    cookingMinutes: 9,
    servings: 6,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: [],
    cuisines: ["portuguesa"],
    dishTypes: ["sopa", "prato principal"],
    flags: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: true,
      veryPopular: false,
      whole30: false,
    },
    tags: ["sopa", "fácil", "saudável", "família"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "A sopa de tomate com ovo escalfado é uma refeição reconfortante e cheia de sabor, ideal para bebés a partir dos 12 meses.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Lave muito bem os hortícolas. Descasque-os e corte em pedaços mais pequenos." },
          { number: 2, step: "Coloque no copo os hortícolas, a água e o sal e programe 25 minutos a 100ºC na velocidade 2." },
          { number: 3, step: "Com a espátula, faça descer o que se acumulou nas paredes do copo. Junte o manjericão e triture durante 1 minuto na velocidade 5, aumentando progressivamente até à velocidade 10." },
          { number: 4, step: "Insira o cesto no copo e abra os ovos por cima da sopa. Programe 5 minutos a 100ºC na velocidade 1." },
          { number: 5, step: "Sirva cada sopa com 1 ovo e 1 colher de café de azeite por cima." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 55, unit: "kcal" },
      protein: { amount: 1.5, unit: "g" },
      fat: { amount: 1.8, unit: "g" },
      carbohydrates: { amount: 2.9, unit: "g" },
      sugar: { amount: 2.3, unit: "g" },
      fiber: { amount: 1.2, unit: "g" },
      sodium: { amount: 400, unit: "mg" }
    },
    ingredients: [
      { name: "Cebola", amount: 160, unit: "g", original: "160 g de cebola" },
      { name: "Alho", amount: 2, unit: "dentes", original: "2 dentes de alho" },
      { name: "Gengibre", amount: 15, unit: "g", original: "15 g de gengibre" },
      { name: "Curgete", amount: 250, unit: "g", original: "250 g de curgete" },
      { name: "Cenoura", amount: 250, unit: "g", original: "250 g de cenoura" },
      { name: "Tomate pelado", amount: 320, unit: "g", original: "320 g de tomate pelado" },
      { name: "Manjericão", amount: 2, unit: "colher de sopa", original: "2 c. de sopa de folhas de manjericão fresco" },
      { name: "Água", amount: 800, unit: "g", original: "800 g de água" },
      { name: "Sal iodado", amount: 1.5, unit: "colher de café", original: "1 ½ c. de café de sal iodado" },
      { name: "Ovo de codorniz", amount: 6, unit: "unid", original: "6 ovos de codorniz" },
      { name: "Azeite virgem extra", amount: 6, unit: "colher de café", original: "6 c. de café de azeite virgem extra" }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_bife_parmegiana",
    name: "Bife à Parmegiana",
    image: null,
    prepTime: 35,
    preparationMinutes: 15,
    cookingMinutes: 20,
    servings: 2,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: [],
    cuisines: ["portuguesa", "brasileira"],
    dishTypes: ["prato principal", "carne"],
    flags: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["carne", "fácil", "reconfortante", "clássico"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "O bife à parmegiana é um prato reconfortante e cheio de sabor, com carne tenra envolvida em molho de tomate e queijo gratinado.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Numa taça, misture a farinha panko com o azeite. Espalhe num tabuleiro e leve ao forno pré-aquecido a 180°C durante 5 a 8 minutos, até ficar ligeiramente dourada. Reserve." },
          { number: 2, step: "Tempere o bife de alcatra com o sal, a pimenta e o alho em pó." },
          { number: 3, step: "Passe o bife por ovo batido e depois envolva na farinha panko tostada. Disponha num tabuleiro forrado com papel vegetal." },
          { number: 4, step: "Espalhe o molho de tomate por cima do bife, polvilhe com queijo mozzarella ralado e finalize com orégãos." },
          { number: 5, step: "Leve ao forno a 180°C durante 12 a 15 minutos, até o queijo derreter e gratinar." },
          { number: 6, step: "Sirva o bife à parmegiana acompanhado de palitos de batata-doce e decore com orégãos." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 520, unit: "kcal" },
      protein: { amount: 42, unit: "g" },
      fat: { amount: 28, unit: "g" },
      carbohydrates: { amount: 25, unit: "g" },
      sugar: { amount: 6, unit: "g" },
      fiber: { amount: 2, unit: "g" },
      sodium: { amount: 850, unit: "mg" }
    },
    ingredients: [
      { name: "Farinha panko", amount: 100, unit: "g", original: "100 g de farinha panko" },
      { name: "Azeite", amount: 2, unit: "colher de sopa", original: "2 c. sopa de azeite" },
      { name: "Bife de alcatra", amount: 400, unit: "g", original: "400 g de bife de alcatra" },
      { name: "Sal", amount: 1, unit: "colher de café", original: "1 c. café de sal" },
      { name: "Pimenta", amount: null, unit: "q.b.", original: "Pimenta q.b." },
      { name: "Alho em pó", amount: 1, unit: "colher de café", original: "1 c. café de alho em pó" },
      { name: "Ovo", amount: 2, unit: "unid", original: "2 ovos batidos" },
      { name: "Molho de tomate", amount: 150, unit: "ml", original: "150 ml de molho de tomate" },
      { name: "Queijo mozzarella", amount: 100, unit: "g", original: "100 g de queijo mozzarella ralado" },
      { name: "Orégãos", amount: null, unit: "q.b.", original: "Orégãos q.b." },
      { name: "Batata-doce", amount: null, unit: "q.b.", original: "Palitos de batata-doce q.b." }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_pao_de_lo_soure",
    name: "Pão-de-ló de Soure",
    image: null,
    prepTime: 56,
    preparationMinutes: 26,
    cookingMinutes: 30,
    servings: 6,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: ["vegetarian"],
    cuisines: ["portuguesa"],
    dishTypes: ["sobremesa", "bolo"],
    flags: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["sobremesa", "tradicional", "fácil", "clássico"],
    skillLevel: "intermediate",
    leftoverFriendly: false,
    summary: "Do Beira Litoral chega este Pão-de-ló de Soure, uma receita que preserva o sabor de outros tempos. Com a sua textura leve e húmida.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Pré-aqueça o forno a 200°C." },
          { number: 2, step: "Insira o misturador sobre a lâmina." },
          { number: 3, step: "Coloque no copo o açúcar e os ovos inteiros e bata 14 minutos na velocidade 4." },
          { number: 4, step: "Num recipiente à parte bata as gemas. Programe 11 minutos na velocidade 4 e, durante o funcionamento da máquina, vá vertendo as gemas em fio pela abertura da tampa." },
          { number: 5, step: "Junte a farinha misturada com o fermento, envolva com a espátula e regule 30 segundos na velocidade 3." },
          { number: 6, step: "Unte uma forma redonda de fundo amortível (24 cm de diâmetro) com manteiga e polvilhe com farinha, sacudindo o excesso. Bata com a forma na superfície de trabalho duas vezes." },
          { number: 7, step: "Leve ao forno - baixando a temperatura para 180°C - coberto com papel de alumínio, cerca de 30 minutos. Deve ficar um pouco húmido. Faça o teste do palito junto ao aro da forma: se sair seco, está pronto." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 363, unit: "kcal" },
      protein: { amount: 11.2, unit: "g" },
      fat: { amount: 17.4, unit: "g" },
      carbohydrates: { amount: 40.5, unit: "g" },
      sugar: { amount: 32.9, unit: "g" },
      fiber: { amount: 0.3, unit: "g" },
      sodium: { amount: 270, unit: "mg" }
    },
    ingredients: [
      { name: "Açúcar", amount: 240, unit: "g", original: "240 g de açúcar" },
      { name: "Ovos", amount: 3, unit: "unid", original: "3 ovos" },
      { name: "Gemas", amount: 13, unit: "unid", original: "13 gemas" },
      { name: "Farinha sem fermento", amount: 75, unit: "g", original: "75 g de farinha sem fermento" },
      { name: "Fermento", amount: 0.5, unit: "colher de café", original: "1/2 c. de café de fermento" },
      { name: "Manteiga", amount: null, unit: "q.b.", original: "Manteiga para untar" },
      { name: "Farinha", amount: null, unit: "q.b.", original: "Farinha para polvilhar" }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_crumble_marmelo",
    name: "Crumble de Marmelo",
    image: null,
    prepTime: 45,
    preparationMinutes: 10,
    cookingMinutes: 25,
    servings: 6,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: ["vegetarian"],
    cuisines: ["portuguesa", "britânica"],
    dishTypes: ["sobremesa"],
    flags: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["sobremesa", "fácil", "outono", "reconfortante"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "Uma sobremesa reconfortante que combina o sabor suave do marmelo com a crocância dourada do crumble.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Amasse a farinha, o açúcar e a manteiga até ficar com a consistência de areia. Reserve." },
          { number: 2, step: "Descasque os marmelos, corte-os às fatias e regue com sumo de limão." },
          { number: 3, step: "Num pirex untado com manteiga, disponha as fatias de marmelo, pedaços de manteiga e polvilhe com açúcar e canela e miolo de noz." },
          { number: 4, step: "Por fim, ponha a massa esfarelada a cobrir os marmelos. Leve ao forno a 180°C, mais ou menos durante 25 minutos ou até a massa ficar dourada." },
          { number: 5, step: "Pode servir a acompanhar com natas batidas ou uma bola de gelado de nata." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 396, unit: "kcal" },
      protein: { amount: 4.4, unit: "g" },
      fat: { amount: 24.33, unit: "g" },
      carbohydrates: { amount: 36.82, unit: "g" },
      sugar: { amount: 18.53, unit: "g" },
      fiber: { amount: 5.28, unit: "g" },
      sodium: { amount: 20, unit: "mg" }
    },
    ingredients: [
      { name: "Farinha de trigo", amount: 150, unit: "g", original: "150 g de farinha de trigo" },
      { name: "Manteiga", amount: 80, unit: "g", original: "80 g de manteiga amolecida" },
      { name: "Açúcar mascavado", amount: 50, unit: "g", original: "50 g de açúcar mascavado" },
      { name: "Marmelo", amount: 2, unit: "unid", original: "2 marmelos às fatias" },
      { name: "Sumo de limão", amount: null, unit: "q.b.", original: "Sumo de limão q.b." },
      { name: "Açúcar mascavado", amount: 1, unit: "colher de sopa", original: "1 c.sopa de açúcar mascavado" },
      { name: "Canela em pó", amount: 1, unit: "colher de chá", original: "1 c. chá de canela em pó" },
      { name: "Manteiga", amount: 50, unit: "g", original: "50 g de manteiga em pedaços" },
      { name: "Miolo de noz", amount: 50, unit: "g", original: "50 g de miolo de noz picado" },
      { name: "Iogurte grego", amount: null, unit: "q.b.", original: "Iogurte grego natural q.b." }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_risoto_marisco",
    name: "Risoto de Marisco",
    image: null,
    prepTime: 35,
    preparationMinutes: 15,
    cookingMinutes: 20,
    servings: 6,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: [],
    cuisines: ["portuguesa", "italiana"],
    dishTypes: ["prato principal", "risoto"],
    flags: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["marisco", "intermediário", "elegante", "família"],
    skillLevel: "intermediate",
    leftoverFriendly: false,
    summary: "O risoto de marisco é um prato cremoso e sofisticado, onde a textura envolvente do arroz se combina com o sabor delicado do mar.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Leve ao lume o caldo de peixe com o vinho branco e deixe ferver." },
          { number: 2, step: "Reduza o lume, junte as gambas tigre sem casca e deixe cozinhar durante 2 minutos. Acrescente as lulas limpas e deixe cozinhar por mais 1 minuto. Retire o marisco e reserve." },
          { number: 3, step: "No mesmo caldo, adicione o miolo de mexilhão e o miolo de amêijoa. Deixe ferver, tape e cozinhe durante cerca de 3 minutos. Reserve o marisco e o caldo." },
          { number: 4, step: "Noutro tacho, aqueça o azeite e refogue a cebola e o tomate picados durante cerca de 10 minutos." },
          { number: 5, step: "Junte o arroz arbóreo, mexa e acrescente uma concha de caldo quente. Envolva e vá adicionando o caldo, uma concha de cada vez, mexendo sempre, até o arroz ficar cremoso. Tempere com o sal e a pimenta." },
          { number: 6, step: "Adicione o marisco reservado, envolva, tape e deixe repousar por 5 minutos." },
          { number: 7, step: "Sirva o risoto de marisco polvilhado com salsa picada." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 485, unit: "kcal" },
      protein: { amount: 32, unit: "g" },
      fat: { amount: 16, unit: "g" },
      carbohydrates: { amount: 48, unit: "g" },
      sugar: { amount: 4, unit: "g" },
      fiber: { amount: 2, unit: "g" },
      sodium: { amount: 720, unit: "mg" }
    },
    ingredients: [
      { name: "Caldo de peixe", amount: 800, unit: "ml", original: "800 ml de caldo de peixe" },
      { name: "Vinho branco", amount: 200, unit: "ml", original: "200 ml de vinho branco" },
      { name: "Gambas tigre", amount: 150, unit: "g", original: "150 g de gambas tigre sem casca" },
      { name: "Lulas", amount: 6, unit: "unid", original: "6 lulas limpas" },
      { name: "Mexilhão", amount: 300, unit: "g", original: "300 g de miolo de mexilhão" },
      { name: "Amêijoas", amount: 150, unit: "g", original: "150 g de miolo de amêijoas" },
      { name: "Azeite", amount: 2, unit: "colher de sopa", original: "2 c. sopa de azeite" },
      { name: "Cebola", amount: 1, unit: "unid", original: "1 cebola picada" },
      { name: "Tomate", amount: 1, unit: "unid", original: "1 tomate picado" },
      { name: "Arroz arbóreo", amount: 300, unit: "g", original: "300 g de arroz arbóreo" },
      { name: "Sal", amount: 1, unit: "colher de café", original: "1 c. café de sal" },
      { name: "Salsa", amount: null, unit: "q.b.", original: "Salsa picada q.b." },
      { name: "Pimenta", amount: null, unit: "q.b.", original: "Pimenta q.b." }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_creme_feijao_espinafres",
    name: "Creme de Feijão Branco e Espinafres",
    image: null,
    prepTime: 20,
    preparationMinutes: 16,
    cookingMinutes: 4,
    servings: 5,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: ["vegan", "vegetarian"],
    cuisines: ["portuguesa"],
    dishTypes: ["sopa", "prato principal"],
    flags: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: true,
      veryPopular: false,
      whole30: false,
    },
    tags: ["sopa", "vegan", "saudável", "bebé", "fácil"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "O creme de feijão branco e espinafres é uma refeição completa e nutritiva para bebés dos 10-12 meses.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Lave muito bem os hortícolas." },
          { number: 2, step: "Descasque a abóbora e a cebola e corte em pedaços." },
          { number: 3, step: "Coloque todos os ingredientes no tacho com a água." },
          { number: 4, step: "Cozinhe durante cerca de 15-20 minutos até os legumes ficarem macios." },
          { number: 5, step: "Triture tudo com a varinha mágica até obter um creme homogéneo." },
          { number: 6, step: "Adicione um fio de azeite virgem extra antes de servir." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 36, unit: "kcal" },
      protein: { amount: 1.5, unit: "g" },
      fat: { amount: 1.7, unit: "g" },
      carbohydrates: { amount: 3.4, unit: "g" },
      sugar: { amount: 0.7, unit: "g" },
      fiber: { amount: 1.7, unit: "g" },
      sodium: { amount: 0, unit: "mg" }
    },
    ingredients: [
      { name: "Abóbora", amount: 180, unit: "g", original: "180 g de abóbora" },
      { name: "Cebola", amount: 80, unit: "g", original: "80 g de cebola" },
      { name: "Espinafres", amount: 30, unit: "g", original: "30 g de espinafres" },
      { name: "Feijão branco", amount: 120, unit: "g", original: "120 g de feijão branco demolhado e cozido" },
      { name: "Água", amount: 200, unit: "g", original: "200 g de água" },
      { name: "Azeite virgem extra", amount: null, unit: "q.b.", original: "Azeite virgem extra" }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  },
  {
    id: "native_massa_espinafres",
    name: "Massa com Espinafres",
    image: null,
    prepTime: 30,
    preparationMinutes: 15,
    cookingMinutes: 15,
    servings: 4,
    pricePerServing: null,
    cheap: false,
    healthScore: null,
    spoonacularScore: null,
    diets: ["vegetarian"],
    cuisines: ["portuguesa", "italiana"],
    dishTypes: ["prato principal", "massa"],
    flags: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
      ketogenic: false,
      lowFodmap: false,
      sustainable: false,
      veryHealthy: false,
      veryPopular: false,
      whole30: false,
    },
    tags: ["massa", "vegetariano", "fácil", "rápido"],
    skillLevel: "beginner",
    leftoverFriendly: false,
    summary: "Simples, rápida e saborosa— esta massa com espinafres é uma ótima opção para um almoço ou acompanhamento.",
    instructions: null,
    analyzedInstructions: [
      {
        name: "Preparação",
        steps: [
          { number: 1, step: "Coloque uma panela com água, sal e um fio de azeite ao lume. Quando a água estiver a ferver, junte a massa e cozinhe-a conforme as indicações da embalagem." },
          { number: 2, step: "Numa frigideira, refogue as cebolas cortadas em meias-luas num pouco de azeite até ficarem translúcidas. Em seguida junte os espinafres, deixe cozinhar por 2 minutos, tempere com sal e pimenta, adicione as natas e misture." },
          { number: 3, step: "Por fim, escorra a massa e envolva-a bem na mistura anterior. Rectifique os temperos e sirva de imediato." }
        ]
      }
    ],
    nutrition: {
      calories: { amount: 194, unit: "kcal" },
      protein: { amount: 5.94, unit: "g" },
      fat: { amount: 4.78, unit: "g" },
      carbohydrates: { amount: 30.5, unit: "g" },
      sugar: { amount: 2.05, unit: "g" },
      fiber: { amount: 2.87, unit: "g" },
      sodium: { amount: 560, unit: "mg" }
    },
    ingredients: [
      { name: "Azeite", amount: 1, unit: "colher de sopa", original: "1 c. sopa de azeite" },
      { name: "Cebola", amount: 1, unit: "unid", original: "1 cebola laminada" },
      { name: "Espinafres frescos", amount: 2, unit: "cháv.", original: "2 cháv. de espinafres frescos" },
      { name: "Sal", amount: 1, unit: "colher de café", original: "1 c. café de sal" },
      { name: "Pimenta", amount: null, unit: "q.b.", original: "Pimenta q.b." },
      { name: "Natas de soja", amount: 100, unit: "ml", original: "100 ml de natas de soja" },
      { name: "Esparguete", amount: 160, unit: "g", original: "160 g de esparguete cozido" }
    ],
    sourceName: "Continente",
    sourceUrl: "https://feed.continente.pt/receitas",
    importSource: "native",
    createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
  }
];

export const seedRecipes = async () => {
  try {
    const recipesRef = collection(db, "recipes");
    
    console.log("A sincronizar receitas...");
    
    // Always upsert all recipes from the seed file
    for (const recipe of recipes) {
      const recipeRef = doc(db, "recipes", recipe.id);
      const existingSnap = await getDoc(recipeRef);
      
      if (existingSnap.exists()) {
        // Recipe exists - always update with latest data from seed
        const existingData = existingSnap.data();
        console.log(`A atualizar receita: ${recipe.name}`);
        await setDoc(recipeRef, {
          ...recipe,
          // Preserve the original creation timestamp
          createdAtTimestamp: existingData.createdAtTimestamp || new Date().toISOString(),
          createdAt: existingData.createdAt || recipe.createdAt,
          updatedAt: new Date().toISOString(),
          searchText: `${recipe.name} ${(recipe.tags || []).join(" ")} ${(recipe.dishTypes || []).join(" ")}`
        }, { merge: true });
        console.log(`Receita atualizada: ${recipe.name}`);
      } else {
        // Recipe doesn't exist - create it
        console.log(`A adicionar nova receita: ${recipe.name}`);
        await setDoc(recipeRef, {
          ...recipe,
          createdAtTimestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          searchText: `${recipe.name} ${(recipe.tags || []).join(" ")} ${(recipe.dishTypes || []).join(" ")}`
        });
        console.log(`Receita adicionada: ${recipe.name}`);
      }
    }
    console.log("Sincronização de receitas concluída!");
  } catch (error) {
    console.warn("Aviso ao sincronizar receitas:", error.message);
  }
};

