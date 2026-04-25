import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, displayName } = body;

    if (!idToken || !displayName) {
      return NextResponse.json({ error: "Dados em falta." }, { status: 400 });
    }

    const trimmedName = displayName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
    }

    let decodedToken;
    try {
      const adminAuth = getAuth();
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const photoURL = decodedToken.picture || "";

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        displayName: trimmedName,
        photoURL,
        provider: "email",
        role: "customer",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
      });
    } else {
      await userRef.update({
        displayName: trimmedName,
        lastLogin: new Date().toISOString(),
        loginCount: (userDoc.data()?.loginCount || 0) + 1,
      });
    }

    return NextResponse.json({ message: "Registo concluído.", displayName: trimmedName }, { status: 200 });
  } catch (error) {
    console.error("Erro no registo:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
