import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getAdminApp } from "@/lib/firebase-admin";
import { getStorage } from "firebase-admin/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products/temp";
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    if (productId) {
      const db = getAdminDb();
      const productRef = db.collection("products").doc(productId);
      const doc = await productRef.get();
      if (doc.exists) {
        const currentImages = doc.data()?.images || [];
        await productRef.update({
          images: [...currentImages, dataUrl],
        });
      }
    }

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Delete failed", details: String(error) },
      { status: 500 }
    );
  }
}
