import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if it hasn't been initialized
import { initializeFirestore } from "firebase/firestore";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
const auth = getAuth(app);

// Cache local para evitar re-fetch constante no mesmo componente
let productsCache: any[] | null = null;

export { app, db, auth };

// Firestore Helpers
export const getProducts = async (forceRefresh = false) => {
  if (productsCache && !forceRefresh) return productsCache;

  try {
    // Timeout de 6 segundos para não travar o site se a BD estiver lenta
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 6000)
    );

    const fetchPromise = (async () => {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      productsCache = data;
      return data;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    console.warn("Lentidão detetada na BD, a usar cache/estáticos.");
    return productsCache || [];
  }
};

export const addProduct = async (product: any) => {
  productsCache = null;
  return await addDoc(collection(db, "products"), product);
};

export const updateProduct = async (id: string, product: any) => {
  productsCache = null;
  const productRef = doc(db, "products", id);
  return await updateDoc(productRef, product);
};

export const deleteProduct = async (id: string) => {
  productsCache = null;
  const productRef = doc(db, "products", id);
  return await deleteDoc(productRef);
};

// --- REVIEWS ---
export const getReviews = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
    const fetchPromise = (async () => {
      const q = query(collection(db, "reviews"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    })();
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    return [];
  }
};

export const addReview = async (review: any) => {
  return await addDoc(collection(db, "reviews"), {
    ...review,
    date: new Date().toISOString(),
  });
};

export const deleteReview = async (id: string) => {
  const docRef = doc(db, "reviews", id);
  return await deleteDoc(docRef);
};
