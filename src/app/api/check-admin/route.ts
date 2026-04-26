import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function GET() {
  try {
    const db = getAdminDb();
    const adminAuth = getAuth();
    const adminEmail = "emanuelfmartins@outlook.com";
    const userRecord = await adminAuth.getUserByEmail(adminEmail);
    const uid = userRecord.uid;
    const doc = await db.collection("users").doc(uid).get();
    if (doc.exists) {
      return NextResponse.json({ uid, email: adminEmail, data: doc.data() });
    }
    return NextResponse.json({ uid, email: adminEmail, exists: false });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
