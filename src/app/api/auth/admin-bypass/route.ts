import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    getAdminDb();
    const adminAuth = getAuth();

    const adminEmail = process.env.ADMIN_EMAIL || "emanuelfmartins@outlook.com";
    const adminUid = process.env.ADMIN_UID;

    let uid: string;
    if (adminUid) {
      uid = adminUid;
    } else {
      const userRecord = await adminAuth.getUserByEmail(adminEmail);
      uid = userRecord.uid;
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      const ownerEmail = "emanuelfmartins@outlook.com";
      if (adminEmail !== ownerEmail) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }
      if (!userDoc.exists) {
        await userRef.set({
          uid,
          email: adminEmail,
          displayName: "Admin",
          role: "admin",
          provider: "admin-bypass",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1,
        });
      } else {
        await userRef.update({ role: "admin", lastLogin: new Date().toISOString() });
      }
    } else {
      await userRef.update({ lastLogin: new Date().toISOString() });
    }

    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ customToken, uid });
  } catch (error) {
    console.error("Admin bypass error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
