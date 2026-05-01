import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const key = "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";
    
    await db.collection("settings").doc("global").set({
      socials: {
        openRouterKey: key
      }
    }, { merge: true });

    return NextResponse.json({ success: true, message: "OpenRouter Key guardada no Firestore com sucesso!" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
