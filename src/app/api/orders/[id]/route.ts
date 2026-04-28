import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { shippingStatus, trackingCode } = await request.json();
    
    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ error: "Encomenda não encontrada" }, { status: 404 });
    }

    const updates: any = {};
    if (shippingStatus) updates.shippingStatus = shippingStatus;
    if (trackingCode !== undefined) updates.trackingCode = trackingCode;

    await orderRef.update(updates);

    // Opcional: Notificar o cliente por email ou o admin por Telegram aqui

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar encomenda:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
