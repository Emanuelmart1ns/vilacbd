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
    
    // Fallback para redes sociais
    if (!data.socials) {
      data.socials = {
        instagram: "https://instagram.com/vilacbd",
        facebook: "https://facebook.com/vilacbd",
        tiktok: "",
        whatsapp: "+351 912 345 678"
      };
    }
    
    // Fallback para dados da loja se não existirem
    if (!data.address) data.address = "Rua Dr. Roberto Alves 56, 4520-213 Santa Maria da Feira, Portugal";
    if (!data.phone) data.phone = "+351 912 345 678";
    if (!data.email) data.email = "info@vilacbd.com";
    if (!data.schedule) data.schedule = "Seg-Sex: 10:00 - 13:00 | 14:30 - 19:00, Sábado: 10:00 - 13:00, Domingo: Encerrado";
    if (!data.logo) data.logo = "";
    if (!data.storeName) data.storeName = "Vila CBD";
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar definições." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      idToken, 
      socials, 
      storeName, 
      categories, 
      address, 
      phone, 
      email, 
      schedule, 
      logo 
    } = body;

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
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (logo !== undefined) updateData.logo = logo;
    
    updateData.updatedAt = new Date().toISOString();

    await db.collection("settings").doc("global").set(updateData, { merge: true });

    return NextResponse.json({ message: "Definições guardadas com sucesso!" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao guardar definições:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
