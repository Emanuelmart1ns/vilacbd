"use client";

import React, { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct } from "@/lib/firebase";
import { products as staticProducts } from "@/data/products";

export default function ProdutosAdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      if (data.length === 0) {
        // Se a BD estiver vazia, mostramos os estáticos para o utilizador saber que existem
        setProducts(staticProducts);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setProducts(staticProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const name = prompt("Nome do produto:");
    if (!name) return;
    const price = parseFloat(prompt("Preço de venda:", "25.00") || "0");
    const cost = parseFloat(prompt("Preço de custo:", "10.00") || "0");
    const category = prompt("Categoria:", "Óleos e Tinturas") || "Geral";
    
    const newProduct = {
      name,
      price,
      cost,
      category,
      stock: 50,
      color: "linear-gradient(135deg, #1e3c27, #2a6344)",
      description: "Novo produto adicionado via admin."
    };

    try {
      await addProduct(newProduct);
      fetchProducts();
    } catch (error) {
      alert("Erro ao adicionar produto.");
    }
  };

  const handleEdit = async (product: any) => {
    const newName = prompt("Novo nome:", product.name);
    if (!newName) return;
    const newPrice = parseFloat(prompt("Novo preço:", product.price.toString()) || "0");
    
    try {
      await updateProduct(product.id, { ...product, name: newName, price: newPrice });
      fetchProducts();
    } catch (error) {
      alert("Erro ao editar produto.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      alert("Erro ao eliminar produto.");
    }
  };

  return (
    <div className="produtos-admin-page">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestão do Catálogo</h2>
        <button className="btn-primary" onClick={handleAdd}>+ Adicionar Novo Produto</button>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>A carregar produtos...</div>
        ) : (
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
                const lucro = product.price - (product.cost || 0);
                return (
                  <tr key={product.id}>
                    <td>
                      <div 
                        style={{ 
                          width: 40, height: 40, borderRadius: 8, 
                          background: product.color || "#121812",
                          backgroundImage: product.image ? `url(${product.image})` : 'none',
                          backgroundSize: 'cover'
                        }} 
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>€ {(product.cost || 0).toFixed(2)}</td>
                    <td>€ {product.price.toFixed(2)}</td>
                    <td style={{ color: "var(--accent-green-light)" }}>+ € {lucro.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${(product.stock || 0) > 10 ? 'pago' : 'pendente'}`}>
                        {product.stock || 0} un.
                      </span>
                    </td>
                    <td>
                      <button className="btn-text" onClick={() => handleEdit(product)}>Editar</button> | 
                      <button className="btn-text text-danger" onClick={() => handleDelete(product.id)}>Remover</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
