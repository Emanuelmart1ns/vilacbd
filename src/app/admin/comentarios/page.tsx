"use client";

import React, { useEffect, useState } from "react";
import { getReviews, deleteReview, FirestoreReview } from "@/lib/firebase";

export default function ComentariosAdminPage() {
  const [reviews, setReviews] = useState<FirestoreReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getReviews();
        if (!cancelled) setReviews(data);
      } catch {
        console.error("Erro ao carregar comentários");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este comentário?")) return;
    try {
      await deleteReview(id);
      const data = await getReviews();
      setReviews(data);
    } catch {
      alert("Erro ao eliminar comentário.");
    }
  };

  return (
    <div className="comentarios-admin-page">
      <header className="page-header">
        <h2>Gestão de Comentários & Avaliações</h2>
        <p style={{ color: "var(--text-secondary)" }}>Modere o que os seus clientes dizem sobre os produtos.</p>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>A carregar comentários...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Ainda não existem comentários.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Utilizador</th>
                <th>Comentário</th>
                <th>Rating</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td style={{ fontSize: "0.85rem" }}>{new Date(review.date).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{review.userName}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{review.userEmail}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: "400px" }}>
                    <p style={{ fontSize: "0.9rem", fontStyle: "italic" }}>&ldquo;{review.comment}&rdquo;</p>
                  </td>
                  <td>
                    <span style={{ color: "var(--accent-gold)" }}>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span>
                  </td>
                  <td>
                    <button className="btn-text text-danger" onClick={() => handleDelete(review.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
