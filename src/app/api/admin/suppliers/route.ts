import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("suppliers").orderBy("name").get();
    const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(suppliers);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const docRef = await db.collection("suppliers").add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ id: docRef.id, ...data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getAdminDb();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await db.collection("suppliers").doc(id).update({
      ...updateData,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    await db.collection("suppliers").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
