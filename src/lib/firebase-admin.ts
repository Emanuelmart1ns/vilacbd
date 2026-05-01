import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import path from "path";
import fs from "fs";

let adminApp: App;

export function getAdminApp(): App {
  if (getApps().length === 0) {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      try {
        const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        const firstParse = JSON.parse(rawKey);
        serviceAccount = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
      } catch (e) {
        console.error("Erro ao fazer parse da FIREBASE_SERVICE_ACCOUNT_KEY:", e);
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY inválida.");
      }

      credential = cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      });
    } else if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
      credential = cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      });
    } else {
      const serviceAccountPath = path.join(process.cwd(), "vilacbd-firebase-adminsdk-fbsvc-44bbae9ada.json");
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

export function getAdminBucket() {
  const bucketName = process.env.FIREBASE_STORAGE_BUCKET || "vilacbd.firebasestorage.app";
  return getStorage(getAdminApp()).bucket(bucketName);
}
