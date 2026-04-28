import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json();
    
    // Proteção básica para evitar que qualquer pessoa use isto sem saber o segredo
    if (secret !== "vilacbd_admin_2024") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    
    // Procurar o utilizador pelo email no Firestore
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "User not found. Please login on the site first." }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      isAdmin: true,
      role: "admin"
    });

    return NextResponse.json({ success: true, message: `O utilizador ${email} é agora ADMIN.` });
  } catch (error) {
    console.error("Admin bypass error:", error);
    return NextResponse.json({ error: "Failed to set admin" }, { status: 500 });
  }
}
