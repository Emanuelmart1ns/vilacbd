import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length === 0) {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // JSON blob (ex: variável de ambiente no Vercel)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      });
    } else if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
      // Variáveis individuais
      credential = cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      });
    } else {
      // Fallback: lê o ficheiro JSON na raiz do projeto (desenvolvimento local)
      const serviceAccountPath = path.join(process.cwd(), "vilacbd-firebase-adminsdk-fbsvc-41a12422b5.json");
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
        credential = cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        });
      } else {
        throw new Error(
          "Firebase Admin SDK: Define FIREBASE_SERVICE_ACCOUNT_KEY ou coloca o ficheiro de service account na raiz do projeto."
        );
      }
    }

    adminApp = initializeApp({ credential });
  } else {
    adminApp = getApps()[0];
  }

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}
