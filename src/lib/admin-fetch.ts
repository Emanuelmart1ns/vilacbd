import { auth } from "./firebase";

/**
 * Obtém o Firebase ID Token do utilizador atual para enviar em chamadas de API admin.
 * Lança um erro se o utilizador não estiver autenticado.
 */
export async function getAdminAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new Error("Utilizador não autenticado.");
  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
