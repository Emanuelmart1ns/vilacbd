import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    
    // Delete all products from Firestore
    const snapshot = await db.collection("products").get();
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      message: `${snapshot.size} produtos deletados com sucesso.` 
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar produtos:", error);
    return NextResponse.json({ error: "Erro ao deletar produtos" }, { status: 500 });
  }
}
