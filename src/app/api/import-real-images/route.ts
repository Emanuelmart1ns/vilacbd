import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Imagens reais de CBD - URLs de bancos gratuitos e sites Vila CBD
    const imageUrls = [
      // Imagens da Vila CBD Santa Maria da Feira (do horário-loja.pt)
      "https://lh5.googleusercontent.com/p/AF1QipMCQ-X7WZLNODiMNk7xO7TiecFkcxfoE2pzSrT5=w400-h400-k-no",

      // Imagens de CBD de bancos gratuitos
      "https://images.unsplash.com/photo-1594736797933-d0401ba4c4a8?w=400",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1604079615735-03873a9b29c7?w=400",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
      "https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=400",
      "https://images.unsplash.com/photo-1594736797933-d0401ba4c4a8?w=400",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1604079615735-03873a9b29c7?w=400",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
      "https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=400",
      "https://images.unsplash.com/photo-1594736797933-d0401ba4c4a8?w=400",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1604079615735-03873a9b29c7?w=400",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
      "https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=400",
      "https://images.unsplash.com/photo-1594736797933-d0401ba4c4a8?w=400",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1604079615735-03873a9b29c7?w=400",
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
      "https://images.unsplash.com/photo-1610438235354-a6ae5528385c?w=400",
    ];

    const compressImage = async (url: string): Promise<string> => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch");
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        return dataUrl;
      } catch {
        // Fallback SVG
        return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#2a6344"/><text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="20" fill="#fff">CBD Image</text></svg>`).toString("base64")}`;
      }
    };

    const compressedImages = await Promise.all(imageUrls.map(compressImage));

    const db = getAdminDb();
    const products = await db.collection("products").get();
    const productIds = products.docs.map(doc => doc.id);

    const updates: Promise<any>[] = [];
    let imgIndex = 0;

    for (const productId of productIds) {
      const mainImage = compressedImages[imgIndex % compressedImages.length];
      const secondaryImages = [
        compressedImages[(imgIndex + 1) % compressedImages.length],
        compressedImages[(imgIndex + 2) % compressedImages.length],
        compressedImages[(imgIndex + 3) % compressedImages.length],
      ];

      updates.push(
        db.collection("products").doc(productId).update({
          image: mainImage,
          images: secondaryImages,
        })
      );

      imgIndex += 4;
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, updated: productIds.length });
  } catch (error) {
    console.error("Import images error:", error);
    return NextResponse.json({ error: "Failed", details: String(error) }, { status: 500 });
  }
}
