import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Firestore Helpers
export interface FirestoreProduct {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
  description: string;
  image?: string;
  images?: string[];
  color: string;
  isPopular?: boolean;
}

export interface FirestoreReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  comment: string;
  rating: number;
  date: string;
}

// Cache local para evitar re-fetch constante no mesmo componente
let productsCache: FirestoreProduct[] | null = null;

export { app, db, auth, storage };

// --- IMAGE UPLOAD ---
export const uploadProductImage = async (file: File, productId?: string): Promise<string> => {
  try {
    // Gerar nome único para a imagem
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const folder = productId ? `products/${productId}` : 'products/temp';
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // Upload da imagem
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obter URL pública
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error("Falha no upload da imagem");
  }
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extrair o caminho da imagem da URL
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Erro ao deletar imagem:", error);
    // Não lançar erro se a imagem não existir
  }
};

export const getProducts = async (forceRefresh = false): Promise<FirestoreProduct[]> => {
  if (productsCache && !forceRefresh) return productsCache;

  try {
    // Timeout de 6 segundos para não travar o site se a BD estiver lenta
    const timeoutPromise = new Promise<FirestoreProduct[]>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 6000)
    );

    const fetchPromise = (async () => {
      const q = query(collection(db, "products"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreProduct[];
      productsCache = data;
      return data;
    })();

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    console.warn("Lentidão detetada na BD, a usar cache/estáticos.");
    return productsCache || [];
  }
};

export const addProduct = async (product: Omit<FirestoreProduct, "id">) => {
  productsCache = null;
  return await addDoc(collection(db, "products"), product);
};

export const updateProduct = async (id: string, product: Partial<FirestoreProduct>) => {
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
export const getReviews = async (): Promise<FirestoreReview[]> => {
  try {
    const timeoutPromise = new Promise<FirestoreReview[]>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
    const fetchPromise = (async () => {
      const q = query(collection(db, "reviews"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirestoreReview[];
    })();
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch {
    return [];
  }
};

export const addReview = async (review: Omit<FirestoreReview, "id" | "date">) => {
  return await addDoc(collection(db, "reviews"), {
    ...review,
    date: new Date().toISOString(),
  });
};

export const deleteReview = async (id: string) => {
  const docRef = doc(db, "reviews", id);
  return await deleteDoc(docRef);
};
