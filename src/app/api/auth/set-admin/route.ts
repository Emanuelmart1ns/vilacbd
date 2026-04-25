import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Token em falta." }, { status: 400 });
    }

    const adminAuth = getAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    await userRef.update({ role: "admin" });

    return NextResponse.json({ message: "Role atualizado para admin.", uid }, { status: 200 });
  } catch (error) {
    console.error("Erro ao definir admin:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
