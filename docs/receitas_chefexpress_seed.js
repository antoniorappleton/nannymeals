// Receitas do Livro Chef Express - 60 receitas por categoria
// Fonte: Livro_Receitas_Chefexpress.pdf
// Categorias: Peixe (10), Carne (10), Vegetariano (10), Massa (10), Sopa (10), Sobremesa (10)

const chefexpressRecipes = [

  // ===========================
  // CATEGORIA: PEIXE
  // ===========================
  {
    id: "ce_pescada_espiritual",
    name: "Pescada espiritual",
    category: "Peixe",
    servings: 6,
    time: "35 min",
    page: 59,
    tags: ["peixe", "forno", "cremoso"],
    ingredients: [
      { name: "medalhões de pescada", amount: 400, unit: "g" },
      { name: "sal", amount: 1, unit: "c. sobremesa" },
      { name: "cebolas", amount: 300, unit: "g" },
      { name: "dentes de alho", amount: 20, unit: "g" },
      { name: "cenoura", amount: 300, unit: "g" },
      { name: "azeite", amount: 40, unit: "g" },
      { name: "pão de forma integral sem côdea", amount: 150, unit: "g" },
      { name: "leite magro", amount: 300, unit: "g" },
      { name: "creme culinário de soja", amount: 180, unit: "g" },
      { name: "azeite (para o molho)", amount: 20, unit: "g" },
      { name: "farinha tipo 55", amount: 40, unit: "g" },
      { name: "casca de limão", amount: 3, unit: "tiras" },
      { name: "sal (para o molho)", amount: 1, unit: "c. chá" },
      { name: "pimenta moída", amount: 1, unit: "q.b." },
      { name: "noz-moscada", amount: 1, unit: "c. chá" },
      { name: "amêndoa laminada", amount: 20, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 180°C na função grill.",
      "Tempere os medalhões de pescada com metade do sal. Reserve.",
      "Coloque as cebolas cortadas em pedaços, os dentes de alho e as cenouras em rodelas no copo. Pique 5 segundos, na velocidade 5.",
      "Raspe as paredes do copo com a espátula, junte o azeite e introduza o cesto com os medalhões de pescada temperados. Cozinhe 10 minutos, a 100°C, na velocidade 2.",
      "Retire o cesto com a ajuda do cabo da espátula e triture o molho durante 10 segundos, na velocidade 7.",
      "Volte a raspar as paredes do copo com a espátula, tempere com o restante sal e adicione o pão esfarelado e o peixe cozinhado. Mexa com a espátula e programe mais 3 minutos, a 100°C, na velocidade 2.",
      "Mude o cozinhado para um tabuleiro de forno e reserve.",
      "Deite todos os ingredientes para o molho no copo, sem o lavar, e programe 7 minutos, a 90°C, na velocidade 4.",
      "Envolva cerca de metade do molho na mistura de peixe e cenoura e, por cima, espalhe o restante.",
      "Salpique com as amêndoas e leve a gratinar no forno 25 minutos."
    ],
    nutrition: { calories: 379, fat: "21g", saturated: "3.5g", salt: "2.2g", serving: "300g" }
  },

  {
    id: "ce_bacalhau_forno_espinafres",
    name: "Bacalhau no forno com espinafres",
    category: "Peixe",
    servings: 6,
    time: "20 min",
    page: 59,
    tags: ["bacalhau", "forno", "espinafres"],
    ingredients: [
      { name: "cebola", amount: 200, unit: "g" },
      { name: "azeite", amount: 30, unit: "g" },
      { name: "alho-francês em rodelas", amount: 250, unit: "g" },
      { name: "bacalhau desfiado congelado", amount: 500, unit: "g" },
      { name: "puré de batata congelado", amount: 1, unit: "kg" },
      { name: "folhas de espinafres", amount: 120, unit: "g" },
      { name: "sementes de sésamo Pura Vida", amount: 2, unit: "c. sopa" }
    ],
    instructions: [
      "Pré-aqueça o forno a 200°C, com as funções calor circulante e grill.",
      "Introduza a cebola em quartos no copo e pique 5 segundos, na velocidade 5.",
      "Raspe as paredes do copo com a espátula e junte o azeite e o alho-francês.",
      "Introduza o cesto com as lascas de bacalhau já descongeladas e cozinhe 10 minutos, a 100°C, na velocidade 1 inversa.",
      "Retire o cesto com a ajuda da espátula e introduza o puré, já descongelado, no copo. Adicione o bacalhau cozinhado e mexa com a espátula.",
      "Disponha as folhas de espinafres na vaporeira e encaixe-a no copo. Programe mais 8 minutos, a 100°C, na velocidade 3 inversa.",
      "Misture o cozinhado de bacalhau e as folhas de espinafres num tabuleiro de louça e polvilhe com as sementes de sésamo.",
      "Leve ao forno cerca de 20 minutos ou até gratinar."
    ],
    nutrition: { calories: 271, fat: "12g", saturated: "5.4g", salt: "1.0g", serving: "260g" }
  },

  {
    id: "ce_arroz_polvo_malandrinho",
    name: "Arroz de polvo malandrinho",
    category: "Peixe",
    servings: 6,
    time: "45 min",
    page: 61,
    tags: ["polvo", "arroz", "malandrinho"],
    ingredients: [
      { name: "cebola", amount: 150, unit: "g" },
      { name: "alho-francês em rodelas", amount: 150, unit: "g" },
      { name: "dentes de alho", amount: 2, unit: "unid" },
      { name: "malagueta fresca", amount: 1, unit: "unid" },
      { name: "azeite", amount: 30, unit: "g" },
      { name: "polvo de mar", amount: 750, unit: "g" },
      { name: "tomate", amount: 350, unit: "g" },
      { name: "folha de louro", amount: 1, unit: "unid" },
      { name: "arroz carolino", amount: 300, unit: "g" },
      { name: "água", amount: 1, unit: "q.b." },
      { name: "pimenta moída", amount: 1, unit: "q.b." },
      { name: "limão (sumo)", amount: 0.5, unit: "unid" },
      { name: "salsa picada", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque no copo a cebola cortada em pedaços, o alho-francês, os dentes de alho e a malagueta limpa de sementes. Pique 5 segundos na velocidade 5.",
      "Raspe as paredes do copo com a espátula, junte o azeite e cozinhe 5 minutos, a 100°C, na velocidade 2.",
      "Adicione o polvo cortado em pedaços, mexa com a espátula e programe 25 minutos, a 100°C, na velocidade 1 inversa.",
      "Junte o tomate cortado em cubos, a folha de louro e o arroz. Volte a mexer com a ajuda da espátula, junte água até chegar ao nível máximo, e cozinhe mais 15 minutos, a 100°C, na velocidade 1 inversa.",
      "Mude para o recipiente onde vai servir, tempere com pimenta, regue com o sumo do limão e adicione folhas de salsa picada. Sirva de imediato."
    ],
    nutrition: { calories: 358, fat: "7.6g", saturated: "1.4g", salt: "<1.0g", serving: "300g" }
  },

  {
    id: "ce_lulas_cenoura",
    name: "Lulas com cenoura",
    category: "Peixe",
    servings: 6,
    time: "32 min",
    page: 61,
    tags: ["lulas", "cenoura", "sem glúten"],
    ingredients: [
      { name: "lulas congeladas", amount: 750, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "alho-francês em rodelas", amount: 100, unit: "g" },
      { name: "cenoura", amount: 200, unit: "g" },
      { name: "azeite", amount: 30, unit: "g" },
      { name: "vinho branco", amount: 100, unit: "g" },
      { name: "polpa de tomate", amount: 210, unit: "g" },
      { name: "sal", amount: 1, unit: "c. sobremesa" },
      { name: "salsa", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Deixe as lulas a descongelar num escorredor.",
      "No copo, coloque a cebola, o alho-francês e a cenoura em pedaços e pique 10 segundos, na velocidade 5.",
      "Raspe as paredes do copo com a espátula, junte o azeite e cozinhe 7 minutos, a 100°C, na velocidade 2.",
      "Adicione o vinho branco, a polpa de tomate e o sal e programe mais 5 minutos, a 100°C, na velocidade 2.",
      "Introduza no copo as lulas, bem escorridas e recheadas com os próprios tentáculos, e cozinhe mais 20 minutos, a 100°C, na velocidade 1 inversa e com o cesto sobre a tampa.",
      "Mude para o recipiente onde vai servir e polvilhe com salsa picada."
    ],
    nutrition: { calories: 172, fat: "7.1g", saturated: "1.2g", salt: "0.6g", serving: "200g" }
  },

  {
    id: "ce_bacalhau_gratinado",
    name: "Bacalhau gratinado",
    category: "Peixe",
    servings: 6,
    time: "45 min",
    page: 63,
    tags: ["bacalhau", "gratinado", "forno"],
    ingredients: [
      { name: "cebola", amount: 80, unit: "g" },
      { name: "alho-francês em rodelas", amount: 50, unit: "g" },
      { name: "courgette", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "g" },
      { name: "medalhões de pescada", amount: 150, unit: "g" },
      { name: "sal", amount: 1, unit: "c. sobremesa" },
      { name: "ovos M", amount: 3, unit: "unid" },
      { name: "leite magro", amount: 500, unit: "g" },
      { name: "farinha tipo 55", amount: 50, unit: "g" },
      { name: "noz-moscada", amount: 1, unit: "c. chá" },
      { name: "pimenta moída", amount: 1, unit: "q.b." },
      { name: "limão (raspa)", amount: 1, unit: "unid" }
    ],
    instructions: [
      "Pré-aqueça o forno a 185°C, na função estática.",
      "Junte a cebola, o alho-francês e a courgette cortada, e pique 7 segundos, na velocidade 5. Raspe as paredes do copo com a espátula, adicione o azeite e cozinhe 5 minutos, a 100°C, na velocidade 2, sem copo medidor.",
      "Junte os medalhões de pescada em pedaços e tempere com a colher de sobremesa de sal. Cozinhe mais 5 minutos, a 100°C, na velocidade 1, sem copo medidor.",
      "Parta os ovos e separe as gemas das claras. Bata as gemas com 500g de leite magro.",
      "Mistura de gemas: junte 50g de farinha tipo 55, 1 c. chá de noz-moscada, pimenta moída q.b. e programe 10 minutos, a 90°C, na velocidade 3.",
      "Mude o preparado para uma tigela, adicione a raspa de limão e reserve.",
      "Lave o copo; junte 1 c. café de sal e bata as claras durante 3 minutos, na velocidade 3, sem copo medidor.",
      "Envolva delicadamente as claras batidas no molho de peixe, coloque na forma e leve ao forno, pré-aquecido a 185°C, na função estática, 40 minutos.",
      "Pré-aqueça o forno a 185°C, na função calor estático. Junte a cebola, o alho-francês e a courgette cortada e pique 7 segundos, na velocidade . Raspe as paredes do copo com a espátula, adicione o azeite e cozinhe 5 minutos, a 100°C, na velocidade 2."
    ],
    nutrition: { calories: 163, fat: "8.4g", saturated: "1.7g", salt: "1.5g", serving: "180g" }
  },

  {
    id: "ce_caldeirada_bacalhau",
    name: "Caldeirada de bacalhau",
    category: "Peixe",
    servings: 6,
    time: "40 min",
    page: 65,
    tags: ["bacalhau", "caldeirada", "tradicional"],
    ingredients: [
      { name: "cebola", amount: 200, unit: "g" },
      { name: "dentes de alho", amount: 4, unit: "unid" },
      { name: "azeite", amount: 40, unit: "g" },
      { name: "tomate", amount: 400, unit: "g" },
      { name: "pimento vermelho em tiras", amount: 150, unit: "g" },
      { name: "pimento verde em tiras", amount: 150, unit: "g" },
      { name: "batata em rodelas", amount: 500, unit: "g" },
      { name: "bacalhau demolhado em lascas", amount: 600, unit: "g" },
      { name: "água", amount: 200, unit: "ml" },
      { name: "sal", amount: 1, unit: "q.b." },
      { name: "pimenta", amount: 1, unit: "q.b." },
      { name: "salsa picada", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e os dentes de alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione o tomate, os pimentos, a batata em rodelas, o bacalhau e a água.",
      "Tempere com sal e pimenta. Cozinhe 25 minutos, 100°C, velocidade 1 inversa.",
      "Sirva polvilhado com salsa picada."
    ],
    nutrition: { calories: 290, fat: "8g", saturated: "1.2g", salt: "1.8g", serving: "350g" }
  },

  {
    id: "ce_arroz_tamboril",
    name: "Arroz de tamboril",
    category: "Peixe",
    servings: 6,
    time: "40 min",
    page: 69,
    tags: ["tamboril", "arroz", "malandrinho"],
    ingredients: [
      { name: "cebola", amount: 200, unit: "g" },
      { name: "dentes de alho", amount: 3, unit: "unid" },
      { name: "azeite", amount: 40, unit: "g" },
      { name: "camarão descascado", amount: 200, unit: "g" },
      { name: "tamboril em pedaços", amount: 600, unit: "g" },
      { name: "polpa de tomate", amount: 200, unit: "g" },
      { name: "vinho branco", amount: 100, unit: "ml" },
      { name: "arroz carolino", amount: 300, unit: "g" },
      { name: "água", amount: 600, unit: "ml" },
      { name: "sal", amount: 1, unit: "q.b." },
      { name: "coentros picados", amount: 1, unit: "q.b." },
      { name: "piri-piri", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e os alhos no copo, pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione o tamboril, o camarão, a polpa de tomate e o vinho branco. Cozinhe 10 minutos, 100°C, velocidade 1 inversa.",
      "Adicione o arroz, a água, sal e piri-piri. Cozinhe 15 minutos, 100°C, velocidade 1 inversa.",
      "Sirva polvilhado com coentros picados."
    ],
    nutrition: { calories: 340, fat: "7g", saturated: "1.0g", salt: "1.5g", serving: "320g" }
  },

  {
    id: "ce_salmao_papelote",
    name: "Salmão em papelote",
    category: "Peixe",
    servings: 6,
    time: "25 min",
    page: 73,
    tags: ["salmão", "papelote", "saudável"],
    ingredients: [
      { name: "lombos de salmão", amount: 6, unit: "unid" },
      { name: "limão (sumo e raspa)", amount: 1, unit: "unid" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal", amount: 1, unit: "q.b." },
      { name: "pimenta", amount: 1, unit: "q.b." },
      { name: "aneto fresco", amount: 1, unit: "q.b." },
      { name: "courgette em juliana", amount: 200, unit: "g" },
      { name: "cenoura em juliana", amount: 150, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 200°C.",
      "Corte 6 folhas de papel de alumínio. Coloque cada lombo de salmão sobre uma folha.",
      "Tempere o salmão com sal, pimenta, sumo e raspa de limão, azeite e aneto.",
      "Disponha a courgette e a cenoura em juliana por cima de cada lombo.",
      "Feche os papelotes e leve ao forno 15 a 18 minutos.",
      "Sirva de imediato dentro dos papelotes."
    ],
    nutrition: { calories: 285, fat: "16g", saturated: "3.0g", salt: "0.8g", serving: "250g" }
  },

  {
    id: "ce_pasteis_bacalhau",
    name: "Pastéis de bacalhau",
    category: "Peixe",
    servings: 6,
    time: "45 min",
    page: 81,
    tags: ["bacalhau", "pastéis", "tradicional"],
    ingredients: [
      { name: "bacalhau demolhado", amount: 400, unit: "g" },
      { name: "batata cozida e esmagada", amount: 500, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "ovos", amount: 3, unit: "unid" },
      { name: "salsa picada", amount: 1, unit: "q.b." },
      { name: "pimenta", amount: 1, unit: "q.b." },
      { name: "noz-moscada", amount: 1, unit: "q.b." },
      { name: "óleo para fritar", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coza o bacalhau e desfie-o, retirando peles e espinhas.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Misture o bacalhau desfiado, o puré de batata, a cebola picada, os ovos e a salsa.",
      "Tempere com pimenta e noz-moscada. Misture bem.",
      "Forme os pastéis com duas colheres de sopa.",
      "Frite em óleo quente até ficarem dourados. Escorra em papel absorvente e sirva."
    ],
    nutrition: { calories: 265, fat: "12g", saturated: "1.8g", salt: "1.4g", serving: "200g" }
  },

  {
    id: "ce_dourada_vapor_laranja",
    name: "Dourada ao vapor com laranja e aneto",
    category: "Peixe",
    servings: 6,
    time: "25 min",
    page: 66,
    tags: ["dourada", "vapor", "laranja"],
    ingredients: [
      { name: "dourada em postas", amount: 800, unit: "g" },
      { name: "laranja (sumo e raspa)", amount: 1, unit: "unid" },
      { name: "aneto fresco", amount: 1, unit: "q.b." },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal", amount: 1, unit: "q.b." },
      { name: "pimenta", amount: 1, unit: "q.b." },
      { name: "água (para o copo)", amount: 500, unit: "ml" }
    ],
    instructions: [
      "Coloque 500ml de água no copo.",
      "Tempere as postas de dourada com sal, pimenta, sumo e raspa de laranja e azeite.",
      "Disponha o peixe na vaporeira com o aneto fresco.",
      "Encaixe a vaporeira no copo e programe 20 minutos, Varoma, velocidade 2.",
      "Sirva de imediato com salada verde."
    ],
    nutrition: { calories: 210, fat: "9g", saturated: "1.5g", salt: "0.7g", serving: "220g" }
  },

  // ===========================
  // CATEGORIA: CARNE
  // ===========================
  {
    id: "ce_almondegas_peru_tomate",
    name: "Almôndegas de peru com molho de tomate",
    category: "Carne",
    servings: 6,
    time: "35 min",
    page: 87,
    tags: ["peru", "almôndegas", "tomate"],
    ingredients: [
      { name: "carne picada de peru", amount: 600, unit: "g" },
      { name: "pão de forma", amount: 50, unit: "g" },
      { name: "ovo", amount: 1, unit: "unid" },
      { name: "alho em pó", amount: 1, unit: "c. chá" },
      { name: "sal", amount: 1, unit: "q.b." },
      { name: "pimenta", amount: 1, unit: "q.b." },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "tomate triturado", amount: 400, unit: "g" },
      { name: "folha de louro", amount: 1, unit: "unid" },
      { name: "orégãos", amount: 1, unit: "c. chá" }
    ],
    instructions: [
      "Misture a carne picada de peru com o pão de forma esfarelado, o ovo, alho em pó, sal e pimenta.",
      "Forme almôndegas do tamanho de uma noz.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione o tomate triturado, a folha de louro e os orégãos. Cozinhe 5 minutos, 100°C, velocidade 1.",
      "Coloque as almôndegas no cesto e introduza no copo. Cozinhe 15 minutos, 100°C, velocidade 1 inversa.",
      "Sirva as almôndegas cobertas com o molho de tomate."
    ],
    nutrition: { calories: 245, fat: "9g", saturated: "2.0g", salt: "1.2g", serving: "260g" }
  },

  {
    id: "ce_pie_peru_cogumelos",
    name: "Pie de peru com cogumelos e espinafres",
    category: "Carne",
    servings: 6,
    time: "50 min",
    page: 87,
    tags: ["peru", "pie", "cogumelos"],
    ingredients: [
      { name: "peito de peru em cubos", amount: 600, unit: "g" },
      { name: "cogumelos fatiados", amount: 200, unit: "g" },
      { name: "espinafres", amount: 150, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "natas", amount: 200, unit: "ml" },
      { name: "farinha", amount: 30, unit: "g" },
      { name: "sal", amount: 1, unit: "q.b." },
      { name: "pimenta", amount: 1, unit: "q.b." },
      { name: "massa folhada", amount: 400, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 200°C.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione o peru, os cogumelos, os espinafres, a farinha e as natas. Tempere com sal e pimenta.",
      "Cozinhe 15 minutos, 100°C, velocidade 1 inversa.",
      "Transfira o recheio para uma forma. Cubra com a massa folhada.",
      "Leve ao forno 25 minutos até a massa estar dourada."
    ],
    nutrition: { calories: 380, fat: "18g", saturated: "7.0g", salt: "1.5g", serving: "320g" }
  },

  {
    id: "ce_almondegas_molho_tomate",
    name: "Almôndegas com molho de tomate",
    category: "Carne",
    servings: 6,
    time: "35 min",
    page: 89,
    tags: ["almôndegas", "tomate", "clássico"],
    ingredients: [
      { name: "carne picada mista (vaca e porco)", amount: 600, unit: "g" },
      { name: "pão de forma sem côdea", amount: 50, unit: "g" },
      { name: "ovo", amount: 1, unit: "unid" },
      { name: "alho picado", amount: 2, unit: "dentes" },
      { name: "salsa picada", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "tomate pelado", amount: 400, unit: "g" },
      { name: "folha de louro", amount: 1, unit: "unid" }
    ],
    instructions: [
      "Misture a carne picada com o pão de forma esfarelado, o ovo, o alho e a salsa. Tempere com sal e pimenta.",
      "Forme almôndegas do tamanho de uma noz.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione o tomate pelado e a folha de louro. Cozinhe 10 minutos, 100°C, velocidade 1.",
      "Coloque as almôndegas no cesto e cozinhe 15 minutos, 100°C, velocidade 1 inversa.",
      "Sirva com massa ou arroz."
    ],
    nutrition: { calories: 290, fat: "14g", saturated: "4.5g", salt: "1.3g", serving: "270g" }
  },

  {
    id: "ce_favas_coentros_salpicao",
    name: "Favas com coentros e salpicão",
    category: "Carne",
    servings: 6,
    time: "30 min",
    page: 91,
    tags: ["favas", "salpicão", "tradicional"],
    ingredients: [
      { name: "favas congeladas", amount: 600, unit: "g" },
      { name: "salpicão em rodelas", amount: 200, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "alho", amount: 2, unit: "dentes" },
      { name: "coentros frescos", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e o alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione as favas e o salpicão. Cozinhe 15 minutos, 100°C, velocidade 1 inversa.",
      "Tempere com sal e pimenta.",
      "Sirva polvilhado com coentros frescos picados."
    ],
    nutrition: { calories: 275, fat: "11g", saturated: "3.0g", salt: "1.8g", serving: "250g" }
  },

  {
    id: "ce_fusilli_picado_carne",
    name: "Fusilli com picado de carne",
    category: "Carne",
    servings: 6,
    time: "35 min",
    page: 93,
    tags: ["massa", "carne picada", "fusilli"],
    ingredients: [
      { name: "fusilli", amount: 400, unit: "g" },
      { name: "carne picada de vaca", amount: 400, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "alho", amount: 2, unit: "dentes" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "tomate pelado", amount: 400, unit: "g" },
      { name: "manjericão seco", amount: 1, unit: "c. chá" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e o alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione a carne picada e cozinhe 10 minutos, 100°C, velocidade 1 inversa.",
      "Adicione o tomate pelado e o manjericão. Cozinhe 10 minutos, 100°C, velocidade 1.",
      "Coza o fusilli conforme indicações da embalagem. Escorra e misture com o molho.",
      "Sirva com queijo ralado."
    ],
    nutrition: { calories: 420, fat: "12g", saturated: "4.0g", salt: "1.2g", serving: "300g" }
  },

  {
    id: "ce_caril_peru_maca_espinafres",
    name: "Caril de peru com maçã e espinafres",
    category: "Carne",
    servings: 6,
    time: "30 min",
    page: 95,
    tags: ["peru", "caril", "maçã"],
    ingredients: [
      { name: "peito de peru em tiras", amount: 600, unit: "g" },
      { name: "maçã em cubos", amount: 200, unit: "g" },
      { name: "espinafres frescos", amount: 150, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "leite de coco", amount: 200, unit: "ml" },
      { name: "pasta de caril", amount: 2, unit: "c. sopa" },
      { name: "sal", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e a pasta de caril. Cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione o peru, a maçã e o leite de coco. Cozinhe 20 minutos, 100°C, velocidade 1 inversa.",
      "Adicione os espinafres nos últimos 5 minutos de cozedura.",
      "Sirva com arroz basmati."
    ],
    nutrition: { calories: 310, fat: "12g", saturated: "6.0g", salt: "1.0g", serving: "280g" }
  },

  {
    id: "ce_salsichas_couve_lombarda",
    name: "Salsichas frescas em couve-lombarda",
    category: "Carne",
    servings: 6,
    time: "35 min",
    page: 97,
    tags: ["salsichas", "couve", "lombarda"],
    ingredients: [
      { name: "salsichas frescas de porco", amount: 600, unit: "g" },
      { name: "couve-lombarda", amount: 600, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "vinho branco", amount: 100, unit: "ml" },
      { name: "alho", amount: 2, unit: "dentes" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e o alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione as salsichas e o vinho branco. Cozinhe 10 minutos, 100°C, velocidade 1 inversa.",
      "Adicione a couve-lombarda cortada em juliana. Cozinhe mais 15 minutos, 100°C, velocidade 1 inversa.",
      "Tempere com sal e pimenta e sirva."
    ],
    nutrition: { calories: 350, fat: "22g", saturated: "7.5g", salt: "1.8g", serving: "290g" }
  },

  {
    id: "ce_bola_frango_legumes",
    name: "Bola de frango com legumes",
    category: "Carne",
    servings: 8,
    time: "60 min",
    page: 99,
    tags: ["frango", "bola", "pão"],
    ingredients: [
      { name: "peito de frango em cubos", amount: 400, unit: "g" },
      { name: "pimento vermelho", amount: 100, unit: "g" },
      { name: "courgette em cubos", amount: 100, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "massa de pão (comprada)", amount: 500, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 200°C.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite, o frango, o pimento e a courgette. Cozinhe 15 minutos, 100°C, velocidade 1 inversa. Tempere com sal e pimenta.",
      "Estenda a massa de pão em forma de rectângulo. Disponha o recheio no centro.",
      "Feche a massa em forma de bola e coloque numa forma de forno untada.",
      "Leve ao forno 30 a 35 minutos até a massa estar dourada."
    ],
    nutrition: { calories: 310, fat: "8g", saturated: "1.5g", salt: "1.3g", serving: "220g" }
  },

  {
    id: "ce_jardineira_vaca",
    name: "Jardineira de vaca",
    category: "Carne",
    servings: 6,
    time: "50 min",
    page: 99,
    tags: ["vaca", "jardineira", "legumes"],
    ingredients: [
      { name: "carne de vaca em cubos", amount: 600, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "alho", amount: 2, unit: "dentes" },
      { name: "azeite", amount: 40, unit: "ml" },
      { name: "cenoura em rodelas", amount: 200, unit: "g" },
      { name: "batata em cubos", amount: 300, unit: "g" },
      { name: "ervilhas congeladas", amount: 150, unit: "g" },
      { name: "tomate pelado", amount: 300, unit: "g" },
      { name: "vinho tinto", amount: 100, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e o alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione a carne e o vinho tinto. Cozinhe 20 minutos, 100°C, velocidade 1 inversa.",
      "Adicione o tomate, a cenoura e a batata. Cozinhe mais 20 minutos, 100°C, velocidade 1 inversa.",
      "Adicione as ervilhas nos últimos 5 minutos. Tempere com sal e pimenta e sirva."
    ],
    nutrition: { calories: 360, fat: "14g", saturated: "4.5g", salt: "1.4g", serving: "320g" }
  },

  {
    id: "ce_carne_porco_castanhas_ameijoas",
    name: "Carne de porco com castanhas e amêijoas",
    category: "Carne",
    servings: 6,
    time: "45 min",
    page: 101,
    tags: ["porco", "amêijoas", "castanhas"],
    ingredients: [
      { name: "carne de porco em cubos", amount: 600, unit: "g" },
      { name: "amêijoas", amount: 300, unit: "g" },
      { name: "castanhas cozidas", amount: 200, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "alho", amount: 3, unit: "dentes" },
      { name: "azeite", amount: 40, unit: "ml" },
      { name: "vinho branco", amount: 150, unit: "ml" },
      { name: "coentros", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e o alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione a carne de porco e o vinho branco. Cozinhe 25 minutos, 100°C, velocidade 1 inversa.",
      "Adicione as amêijoas e as castanhas. Cozinhe mais 5 minutos, 100°C, velocidade 1 inversa.",
      "Tempere com sal e pimenta. Sirva polvilhado com coentros."
    ],
    nutrition: { calories: 380, fat: "16g", saturated: "4.5g", salt: "2.0g", serving: "310g" }
  },

  // ===========================
  // CATEGORIA: VEGETARIANO
  // ===========================
  {
    id: "ce_empadas_espinafres",
    name: "Empadas de espinafres",
    category: "Vegetariano",
    servings: 12,
    time: "50 min",
    page: 113,
    tags: ["espinafres", "empadas", "vegetariano"],
    ingredients: [
      { name: "espinafres frescos", amount: 300, unit: "g" },
      { name: "requeijão", amount: 200, unit: "g" },
      { name: "ovos", amount: 2, unit: "unid" },
      { name: "parmesão ralado", amount: 50, unit: "g" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "noz-moscada", amount: 1, unit: "q.b." },
      { name: "massa para empadas (comprada)", amount: 500, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 180°C.",
      "Cozinhe os espinafres brevemente em água a ferver. Escorra e pique.",
      "Misture os espinafres com o requeijão, os ovos e o parmesão. Tempere com sal, pimenta e noz-moscada.",
      "Forre forminhas de empada com a massa. Coloque o recheio.",
      "Cubra com um círculo de massa. Pincele com ovo batido.",
      "Leve ao forno 20 a 25 minutos até dourarem."
    ],
    nutrition: { calories: 230, fat: "12g", saturated: "5.0g", salt: "1.0g", serving: "150g" }
  },

  {
    id: "ce_risotto_espargos_cogumelos",
    name: "Risotto de espargos e cogumelos",
    category: "Vegetariano",
    servings: 6,
    time: "40 min",
    page: 115,
    tags: ["risotto", "espargos", "cogumelos"],
    ingredients: [
      { name: "arroz arbóreo", amount: 300, unit: "g" },
      { name: "espargos verdes", amount: 200, unit: "g" },
      { name: "cogumelos fatiados", amount: 200, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 40, unit: "ml" },
      { name: "vinho branco", amount: 100, unit: "ml" },
      { name: "caldo de legumes quente", amount: 900, unit: "ml" },
      { name: "parmesão ralado", amount: 60, unit: "g" },
      { name: "manteiga", amount: 30, unit: "g" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione o arroz e o vinho branco. Cozinhe 2 minutos, 100°C, velocidade 1.",
      "Adicione o caldo de legumes quente, os espargos e os cogumelos. Cozinhe 18 minutos, 100°C, velocidade 1 inversa.",
      "Adicione a manteiga e o parmesão. Envolva bem.",
      "Tempere com sal e pimenta e sirva de imediato."
    ],
    nutrition: { calories: 340, fat: "13g", saturated: "5.5g", salt: "1.0g", serving: "290g" }
  },

  {
    id: "ce_tarte_abobora_requeijao",
    name: "Tarte de abóbora e requeijão com espinafres e nozes",
    category: "Vegetariano",
    servings: 8,
    time: "55 min",
    page: 115,
    tags: ["abóbora", "requeijão", "tarte"],
    ingredients: [
      { name: "abóbora em cubos", amount: 400, unit: "g" },
      { name: "requeijão", amount: 250, unit: "g" },
      { name: "espinafres frescos", amount: 150, unit: "g" },
      { name: "nozes picadas", amount: 80, unit: "g" },
      { name: "ovos", amount: 3, unit: "unid" },
      { name: "natas", amount: 100, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "massa para tarte salgada", amount: 250, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 180°C.",
      "Cozinhe a abóbora no vapor até estar macia. Escorra e reserve.",
      "Misture o requeijão com os ovos e as natas. Tempere com sal e pimenta.",
      "Adicione a abóbora, os espinafres e as nozes à mistura.",
      "Forre uma forma de tarte com a massa. Verta o recheio.",
      "Leve ao forno 35 a 40 minutos até a tarte estar firme e dourada."
    ],
    nutrition: { calories: 295, fat: "18g", saturated: "6.5g", salt: "1.2g", serving: "200g" }
  },

  {
    id: "ce_lentilhas_estufadas_legumes",
    name: "Lentilhas estufadas com legumes",
    category: "Vegetariano",
    servings: 6,
    time: "35 min",
    page: 117,
    tags: ["lentilhas", "legumes", "vegetariano"],
    ingredients: [
      { name: "lentilhas verdes", amount: 300, unit: "g" },
      { name: "cenoura em rodelas", amount: 200, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "alho", amount: 2, unit: "dentes" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "tomate pelado", amount: 300, unit: "g" },
      { name: "caldo de legumes", amount: 600, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "coentros ou salsa", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola e o alho no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione as lentilhas, a cenoura, o tomate e o caldo de legumes.",
      "Cozinhe 25 minutos, 100°C, velocidade 1 inversa.",
      "Tempere com sal e pimenta. Sirva polvilhado com coentros ou salsa."
    ],
    nutrition: { calories: 265, fat: "6g", saturated: "0.8g", salt: "0.9g", serving: "280g" }
  },

  {
    id: "ce_pie_ervilhas_espinafres_tofu",
    name: "Pie de ervilhas com espinafres e tofu",
    category: "Vegetariano",
    servings: 6,
    time: "50 min",
    page: 117,
    tags: ["ervilhas", "tofu", "espinafres"],
    ingredients: [
      { name: "ervilhas congeladas", amount: 300, unit: "g" },
      { name: "espinafres frescos", amount: 200, unit: "g" },
      { name: "tofu firme esfarelado", amount: 250, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "natas de soja", amount: 150, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "massa folhada vegana", amount: 400, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 190°C.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione as ervilhas, os espinafres e o tofu. Cozinhe 10 minutos, 100°C, velocidade 1 inversa.",
      "Adicione as natas de soja e tempere com sal e pimenta.",
      "Transfira para uma forma de tarte. Cubra com a massa folhada.",
      "Leve ao forno 25 minutos até dourar."
    ],
    nutrition: { calories: 310, fat: "15g", saturated: "4.0g", salt: "1.1g", serving: "270g" }
  },

  {
    id: "ce_bifinhos_seitan_abacaxi",
    name: "Bifinhos de seitan com abacaxi",
    category: "Vegetariano",
    servings: 6,
    time: "25 min",
    page: 119,
    tags: ["seitan", "abacaxi", "vegetariano"],
    ingredients: [
      { name: "seitan fatiado", amount: 400, unit: "g" },
      { name: "abacaxi em cubos", amount: 200, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "molho de soja", amount: 2, unit: "c. sopa" },
      { name: "gengibre fresco ralado", amount: 1, unit: "c. chá" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione o seitan, o molho de soja e o gengibre. Cozinhe 8 minutos, 100°C, velocidade 1 inversa.",
      "Adicione o abacaxi e cozinhe mais 5 minutos, 100°C, velocidade 1 inversa.",
      "Sirva com arroz ou salada."
    ],
    nutrition: { calories: 220, fat: "7g", saturated: "1.0g", salt: "1.5g", serving: "230g" }
  },

  {
    id: "ce_lasanha_legumes_soja",
    name: "Lasanha de legumes e soja",
    category: "Vegetariano",
    servings: 8,
    time: "60 min",
    page: 123,
    tags: ["lasanha", "soja", "legumes"],
    ingredients: [
      { name: "placas de lasanha", amount: 12, unit: "unid" },
      { name: "proteína de soja hidratada", amount: 200, unit: "g" },
      { name: "courgette em rodelas", amount: 200, unit: "g" },
      { name: "cenoura ralada", amount: 150, unit: "g" },
      { name: "espinafres", amount: 150, unit: "g" },
      { name: "tomate pelado", amount: 400, unit: "g" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "molho béchamel", amount: 400, unit: "ml" },
      { name: "queijo ralado", amount: 100, unit: "g" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Pré-aqueça o forno a 180°C.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite, a cenoura, a courgette, os espinafres e a soja. Cozinhe 10 minutos, 100°C, velocidade 1 inversa.",
      "Adicione o tomate pelado e tempere. Cozinhe mais 5 minutos.",
      "Alterne camadas de placas de lasanha, recheio de legumes e béchamel numa forma.",
      "Termine com béchamel e queijo ralado.",
      "Leve ao forno 35 minutos até estar dourado."
    ],
    nutrition: { calories: 320, fat: "12g", saturated: "4.5g", salt: "1.3g", serving: "280g" }
  },

  {
    id: "ce_legumes_bras",
    name: "Legumes à Brás",
    category: "Vegetariano",
    servings: 6,
    time: "30 min",
    page: 123,
    tags: ["legumes", "ovos", "batata palha"],
    ingredients: [
      { name: "batata palha", amount: 200, unit: "g" },
      { name: "ovos", amount: 6, unit: "unid" },
      { name: "cebola", amount: 150, unit: "g" },
      { name: "azeite", amount: 40, unit: "ml" },
      { name: "courgette em tiras", amount: 200, unit: "g" },
      { name: "cenoura em tiras", amount: 150, unit: "g" },
      { name: "azeitonas pretas", amount: 50, unit: "g" },
      { name: "salsa picada", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Salteie a cebola com o azeite numa frigideira larga durante 5 minutos.",
      "Adicione a courgette e a cenoura. Salteie mais 5 minutos.",
      "Bata os ovos ligeiramente com sal e pimenta.",
      "Adicione os ovos à frigideira e envolva com os legumes.",
      "Retire do lume antes de os ovos coagularem completamente. Adicione a batata palha e as azeitonas.",
      "Sirva polvilhado com salsa picada."
    ],
    nutrition: { calories: 280, fat: "16g", saturated: "3.5g", salt: "1.2g", serving: "250g" }
  },

  {
    id: "ce_pasteis_soja_legumes",
    name: "Pastéis de soja com legumes",
    category: "Vegetariano",
    servings: 12,
    time: "45 min",
    page: 125,
    tags: ["soja", "pastéis", "vegetariano"],
    ingredients: [
      { name: "proteína de soja hidratada", amount: 200, unit: "g" },
      { name: "cenoura ralada", amount: 100, unit: "g" },
      { name: "ervilhas cozidas", amount: 100, unit: "g" },
      { name: "cebola picada", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "ovos", amount: 2, unit: "unid" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." },
      { name: "farinha de trigo", amount: 50, unit: "g" },
      { name: "óleo para fritar", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Misture a soja com a cenoura, as ervilhas, a cebola, os ovos e a farinha. Tempere com sal e pimenta.",
      "Forme pastéis com a mistura.",
      "Frite em óleo quente até dourarem.",
      "Escorra em papel absorvente e sirva."
    ],
    nutrition: { calories: 180, fat: "8g", saturated: "1.2g", salt: "0.9g", serving: "130g" }
  },

  {
    id: "ce_cuscuz_legumes_salteado",
    name: "Cuscuz com legumes salteado",
    category: "Vegetariano",
    servings: 6,
    time: "20 min",
    page: 127,
    tags: ["cuscuz", "legumes", "rápido"],
    ingredients: [
      { name: "cuscuz", amount: 300, unit: "g" },
      { name: "água quente", amount: 300, unit: "ml" },
      { name: "pimento vermelho em cubos", amount: 150, unit: "g" },
      { name: "courgette em cubos", amount: 150, unit: "g" },
      { name: "cenoura em cubos", amount: 100, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "hortelã fresca", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque o cuscuz numa taça e regue com a água quente e um fio de azeite. Tape e deixe repousar 5 minutos. Solte com um garfo.",
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Salteie a cebola no azeite numa frigideira. Adicione os restantes legumes e salteie 8 minutos.",
      "Misture os legumes com o cuscuz. Tempere com sal, pimenta e hortelã fresca.",
      "Sirva morno ou frio."
    ],
    nutrition: { calories: 240, fat: "7g", saturated: "1.0g", salt: "0.7g", serving: "250g" }
  },

  // ===========================
  // CATEGORIA: MASSA / PÃES
  // ===========================
  {
    id: "ce_pao_mistura_sementes",
    name: "Pão de mistura com sementes",
    category: "Massa",
    servings: 10,
    time: "60 min + levedação",
    page: 21,
    tags: ["pão", "sementes", "integral"],
    ingredients: [
      { name: "farinha de trigo T65", amount: 300, unit: "g" },
      { name: "farinha integral", amount: 100, unit: "g" },
      { name: "farinha de centeio", amount: 100, unit: "g" },
      { name: "água morna", amount: 320, unit: "ml" },
      { name: "fermento seco de padeiro", amount: 7, unit: "g" },
      { name: "sal", amount: 10, unit: "g" },
      { name: "sementes de girassol", amount: 30, unit: "g" },
      { name: "sementes de sésamo", amount: 30, unit: "g" },
      { name: "sementes de linhaça", amount: 20, unit: "g" }
    ],
    instructions: [
      "Coloque a água morna, o fermento e as farinhas no copo. Amasse 3 minutos, na função espiga.",
      "Adicione o sal e as sementes. Amasse mais 2 minutos, na função espiga.",
      "Retire a massa e deixe levedar 1 hora numa taça coberta.",
      "Forme o pão e coloque numa forma untada.",
      "Deixe levedar mais 30 minutos.",
      "Pré-aqueça o forno a 220°C.",
      "Leve ao forno 25 a 30 minutos até estar dourado e soar a oco."
    ],
    nutrition: { calories: 220, fat: "4g", saturated: "0.5g", salt: "0.8g", serving: "80g" }
  },

  {
    id: "ce_pao_doce_tres_farinhas",
    name: "Pão doce de três farinhas",
    category: "Massa",
    servings: 10,
    time: "70 min + levedação",
    page: 21,
    tags: ["pão doce", "farinhas", "tradicional"],
    ingredients: [
      { name: "farinha de trigo T55", amount: 200, unit: "g" },
      { name: "farinha de espelta", amount: 150, unit: "g" },
      { name: "farinha de aveia", amount: 150, unit: "g" },
      { name: "leite morno", amount: 250, unit: "ml" },
      { name: "fermento seco", amount: 7, unit: "g" },
      { name: "açúcar", amount: 50, unit: "g" },
      { name: "manteiga amolecida", amount: 50, unit: "g" },
      { name: "ovos", amount: 2, unit: "unid" },
      { name: "sal", amount: 5, unit: "g" }
    ],
    instructions: [
      "Coloque no copo o leite, o fermento e o açúcar. Misture 1 minuto, 37°C, velocidade 2.",
      "Adicione as farinhas, os ovos, a manteiga e o sal. Amasse 5 minutos, na função espiga.",
      "Deixe a massa levedar 1 hora.",
      "Forme o pão e coloque numa forma untada.",
      "Deixe levedar mais 30 minutos.",
      "Pré-aqueça o forno a 190°C.",
      "Pincele com ovo batido e leve ao forno 25 a 30 minutos."
    ],
    nutrition: { calories: 230, fat: "7g", saturated: "3.0g", salt: "0.7g", serving: "85g" }
  },

  {
    id: "ce_pao_milho",
    name: "Pão de milho",
    category: "Massa",
    servings: 8,
    time: "60 min + levedação",
    page: 23,
    tags: ["broa", "milho", "tradicional"],
    ingredients: [
      { name: "farinha de milho", amount: 300, unit: "g" },
      { name: "farinha de trigo", amount: 200, unit: "g" },
      { name: "água a ferver", amount: 300, unit: "ml" },
      { name: "água fria", amount: 100, unit: "ml" },
      { name: "fermento seco de padeiro", amount: 7, unit: "g" },
      { name: "sal", amount: 10, unit: "g" }
    ],
    instructions: [
      "Escalde a farinha de milho com a água a ferver. Misture bem e deixe arrefecer.",
      "Adicione a farinha de trigo, o fermento dissolvido na água fria e o sal.",
      "Amasse no copo 3 minutos, na função espiga.",
      "Deixe levedar 1 hora.",
      "Forme a broa e polvilhe com farinha.",
      "Pré-aqueça o forno a 220°C. Leve ao forno 35 a 40 minutos."
    ],
    nutrition: { calories: 210, fat: "1.5g", saturated: "0.2g", salt: "0.9g", serving: "90g" }
  },

  {
    id: "ce_paes_vegetais",
    name: "Pães com vegetais",
    category: "Massa",
    servings: 12,
    time: "60 min + levedação",
    page: 23,
    tags: ["pão", "vegetais", "colorido"],
    ingredients: [
      { name: "farinha de trigo T65", amount: 500, unit: "g" },
      { name: "água morna", amount: 300, unit: "ml" },
      { name: "fermento seco", amount: 7, unit: "g" },
      { name: "sal", amount: 10, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "espinafres cozidos e espremidos", amount: 100, unit: "g" },
      { name: "cenoura ralada", amount: 100, unit: "g" },
      { name: "tomate seco picado", amount: 50, unit: "g" }
    ],
    instructions: [
      "Divida os ingredientes base em 3 partes iguais.",
      "Misture uma parte com os espinafres, outra com a cenoura ralada e outra com o tomate seco.",
      "Amasse cada porção separadamente no copo 2 minutos, na função espiga.",
      "Deixe levedar 1 hora.",
      "Forme pães coloridos ou enrolados com as massas.",
      "Leve ao forno pré-aquecido a 200°C durante 20 a 25 minutos."
    ],
    nutrition: { calories: 200, fat: "3g", saturated: "0.4g", salt: "0.8g", serving: "75g" }
  },

  {
    id: "ce_massa_simples_pizza",
    name: "Massa simples para pizza",
    category: "Massa",
    servings: 4,
    time: "15 min + levedação",
    page: 25,
    tags: ["pizza", "massa", "base"],
    ingredients: [
      { name: "farinha de trigo T55", amount: 500, unit: "g" },
      { name: "água morna", amount: 280, unit: "ml" },
      { name: "fermento seco de padeiro", amount: 7, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal", amount: 10, unit: "g" }
    ],
    instructions: [
      "Coloque no copo a água morna e o fermento. Misture 1 minuto, 37°C, velocidade 2.",
      "Adicione a farinha, o azeite e o sal. Amasse 3 minutos, na função espiga.",
      "Deixe levedar 30 a 60 minutos até duplicar de volume.",
      "Estenda a massa numa forma de pizza untada. Coloque os ingredientes a gosto.",
      "Leve ao forno pré-aquecido a 220°C durante 15 a 20 minutos."
    ],
    nutrition: { calories: 270, fat: "5g", saturated: "0.7g", salt: "1.0g", serving: "120g" }
  },

  {
    id: "ce_massa_integral_pizza",
    name: "Massa integral para pizza",
    category: "Massa",
    servings: 4,
    time: "15 min + levedação",
    page: 25,
    tags: ["pizza", "integral", "saudável"],
    ingredients: [
      { name: "farinha integral", amount: 300, unit: "g" },
      { name: "farinha de trigo T55", amount: 200, unit: "g" },
      { name: "água morna", amount: 300, unit: "ml" },
      { name: "fermento seco de padeiro", amount: 7, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal", amount: 10, unit: "g" }
    ],
    instructions: [
      "Coloque no copo a água morna e o fermento. Misture 1 minuto, 37°C, velocidade 2.",
      "Adicione as farinhas, o azeite e o sal. Amasse 4 minutos, na função espiga.",
      "Deixe levedar 45 a 60 minutos.",
      "Estenda e coloque os ingredientes desejados.",
      "Asse a 220°C durante 18 a 22 minutos."
    ],
    nutrition: { calories: 250, fat: "5g", saturated: "0.7g", salt: "1.0g", serving: "120g" }
  },

  {
    id: "ce_massa_tartes_salgadas",
    name: "Massa para tartes salgadas",
    category: "Massa",
    servings: 8,
    time: "15 min + repouso",
    page: 25,
    tags: ["massa", "tarte", "salgada"],
    ingredients: [
      { name: "farinha de trigo T55", amount: 300, unit: "g" },
      { name: "manteiga fria em cubos", amount: 150, unit: "g" },
      { name: "água gelada", amount: 60, unit: "ml" },
      { name: "sal", amount: 5, unit: "g" }
    ],
    instructions: [
      "Coloque a farinha, a manteiga e o sal no copo. Misture 15 segundos, velocidade 6.",
      "Adicione a água fria e misture 15 segundos, velocidade 4.",
      "Forme uma bola, embrulhe em película e leve ao frigorífico 30 minutos.",
      "Estenda e forre a forma de tarte. Use conforme a receita."
    ],
    nutrition: { calories: 320, fat: "18g", saturated: "11g", salt: "0.6g", serving: "90g" }
  },

  {
    id: "ce_massa_tartes_doces",
    name: "Massa para tartes doces",
    category: "Massa",
    servings: 8,
    time: "15 min + repouso",
    page: 26,
    tags: ["massa", "tarte", "doce"],
    ingredients: [
      { name: "farinha de trigo T55", amount: 250, unit: "g" },
      { name: "manteiga amolecida", amount: 125, unit: "g" },
      { name: "açúcar em pó", amount: 50, unit: "g" },
      { name: "ovo", amount: 1, unit: "unid" },
      { name: "sal", amount: 1, unit: "pitada" }
    ],
    instructions: [
      "Coloque todos os ingredientes no copo. Amasse 1 minuto, velocidade 4.",
      "Forme uma bola e embrulhe em película.",
      "Leve ao frigorífico 30 minutos.",
      "Estenda e forre a forma de tarte. Use conforme a receita."
    ],
    nutrition: { calories: 350, fat: "19g", saturated: "11g", salt: "0.3g", serving: "85g" }
  },

  {
    id: "ce_scones",
    name: "Scones",
    category: "Massa",
    servings: 12,
    time: "30 min",
    page: 26,
    tags: ["scones", "pastelaria", "chá"],
    ingredients: [
      { name: "farinha de trigo", amount: 350, unit: "g" },
      { name: "fermento em pó", amount: 1, unit: "c. sopa" },
      { name: "sal", amount: 5, unit: "g" },
      { name: "manteiga fria em cubos", amount: 85, unit: "g" },
      { name: "leite", amount: 175, unit: "ml" },
      { name: "ovo (para pincelar)", amount: 1, unit: "unid" }
    ],
    instructions: [
      "Pré-aqueça o forno a 220°C.",
      "Coloque a farinha, o fermento, o sal e a manteiga no copo. Misture 15 segundos, velocidade 6.",
      "Adicione o leite e misture 10 segundos, velocidade 4.",
      "Estenda a massa com 2 cm de espessura. Corte círculos com um cortador.",
      "Coloque num tabuleiro forrado com papel vegetal. Pincele com ovo batido.",
      "Leve ao forno 12 a 15 minutos até estarem dourados."
    ],
    nutrition: { calories: 200, fat: "8g", saturated: "5g", salt: "0.5g", serving: "65g" }
  },

  {
    id: "ce_massa_fresca",
    name: "Massa fresca",
    category: "Massa",
    servings: 4,
    time: "20 min + repouso",
    page: 27,
    tags: ["massa fresca", "caseira", "pasta"],
    ingredients: [
      { name: "farinha de trigo tipo 00", amount: 300, unit: "g" },
      { name: "ovos", amount: 3, unit: "unid" },
      { name: "sal", amount: 5, unit: "g" },
      { name: "azeite", amount: 10, unit: "ml" }
    ],
    instructions: [
      "Coloque a farinha, os ovos, o sal e o azeite no copo. Amasse 2 minutos, na função espiga.",
      "Se a massa estiver demasiado seca, adicione uma colher de água.",
      "Forme uma bola e embrulhe em película. Deixe repousar 30 minutos.",
      "Estenda a massa com um rolo ou máquina de massas.",
      "Corte no formato desejado (tagliatelle, fettuccine, etc.).",
      "Coza em água com sal durante 2 a 3 minutos."
    ],
    nutrition: { calories: 310, fat: "7g", saturated: "1.5g", salt: "0.8g", serving: "130g" }
  },

  // ===========================
  // CATEGORIA: SOPA
  // ===========================
  {
    id: "ce_sopa_agriao_courgette",
    name: "Sopa de agrião e courgette com queijo de cabra",
    category: "Sopa",
    servings: 6,
    time: "30 min",
    page: 41,
    tags: ["sopa", "agrião", "queijo de cabra"],
    ingredients: [
      { name: "agrião", amount: 200, unit: "g" },
      { name: "courgette em pedaços", amount: 300, unit: "g" },
      { name: "batata em pedaços", amount: 200, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo de legumes", amount: 800, unit: "ml" },
      { name: "queijo de cabra para servir", amount: 100, unit: "g" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione a batata, a courgette e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Adicione o agrião e triture 1 minuto, velocidade 7 a 10 progressivamente.",
      "Tempere com sal e pimenta.",
      "Sirva com queijo de cabra esfarelado por cima."
    ],
    nutrition: { calories: 165, fat: "8g", saturated: "3.5g", salt: "0.9g", serving: "280g" }
  },

  {
    id: "ce_sopa_couve_flor_alho_frances",
    name: "Sopa de couve-flor com alho-francês e espinafres",
    category: "Sopa",
    servings: 6,
    time: "30 min",
    page: 41,
    tags: ["sopa", "couve-flor", "espinafres"],
    ingredients: [
      { name: "couve-flor em raminhos", amount: 400, unit: "g" },
      { name: "alho-francês em rodelas", amount: 200, unit: "g" },
      { name: "espinafres", amount: 150, unit: "g" },
      { name: "batata", amount: 150, unit: "g" },
      { name: "caldo de legumes", amount: 800, unit: "ml" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque o alho-francês no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione a couve-flor, a batata e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Adicione os espinafres e triture 1 minuto, velocidade 7 a 10.",
      "Tempere e sirva."
    ],
    nutrition: { calories: 120, fat: "5g", saturated: "0.7g", salt: "0.8g", serving: "270g" }
  },

  {
    id: "ce_creme_grao_abobora",
    name: "Creme de grão e abóbora com nabiças",
    category: "Sopa",
    servings: 6,
    time: "35 min",
    page: 43,
    tags: ["grão", "abóbora", "nabiças"],
    ingredients: [
      { name: "grão cozido", amount: 300, unit: "g" },
      { name: "abóbora em pedaços", amount: 300, unit: "g" },
      { name: "nabiças ou grelos", amount: 150, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo de legumes", amount: 700, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione o grão, a abóbora e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Cozinhe as nabiças separadamente e disponha por cima.",
      "Tempere e sirva com um fio de azeite."
    ],
    nutrition: { calories: 180, fat: "6g", saturated: "0.8g", salt: "0.7g", serving: "290g" }
  },

  {
    id: "ce_sopa_castanhas_cogumelos",
    name: "Sopa de castanhas com cogumelos e salsa",
    category: "Sopa",
    servings: 6,
    time: "30 min",
    page: 43,
    tags: ["castanhas", "cogumelos", "outono"],
    ingredients: [
      { name: "castanhas cozidas e descascadas", amount: 300, unit: "g" },
      { name: "cogumelos fatiados", amount: 200, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo de legumes", amount: 700, unit: "ml" },
      { name: "salsa fresca", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione as castanhas e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Salteie os cogumelos separadamente e disponha por cima.",
      "Polvilhe com salsa picada e sirva."
    ],
    nutrition: { calories: 195, fat: "7g", saturated: "1.0g", salt: "0.8g", serving: "280g" }
  },

  {
    id: "ce_creme_cenoura",
    name: "Creme de cenoura",
    category: "Sopa",
    servings: 6,
    time: "25 min",
    page: 45,
    tags: ["cenoura", "creme", "simples"],
    ingredients: [
      { name: "cenoura em rodelas", amount: 600, unit: "g" },
      { name: "batata em cubos", amount: 200, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo de legumes", amount: 700, unit: "ml" },
      { name: "gengibre fresco", amount: 5, unit: "g" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione a cenoura, a batata, o gengibre e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Tempere com sal e pimenta e sirva com sementes tostadas."
    ],
    nutrition: { calories: 130, fat: "5g", saturated: "0.7g", salt: "0.7g", serving: "270g" }
  },

  {
    id: "ce_vichyssoise",
    name: "Vichyssoise",
    category: "Sopa",
    servings: 6,
    time: "30 min + arrefecimento",
    page: 47,
    tags: ["sopa fria", "alho-francês", "batata"],
    ingredients: [
      { name: "alho-francês (parte branca) em rodelas", amount: 400, unit: "g" },
      { name: "batata em cubos", amount: 300, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "manteiga", amount: 30, unit: "g" },
      { name: "caldo de frango ou legumes", amount: 700, unit: "ml" },
      { name: "natas", amount: 150, unit: "ml" },
      { name: "sal e pimenta branca", amount: 1, unit: "q.b." },
      { name: "cebolinho picado", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione a manteiga e o alho-francês. Cozinhe 5 minutos, 100°C, velocidade 1.",
      "Adicione a batata e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Adicione as natas e misture. Tempere com sal e pimenta branca.",
      "Deixe arrefecer e leve ao frigorífico. Sirva fria, polvilhada com cebolinho."
    ],
    nutrition: { calories: 185, fat: "10g", saturated: "5.5g", salt: "0.9g", serving: "290g" }
  },

  {
    id: "ce_sopa_feijao_portuguesa",
    name: "Sopa de feijão à portuguesa",
    category: "Sopa",
    servings: 6,
    time: "35 min",
    page: 51,
    tags: ["feijão", "chouriço", "tradicional"],
    ingredients: [
      { name: "feijão encarnado cozido", amount: 400, unit: "g" },
      { name: "chouriço em rodelas", amount: 100, unit: "g" },
      { name: "couve portuguesa em juliana", amount: 200, unit: "g" },
      { name: "cenoura em rodelas", amount: 150, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo", amount: 800, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione a cenoura, metade do feijão e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 30 segundos, velocidade 7.",
      "Adicione o restante feijão, a couve e o chouriço. Cozinhe mais 10 minutos, 100°C, velocidade 1.",
      "Tempere e sirva."
    ],
    nutrition: { calories: 230, fat: "8g", saturated: "2.5g", salt: "1.5g", serving: "300g" }
  },

  {
    id: "ce_sopa_fria_abobora_batata_doce",
    name: "Sopa fria de abóbora e batata-doce com gengibre",
    category: "Sopa",
    servings: 6,
    time: "30 min + arrefecimento",
    page: 49,
    tags: ["sopa fria", "abóbora", "gengibre"],
    ingredients: [
      { name: "abóbora em cubos", amount: 400, unit: "g" },
      { name: "batata-doce em cubos", amount: 300, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "gengibre fresco ralado", amount: 10, unit: "g" },
      { name: "leite de coco", amount: 200, unit: "ml" },
      { name: "caldo de legumes", amount: 500, unit: "ml" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione a abóbora, a batata-doce, o gengibre e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Adicione o leite de coco e misture. Tempere com sal e pimenta.",
      "Deixe arrefecer e sirva fria."
    ],
    nutrition: { calories: 170, fat: "8g", saturated: "5.5g", salt: "0.7g", serving: "280g" }
  },

  {
    id: "ce_sopa_ervilhas",
    name: "Sopa de ervilhas",
    category: "Sopa",
    servings: 6,
    time: "25 min",
    page: 53,
    tags: ["ervilhas", "sopa", "rápida"],
    ingredients: [
      { name: "ervilhas congeladas", amount: 500, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo de legumes", amount: 700, unit: "ml" },
      { name: "hortelã fresca", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione as ervilhas e o caldo. Cozinhe 15 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Tempere com sal e pimenta. Sirva com hortelã fresca."
    ],
    nutrition: { calories: 140, fat: "5g", saturated: "0.7g", salt: "0.6g", serving: "260g" }
  },

  {
    id: "ce_sopa_favas",
    name: "Sopa de favas",
    category: "Sopa",
    servings: 6,
    time: "30 min",
    page: 55,
    tags: ["favas", "sopa", "primavera"],
    ingredients: [
      { name: "favas descascadas", amount: 500, unit: "g" },
      { name: "cebola", amount: 100, unit: "g" },
      { name: "azeite", amount: 30, unit: "ml" },
      { name: "caldo de legumes", amount: 700, unit: "ml" },
      { name: "coentros frescos", amount: 1, unit: "q.b." },
      { name: "sal e pimenta", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Coloque a cebola no copo e pique 5 segundos, velocidade 5.",
      "Adicione o azeite e cozinhe 3 minutos, 100°C, velocidade 1.",
      "Adicione as favas e o caldo. Cozinhe 20 minutos, 100°C, velocidade 1.",
      "Triture 1 minuto, velocidade 7 a 10.",
      "Tempere com sal e pimenta. Sirva polvilhada com coentros."
    ],
    nutrition: { calories: 155, fat: "5g", saturated: "0.7g", salt: "0.6g", serving: "270g" }
  },

  // ===========================
  // CATEGORIA: SOBREMESA
  // ===========================
  {
    id: "ce_gelado_chocolate_belga",
    name: "Gelado de chocolate belga",
    category: "Sobremesa",
    servings: 8,
    time: "20 min + congelação",
    page: 145,
    tags: ["gelado", "chocolate", "sobremesa"],
    ingredients: [
      { name: "chocolate negro belga", amount: 200, unit: "g" },
      { name: "natas para bater", amount: 400, unit: "ml" },
      { name: "leite", amount: 200, unit: "ml" },
      { name: "gemas de ovo", amount: 4, unit: "unid" },
      { name: "açúcar", amount: 100, unit: "g" },
      { name: "extrato de baunilha", amount: 1, unit: "c. chá" }
    ],
    instructions: [
      "Coloque o chocolate partido em pedaços no copo e pique 5 segundos, velocidade 8.",
      "Adicione o leite e programe 5 minutos, 70°C, velocidade 2.",
      "Adicione as gemas e o açúcar. Programe 5 minutos, 80°C, velocidade 3.",
      "Deixe arrefecer completamente.",
      "Bata as natas separadamente até ficarem firmes. Envolva no chocolate.",
      "Coloque num recipiente e leve ao congelador pelo menos 4 horas.",
      "Retire 10 minutos antes de servir."
    ],
    nutrition: { calories: 380, fat: "27g", saturated: "16g", salt: "0.2g", serving: "120g" }
  },

  {
    id: "ce_gelado_iogurte_frutos_vermelhos",
    name: "Gelado de iogurte e frutos vermelhos",
    category: "Sobremesa",
    servings: 8,
    time: "15 min + congelação",
    page: 148,
    tags: ["gelado", "iogurte", "frutos vermelhos"],
    ingredients: [
      { name: "iogurte grego natural", amount: 400, unit: "g" },
      { name: "frutos vermelhos congelados", amount: 300, unit: "g" },
      { name: "mel", amount: 80, unit: "g" },
      { name: "sumo de limão", amount: 1, unit: "c. sopa" }
    ],
    instructions: [
      "Coloque os frutos vermelhos congelados no copo e triture 10 segundos, velocidade 8.",
      "Adicione o iogurte, o mel e o sumo de limão. Misture 1 minuto, velocidade 4.",
      "Transfira para um recipiente e leve ao congelador.",
      "Após 2 horas, bata de novo para uma textura mais cremosa.",
      "Congele até estar firme.",
      "Sirva decorado com frutos vermelhos frescos."
    ],
    nutrition: { calories: 155, fat: "3g", saturated: "2g", salt: "0.1g", serving: "110g" }
  },

  {
    id: "ce_leite_creme",
    name: "Leite-creme",
    category: "Sobremesa",
    servings: 6,
    time: "20 min",
    page: 149,
    tags: ["leite-creme", "tradicional", "caramelizado"],
    ingredients: [
      { name: "leite", amount: 700, unit: "ml" },
      { name: "gemas de ovo", amount: 6, unit: "unid" },
      { name: "açúcar", amount: 150, unit: "g" },
      { name: "farinha maisena", amount: 40, unit: "g" },
      { name: "casca de limão", amount: 1, unit: "unid" },
      { name: "açúcar para caramelizar", amount: 3, unit: "c. sopa" }
    ],
    instructions: [
      "Coloque no copo as gemas, o açúcar e a farinha maisena. Misture 1 minuto, velocidade 4.",
      "Adicione o leite e a casca de limão. Programe 12 minutos, 90°C, velocidade 4.",
      "Retire a casca de limão.",
      "Distribua por taças ou pratos fundos. Deixe arrefecer.",
      "Polvilhe com açúcar e queime com maçarico ou grill do forno antes de servir."
    ],
    nutrition: { calories: 260, fat: "9g", saturated: "3.5g", salt: "0.2g", serving: "180g" }
  },

  {
    id: "ce_mousse_chocolate_framboesa",
    name: "Mousse de chocolate e framboesa",
    category: "Sobremesa",
    servings: 6,
    time: "20 min + refrigeração",
    page: 149,
    tags: ["mousse", "chocolate", "framboesa"],
    ingredients: [
      { name: "chocolate negro", amount: 200, unit: "g" },
      { name: "natas", amount: 200, unit: "ml" },
      { name: "claras de ovo", amount: 4, unit: "unid" },
      { name: "framboesas frescas", amount: 150, unit: "g" },
      { name: "açúcar", amount: 30, unit: "g" }
    ],
    instructions: [
      "Parta o chocolate em pedaços e derreta em banho-maria ou no copo a 50°C, velocidade 2.",
      "Deixe arrefecer ligeiramente.",
      "Bata as natas até ficarem em chantilly. Reserve.",
      "Bata as claras com o açúcar em castelo firme.",
      "Envolva delicadamente as natas e as claras no chocolate.",
      "Coloque nas taças e decore com framboesas. Leve ao frigorífico 2 horas."
    ],
    nutrition: { calories: 310, fat: "20g", saturated: "12g", salt: "0.1g", serving: "150g" }
  },

  {
    id: "ce_bolo_cremoso_chocolate_frutos_vermelhos",
    name: "Bolo cremoso de chocolate e frutos vermelhos",
    category: "Sobremesa",
    servings: 10,
    time: "50 min",
    page: 151,
    tags: ["bolo", "chocolate", "frutos vermelhos"],
    ingredients: [
      { name: "chocolate negro", amount: 200, unit: "g" },
      { name: "manteiga", amount: 150, unit: "g" },
      { name: "ovos", amount: 4, unit: "unid" },
      { name: "açúcar", amount: 150, unit: "g" },
      { name: "farinha", amount: 80, unit: "g" },
      { name: "frutos vermelhos mistos", amount: 200, unit: "g" }
    ],
    instructions: [
      "Pré-aqueça o forno a 170°C.",
      "Derreta o chocolate com a manteiga no copo, 5 minutos, 50°C, velocidade 2.",
      "Adicione os ovos e o açúcar. Misture 2 minutos, velocidade 4.",
      "Adicione a farinha e misture 30 segundos, velocidade 3.",
      "Verta numa forma untada. Disponha os frutos vermelhos por cima.",
      "Leve ao forno 25 a 30 minutos. Deve ficar húmido por dentro."
    ],
    nutrition: { calories: 340, fat: "19g", saturated: "11g", salt: "0.2g", serving: "130g" }
  },

  {
    id: "ce_pudim_pao_banana_canela",
    name: "Pudim de pão com banana e canela",
    category: "Sobremesa",
    servings: 8,
    time: "55 min",
    page: 151,
    tags: ["pudim", "pão", "banana"],
    ingredients: [
      { name: "pão de forma fatiado (2 dias)", amount: 200, unit: "g" },
      { name: "bananas maduras", amount: 3, unit: "unid" },
      { name: "leite", amount: 400, unit: "ml" },
      { name: "ovos", amount: 3, unit: "unid" },
      { name: "açúcar", amount: 80, unit: "g" },
      { name: "canela moída", amount: 1, unit: "c. chá" },
      { name: "manteiga para untar", amount: 1, unit: "q.b." }
    ],
    instructions: [
      "Pré-aqueça o forno a 180°C.",
      "Misture no copo o leite, os ovos, o açúcar e a canela. Velocidade 4, 30 segundos.",
      "Unte uma forma refratária com manteiga.",
      "Corte o pão e as bananas em fatias. Alterne camadas na forma.",
      "Regue com a mistura de leite e ovos.",
      "Deixe repousar 15 minutos para o pão absorver.",
      "Leve ao forno 35 a 40 minutos até estar dourado e firme."
    ],
    nutrition: { calories: 270, fat: "6g", saturated: "2.5g", salt: "0.4g", serving: "170g" }
  },

  {
    id: "ce_bolachas_mel_canela",
    name: "Bolachas de mel e canela",
    category: "Sobremesa",
    servings: 30,
    time: "35 min",
    page: 153,
    tags: ["bolachas", "mel", "canela"],
    ingredients: [
      { name: "farinha de trigo", amount: 300, unit: "g" },
      { name: "mel", amount: 100, unit: "g" },
      { name: "manteiga amolecida", amount: 100, unit: "g" },
      { name: "ovo", amount: 1, unit: "unid" },
      { name: "canela moída", amount: 2, unit: "c. chá" },
      { name: "bicarbonato de sódio", amount: 0.5, unit: "c. chá" },
      { name: "sal", amount: 1, unit: "pitada" }
    ],
    instructions: [
      "Pré-aqueça o forno a 180°C.",
      "Coloque todos os ingredientes no copo. Amasse 2 minutos, velocidade 4.",
      "Forme uma bola e estenda com espessura de 3 mm.",
      "Corte as bolachas com cortadores.",
      "Coloque num tabuleiro com papel vegetal.",
      "Leve ao forno 10 a 12 minutos até estarem douradas.",
      "Deixe arrefecer numa grelha."
    ],
    nutrition: { calories: 80, fat: "3.5g", saturated: "2g", salt: "0.1g", serving: "25g" }
  },

  {
    id: "ce_mousse_mascarpone_morangos",
    name: "Mousse de Mascarpone e morangos",
    category: "Sobremesa",
    servings: 6,
    time: "20 min + refrigeração",
    page: 157,
    tags: ["mousse", "mascarpone", "morangos"],
    ingredients: [
      { name: "mascarpone", amount: 250, unit: "g" },
      { name: "natas para bater", amount: 200, unit: "ml" },
      { name: "açúcar em pó", amount: 80, unit: "g" },
      { name: "morangos frescos", amount: 300, unit: "g" },
      { name: "sumo de limão", amount: 1, unit: "c. sopa" },
      { name: "extrato de baunilha", amount: 1, unit: "c. chá" }
    ],
    instructions: [
      "Bata as natas até ficarem em chantilly firme.",
      "Coloque o mascarpone, o açúcar em pó e o extrato de baunilha no copo. Misture 1 minuto, velocidade 4.",
      "Envolva delicadamente o chantilly no mascarpone.",
      "Reserve alguns morangos para decorar. Corte os restantes em pedaços e misture com sumo de limão.",
      "Alterne camadas de mousse e morangos nas taças.",
      "Decore com os morangos reservados. Leve ao frigorífico 2 horas."
    ],
    nutrition: { calories: 340, fat: "26g", saturated: "16g", salt: "0.1g", serving: "160g" }
  },

  {
    id: "ce_salame_chocolate",
    name: "Salame de chocolate",
    category: "Sobremesa",
    servings: 12,
    time: "20 min + refrigeração",
    page: 173,
    tags: ["salame", "chocolate", "sem forno"],
    ingredients: [
      { name: "bolacha Maria", amount: 200, unit: "g" },
      { name: "chocolate negro", amount: 200, unit: "g" },
      { name: "manteiga", amount: 100, unit: "g" },
      { name: "gemas de ovo", amount: 2, unit: "unid" },
      { name: "açúcar", amount: 50, unit: "g" },
      { name: "licor de laranja ou rum", amount: 2, unit: "c. sopa" }
    ],
    instructions: [
      "Parta as bolachas grosseiramente. Reserve.",
      "Derreta o chocolate com a manteiga no copo, 5 minutos, 50°C, velocidade 2.",
      "Adicione as gemas, o açúcar e o licor. Misture 1 minuto, velocidade 3.",
      "Retire do copo e misture com os pedaços de bolacha.",
      "Forme um rolo com papel de alumínio. Aperte bem e torça as pontas.",
      "Leve ao frigorífico pelo menos 3 horas.",
      "Fatie e sirva polvilhado com açúcar em pó."
    ],
    nutrition: { calories: 290, fat: "17g", saturated: "9.5g", salt: "0.2g", serving: "80g" }
  },

  {
    id: "ce_pudim_flan",
    name: "Pudim flan",
    category: "Sobremesa",
    servings: 8,
    time: "40 min + arrefecimento",
    page: 161,
    tags: ["pudim", "caramelo", "clássico"],
    ingredients: [
      { name: "leite", amount: 600, unit: "ml" },
      { name: "ovos inteiros", amount: 4, unit: "unid" },
      { name: "gemas", amount: 2, unit: "unid" },
      { name: "açúcar", amount: 150, unit: "g" },
      { name: "extrato de baunilha", amount: 1, unit: "c. chá" },
      { name: "açúcar para o caramelo", amount: 120, unit: "g" },
      { name: "água para o caramelo", amount: 2, unit: "c. sopa" }
    ],
    instructions: [
      "Prepare o caramelo: leve o açúcar com a água ao lume até obter caramelo dourado. Verta na forma.",
      "Pré-aqueça o forno a 160°C.",
      "Coloque no copo o leite, os ovos, as gemas, o açúcar e a baunilha. Misture 30 segundos, velocidade 4.",
      "Verta o preparado na forma com o caramelo.",
      "Coloque a forma em banho-maria. Leve ao forno 35 a 40 minutos.",
      "Deixe arrefecer completamente antes de desenformar."
    ],
    nutrition: { calories: 230, fat: "7g", saturated: "3g", salt: "0.2g", serving: "150g" }
  }
];

module.exports = chefexpressRecipes;
