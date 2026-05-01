import { getAuth } from "firebase-admin/auth";
import { getAdminDb } from "./firebase-admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * Verifica se o pedido vem de um admin autenticado via Firebase ID Token.
 * Retorna { uid } se válido, ou { error: NextResponse } se inválido.
 */
export async function verifyAdminToken(
  request: NextRequest
): Promise<{ uid: string } | { error: NextResponse }> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: missing token" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const db = getAdminDb();
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (userDoc.data()?.role !== "admin") {
      return {
        error: NextResponse.json(
          { error: "Forbidden: admin role required" },
          { status: 403 }
        ),
      };
    }

    return { uid: decoded.uid };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: invalid token" },
        { status: 401 }
      ),
    };
  }
}
