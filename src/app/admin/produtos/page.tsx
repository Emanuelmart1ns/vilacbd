import React from "react";

export default function ProdutosAdminPage() {
  return (
    <div className="produtos-admin-page">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Gestão do Catálogo</h2>
        <button className="btn-primary">+ Adicionar Novo Produto</button>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome do Produto</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Stock</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div className="img-placeholder" style={{ width: 40, height: 40, background: "#2a6344", borderRadius: 8 }}></div></td>
              <td>Óleo Premium 10% CBD (Full Spectrum)</td>
              <td>Óleos e Tinturas</td>
              <td>€ 35.00</td>
              <td><span className="badge pago">50 un.</span></td>
              <td>
                <button className="btn-text">Editar</button> | <button className="btn-text text-danger">Remover</button>
              </td>
            </tr>
            <tr>
              <td><div className="img-placeholder" style={{ width: 40, height: 40, background: "#cfaa6b", borderRadius: 8 }}></div></td>
              <td>Gomas Relaxantes CBD (Sabor Morango)</td>
              <td>Gomas e Edibles</td>
              <td>€ 24.50</td>
              <td><span className="badge pendente">3 un.</span></td>
              <td>
                <button className="btn-text">Editar</button> | <button className="btn-text text-danger">Remover</button>
              </td>
            </tr>
            <tr>
              <td><div className="img-placeholder" style={{ width: 40, height: 40, background: "#121812", borderRadius: 8 }}></div></td>
              <td>Bálsamo Muscular Recuperação</td>
              <td>Tópicos</td>
              <td>€ 42.00</td>
              <td><span className="badge pago">120 un.</span></td>
              <td>
                <button className="btn-text">Editar</button> | <button className="btn-text text-danger">Remover</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
