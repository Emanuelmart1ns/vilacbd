import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, targetEmail } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Token em falta." }, { status: 400 });
    }

    const db = getAdminDb();
    const adminAuth = getAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ error: "Email não encontrado." }, { status: 400 });
    }


    const targetUid = targetEmail ? undefined : uid;
    const targetUserEmail = targetEmail || email;

    if (!targetUid) {
      const userRecords = await adminAuth.getUserByEmail(targetUserEmail);
      const targetUserRef = db.collection("users").doc(userRecords.uid);
      const targetUserDoc = await targetUserRef.get();

      if (!targetUserDoc.exists) {
        return NextResponse.json({ error: `Utilizador ${targetUserEmail} não encontrado na BD.` }, { status: 404 });
      }

      await targetUserRef.update({ role: "admin" });
      return NextResponse.json({ message: `${targetUserEmail} é agora admin.`, uid: userRecords.uid }, { status: 200 });
    }

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });
    }

    await userRef.update({ role: "admin" });
    return NextResponse.json({ message: "Agora é admin.", uid }, { status: 200 });
  } catch (error) {
    console.error("Erro ao definir admin:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
