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
      const adminAuth = getAuth();
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
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
      const updateData: Record<string, string | number> = {
        lastLogin: new Date().toISOString(),
        loginCount: (userDoc.data()?.loginCount || 0) + 1,
        provider: firebaseProvider,
      };
      if (name && name !== email.split("@")[0]) {
        updateData.displayName = name;
      }
      if (photoURL) {
        updateData.photoURL = photoURL;
      }
      const isGoogle = firebaseProvider === "google.com";
      if (isGoogle) {
        updateData.role = "customer";
      }
      await userRef.update(updateData);
      const storedRole = userDoc.data()?.role || "customer";
      const role = isGoogle ? "customer" : storedRole;
      return NextResponse.json({ isNew: false, role, provider: firebaseProvider, createdAt: userDoc.data()?.createdAt }, { status: 200 });
    }
  } catch (error) {
    console.error("Erro no sync de utilizador:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
