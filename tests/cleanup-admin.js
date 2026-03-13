const admin = require('firebase-admin');

// Download service account JSON from Firebase Console → Project Settings → Service Accounts → Generate new private key
// Save as 'service-account.json' in project root
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'nannymeal-d966b'
});

const db = admin.firestore();

async function cleanup() {
  console.log('🔍 Scanning recipes...');
  
  const recipesRef = db.collection('recipes');
  const snapshot = await recipesRef.get();
  
  const toDelete = [];
  let good = 0, bad = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // BAD: string ingredients (like "Hambúrguer de Grão")
    if (data.ingredients && data.ingredients.length > 0 && typeof data.ingredients[0] === 'string') {
      toDelete.push(doc.id);
      console.log(`❌ DELETE "${data.name || doc.id}" - string ingredients`);
      bad++;
      return;
    }
    
    // BAD: missing analyzedInstructions.steps
    if (!data.analyzedInstructions?.[0]?.steps || data.analyzedInstructions[0].steps.length === 0) {
      toDelete.push(doc.id);
      console.log(`❌ DELETE "${data.name || doc.id}" - no steps`);
      bad++;
      return;
    }
    
    // GOOD: like "Salmão Cozido"
    console.log(`✅ KEEP "${data.name || doc.id}"`);
    good++;
  });
  
  console.log(`\n📊 Summary: ${good} good, ${bad} bad recipes`);
  
  if (toDelete.length === 0) {
    console.log('🎉 Nothing to delete!');
    process.exit(0);
  }
  
  console.log(`\n🗑️  Deleting ${toDelete.length} recipes...`);
  await Promise.all(toDelete.map(id => db.collection('recipes').doc(id).delete()));
  
  console.log(`✅ DONE! Deleted ${toDelete.length} incomplete recipes`);
  process.exit(0);
}

cleanup().catch(console.error);

