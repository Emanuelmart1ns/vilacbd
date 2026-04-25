"use client";

import React, { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct, deleteProduct, FirestoreProduct, uploadProductImage } from "@/lib/firebase";
import { products as staticProducts } from "@/data/products";

export default function ProdutosAdminPage() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        if (!cancelled) {
          if (data.length === 0) {
            setProducts(staticProducts as unknown as FirestoreProduct[]);
          } else {
            setProducts(data);
          }
        }
      } catch {
        console.error("Erro ao carregar produtos");
        if (!cancelled) setProducts(staticProducts as unknown as FirestoreProduct[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openModal = (product: FirestoreProduct | null = null) => {
    setEditingProduct(product);
    setSecondaryImages(product?.images || []);
    setMainImageFile(null);
    setMainImagePreview(product?.image || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSecondaryImages([]);
    setMainImageFile(null);
    setMainImagePreview("");
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSecondaryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadProductImage(file, editingProduct?.id));
      const urls = await Promise.all(uploadPromises);
      setSecondaryImages(prev => [...prev, ...urls]);
    } catch (error) {
      alert("Erro ao fazer upload das imagens");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeSecondaryImage = (index: number) => {
    setSecondaryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      setUploadingImages(true);
      
      // Upload da imagem principal se houver
      let mainImageUrl = editingProduct?.image || "";
      if (mainImageFile) {
        mainImageUrl = await uploadProductImage(mainImageFile, editingProduct?.id);
      }

      const productData = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        cost: parseFloat(formData.get("cost") as string),
        stock: parseInt(formData.get("stock") as string),
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        image: mainImageUrl,
        images: secondaryImages,
        color: "linear-gradient(135deg, #1e3c27, #2a6344)", // Default
      };

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id as string, productData);
      } else {
        await addProduct(productData);
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setSecondaryImages([]);
      setMainImageFile(null);
      setMainImagePreview("");
      
      // Recarrega produtos
      const data = await getProducts(true);
      setProducts(data.length === 0 ? staticProducts as unknown as FirestoreProduct[] : data);
    } catch (error) {
      alert("Erro ao guardar produto.");
      console.error(error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;
    try {
      await deleteProduct(id);
      const data = await getProducts();
      setProducts(data.length === 0 ? staticProducts as unknown as FirestoreProduct[] : data);
    } catch {
      alert("Erro ao eliminar produto.");
    }
  };

  return (
    <div className="produtos-admin-page">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestão do Catálogo</h2>
        <button className="btn-primary" onClick={() => openModal()}>+ Adicionar Novo Produto</button>
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
                <th>Custo</th>
                <th>PVP</th>
                <th>Lucro</th>
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
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: product.color || "#121812", backgroundImage: product.image ? `url(${product.image})` : 'none', backgroundSize: 'cover' }} />
                    </td>
                    <td>{product.name}</td>
                    <td>€ {(product.cost || 0).toFixed(2)}</td>
                    <td>€ {product.price.toFixed(2)}</td>
                    <td style={{ color: "var(--accent-green-light)" }}>€ {lucro.toFixed(2)}</td>
                    <td>{product.stock || 0} un.</td>
                    <td>
                      <button className="btn-text" onClick={() => openModal(product)}>Editar</button> | 
                      <button className="btn-text text-danger" onClick={() => handleDelete(product.id)}>Remover</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          style={{ 
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(5px)",
            display: "flex", alignItems: "center", justifyContent: "center", 
            zIndex: 9999, padding: "20px"
          }}
        >
          <div className="modal-backdrop" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} onClick={closeModal}></div>
          <div 
            className="modal-content" 
            style={{ 
              position: "relative", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto",
              background: "#121812", border: "1px solid var(--glass-border)", borderRadius: "16px",
              padding: "32px", zIndex: 10000, boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
            }}
          >
            <h3 style={{ marginBottom: "20px", color: "var(--accent-gold)" }}>{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label>Nome</label>
                <input name="name" className="input-field" defaultValue={editingProduct?.name} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Preço de Venda (PVP)</label>
                  <input name="price" type="number" step="0.01" className="input-field" defaultValue={editingProduct?.price} required />
                </div>
                <div className="form-group">
                  <label>Custo de Compra</label>
                  <input name="cost" type="number" step="0.01" className="input-field" defaultValue={editingProduct?.cost} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Stock</label>
                  <input name="stock" type="number" className="input-field" defaultValue={editingProduct?.stock} required />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <input name="category" className="input-field" defaultValue={editingProduct?.category} required />
                </div>
              </div>
              <div className="form-group">
                <label>Imagem Principal</label>
                {mainImagePreview && (
                  <div style={{ marginBottom: "12px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                    <img src={mainImagePreview} alt="Preview" style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="input-field" 
                  style={{ padding: "8px" }}
                />
                <small style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Formatos aceites: JPG, PNG, WEBP</small>
              </div>

              {/* Imagens Secundárias */}
              <div className="form-group">
                <label>Imagens Secundárias ({secondaryImages.length})</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSecondaryImageChange}
                  className="input-field"
                  style={{ padding: "8px", marginBottom: "12px" }}
                  disabled={uploadingImages}
                />
                {uploadingImages && (
                  <p style={{ color: "var(--accent-gold)", fontSize: "0.9rem", marginBottom: "12px" }}>
                    A fazer upload das imagens...
                  </p>
                )}
                {secondaryImages.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "8px" }}>
                    {secondaryImages.map((img, index) => (
                      <div key={index} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
                        <img src={img} alt={`Imagem ${index + 1}`} style={{ width: "100%", height: "80px", objectFit: "cover", display: "block" }} />
                        <button
                          type="button"
                          onClick={() => removeSecondaryImage(index)}
                          style={{
                            position: "absolute", top: "2px", right: "2px",
                            background: "rgba(255,0,0,0.8)", color: "#fff", border: "none",
                            borderRadius: "50%", width: "20px", height: "20px",
                            cursor: "pointer", fontSize: "12px", lineHeight: "1",
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea name="description" className="input-field" style={{ minHeight: "100px" }} defaultValue={editingProduct?.description} />
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={closeModal} disabled={uploadingImages}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploadingImages}>
                  {uploadingImages ? "A guardar..." : "Guardar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
