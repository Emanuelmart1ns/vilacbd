import React from "react";
import { products } from "@/data/products";

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
              <th>Custo (Compra)</th>
              <th>PVP (Venda)</th>
              <th>Lucro Bruto</th>
              <th>Stock</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const lucro = product.price - product.cost;
              return (
                <tr key={product.id}>
                  <td>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8, background: "#121812" }} 
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>€ {product.cost.toFixed(2)}</td>
                  <td>€ {product.price.toFixed(2)}</td>
                  <td style={{ color: "var(--accent-green-light)" }}>+ € {lucro.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${product.stock > 10 ? 'pago' : 'pendente'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td>
                    <button className="btn-text">Editar</button> | <button className="btn-text text-danger">Remover</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
