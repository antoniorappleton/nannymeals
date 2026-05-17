const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "nannymeal", // Need to verify if application default credentials are fine
});
const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('ingredients').get();
  console.log('Total ingredients:', snapshot.size);
}
run();
