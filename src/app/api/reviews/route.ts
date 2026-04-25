import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, comment, rating, idToken } = body;

    if (!idToken || !productId || !comment || !rating) {
      return NextResponse.json({ error: "Dados em falta." }, { status: 400 });
    }

    const trimmed = comment.trim();
    if (trimmed.length < 2 || trimmed.length > 1000) {
      return NextResponse.json({ error: "Comentário inválido." }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Avaliação inválida." }, { status: 400 });
    }

    let decodedToken;
    try {
      const adminAuth = getAuth();
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Sessão inválida. Inicie sessão novamente." }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const name = decodedToken.name || email.split("@")[0];

    const db = getAdminDb();
    const docRef = await db.collection("reviews").add({
      productId,
      userId: uid,
      userName: name,
      userEmail: email,
      comment: trimmed,
      rating,
      date: new Date().toISOString(),
    });

    return NextResponse.json({ id: docRef.id, message: "Comentário publicado." }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar review:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
