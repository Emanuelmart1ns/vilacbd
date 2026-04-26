import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, displayName, provider } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Token em falta." }, { status: 400 });
    }

    let decodedToken;
    try {
      // Garantir que o Admin SDK está inicializado antes de usar o Auth
      getAdminDb(); 
      const adminAuth = getAuth();
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (e: any) {
      console.error("Erro ao verificar token:", e);
      return NextResponse.json({ error: "Token inválido.", details: e.message }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const name = displayName || decodedToken.name || email.split("@")[0];
    const photoURL = decodedToken.picture || "";
    const firebaseProvider = decodedToken.firebase?.sign_in_provider || provider || "unknown";

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        displayName: name,
        photoURL,
        provider: firebaseProvider,
        role: "customer",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
      });
      return NextResponse.json({ isNew: true, role: "customer", provider: firebaseProvider }, { status: 201 });
    } else {
      const existingData = userDoc.data();
      const updateData: Record<string, string | number> = {
        lastLogin: new Date().toISOString(),
        loginCount: (existingData?.loginCount || 0) + 1,
        provider: firebaseProvider,
      };
      
      if (name && name !== email.split("@")[0]) {
        updateData.displayName = name;
      }
      if (photoURL) {
        updateData.photoURL = photoURL;
      }

      const isGoogle = firebaseProvider === "google.com";
      if (isGoogle && !existingData?.role) {
        updateData.role = "customer";
      }

      await userRef.update(updateData);
      
      const finalRole = existingData?.role || updateData.role || "customer";
      return NextResponse.json({ isNew: false, role: finalRole, provider: firebaseProvider, createdAt: existingData?.createdAt }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Erro no sync de utilizador:", error);
    return NextResponse.json({ 
      error: "Erro interno.", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}
