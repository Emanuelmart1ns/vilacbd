import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection("settings").doc("global").get();
    
    const data = settingsDoc.data() || {};
    
    // Fallback para categorias padrão se não existirem no Firestore
    if (!data.categories) {
      data.categories = [
        { name: "Óleos e Tinturas", subcategories: ["Isolate", "Full Spectrum", "Broad Spectrum", "Pets"] },
        { name: "Flores de Cânhamo", subcategories: ["Indoor", "Outdoor", "Greenhouse"] },
        { name: "Gomas e Edibles", subcategories: ["Gomas", "Chás", "Mel"] },
        { name: "Tópicos e Cosméticos", subcategories: ["Cremes", "Bálsamos", "Séruns"] },
        { name: "Acessórios e Vapes", subcategories: ["Vapes", "Grinders", "Papel de Enrolar"] }
      ];
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar definições." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, socials, storeName, categories } = body;

    const db = getAdminDb();
    const adminAuth = getAuth();
    
    // Verificar se é admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const updateData: any = {};
    if (socials) updateData.socials = socials;
    if (storeName) updateData.storeName = storeName;
    if (categories) updateData.categories = categories;
    
    updateData.updatedAt = new Date().toISOString();

    await db.collection("settings").doc("global").set(updateData, { merge: true });

    return NextResponse.json({ message: "Definições guardadas com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao guardar definições:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
