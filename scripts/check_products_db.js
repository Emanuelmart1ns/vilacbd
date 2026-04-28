const { getAdminDb } = require('./src/lib/firebase-admin');

async function checkProducts() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("products").get();
    console.log(`Found ${snapshot.size} products.`);
    
    snapshot.docs.forEach(doc => {
      const p = doc.data();
      console.log(`- [${p.id}] ${p.name} | Category: "${p.category}" | Image: ${p.image}`);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

checkProducts();
