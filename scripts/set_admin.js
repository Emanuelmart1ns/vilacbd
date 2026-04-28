const { getAdminDb } = require('./src/lib/firebase-admin');

async function setAdmin(email) {
  try {
    const db = getAdminDb();
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      console.log(`Utilizador ${email} não encontrado. Certifique-se que já fez login no site.`);
      return;
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      isAdmin: true,
      role: "admin"
    });

    console.log(`SUCESSO: O utilizador ${email} é agora ADMIN.`);
  } catch (error) {
    console.error("Erro ao definir admin:", error);
  }
}

const targetEmail = "emanueljferreiramartins@gmail.com";
setAdmin(targetEmail);
