import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { verifyAdminToken } from "@/lib/auth-guard";

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if ("error" in auth) return auth.error;

  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getAdminDb();
    await db.collection("products").doc(id).update(data);
    revalidatePath("/loja", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Update failed", details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if ("error" in auth) return auth.error;

  try {
    const data = await request.json();
    const db = getAdminDb();
    const docRef = await db.collection("products").add(data);
    revalidatePath("/loja", "layout");
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Create failed", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if ("error" in auth) return auth.error;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getAdminDb();
    await db.collection("products").doc(id).delete();
    revalidatePath("/loja", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Delete failed", details: String(error) }, { status: 500 });
  }
}
