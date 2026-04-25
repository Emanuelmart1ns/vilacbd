import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Erro ao listar utilizadores:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, targetUid, role } = body;

    if (!idToken || !targetUid || !role) {
      return NextResponse.json({ error: "Dados em falta." }, { status: 400 });
    }

    if (!["admin", "customer"].includes(role)) {
      return NextResponse.json({ error: "Role inválido." }, { status: 400 });
    }

    const adminAuth = getAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const db = getAdminDb();

    const requesterRef = db.collection("users").doc(decodedToken.uid);
    const requesterDoc = await requesterRef.get();

    if (!requesterDoc.exists || requesterDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }

    const targetRef = db.collection("users").doc(targetUid);
    const targetDoc = await targetRef.get();

    if (!targetDoc.exists) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    await targetRef.update({ role });

    return NextResponse.json({
      message: `Role de ${targetDoc.data()?.email} atualizado para ${role}.`,
    }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar role:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
