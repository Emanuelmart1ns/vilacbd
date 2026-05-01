"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getProducts,
  FirestoreProduct,
  uploadProductImage,
} from "@/lib/firebase";
import { products as staticProducts } from "@/data/products";
import { getAdminAuthHeaders } from "@/lib/admin-fetch";

export default function ProdutosAdminPage() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsCategories, setSettingsCategories] = useState<{name: string, subcategories: string[]}[]>([]);
  const [suppliers, setSuppliers] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<string[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [colorValue, setColorValue] = useState("linear-gradient(135deg, #1e3c27, #2a6344)");
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [mainDragOver, setMainDragOver] = useState(false);
  const [secDragOver, setSecDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const mainDropRef = useRef<HTMLDivElement>(null);
  const secDropRef = useRef<HTMLDivElement>(null);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const secFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceImageIndex, setReplaceImageIndex] = useState<number>(-1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getProducts(true);
        if (!cancelled) {
          const merged = mergeProducts(staticProducts as unknown as FirestoreProduct[], data);
          setProducts(merged);
        }
        
        const settingsRes = await fetch("/api/settings");
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.categories && !cancelled) setSettingsCategories(settingsData.categories);
        }

        const suppliersHeaders = await getAdminAuthHeaders();
        const suppliersRes = await fetch("/api/admin/suppliers", { headers: suppliersHeaders });
        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json();
          if (!cancelled) setSuppliers(suppliersData);
        }
      } catch {
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
    setIsPopular(product?.isPopular || false);
    setColorValue(product?.color || "linear-gradient(135deg, #1e3c27, #2a6344)");
    setSelectedCategory(product?.category || "");
    setSelectedSupplier(product?.supplierId || "");
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSecondaryImages([]);
    setMainImagePreview("");
    setSelectedSupplier("");
  };

  const handleReplaceImage = (index: number) => {
    setReplaceImageIndex(index);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceImageIndex < 0) return;
    const url = await compressImage(file);
    setSecondaryImages(prev => {
      const updated = [...prev];
      updated[replaceImageIndex] = url;
      return updated;
    });
    setReplaceImageIndex(-1);
    e.target.value = "";
  };

  const handleMainImageFile = (file: File) => {
    setMainImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleMainImageFile(file);
  };

  const removeMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
    if (mainFileInputRef.current) mainFileInputRef.current.value = "";
  };

  const compressImage = (file: File, maxSize = 450, quality = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
          else { w = Math.round(w * maxSize / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/webp", quality));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSecondaryFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const urls: string[] = [];
      const fileArr = Array.from(files);
      for (let i = 0; i < fileArr.length; i++) {
        const url = await compressImage(fileArr[i]);
        urls.push(url);
      }
      setSecondaryImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Erro no upload:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSecondaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handleSecondaryFiles(files);
  };

  const removeSecondaryImage = async (index: number) => {
    setSecondaryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSecondaryImage = (index: number, direction: "up" | "down") => {
    setSecondaryImages((prev) => {
      const newArr = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
      return newArr;
    });
  };

  const handleMainDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleMainDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setMainDragOver(true); };
  const handleMainDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setMainDragOver(false); };
  const handleMainDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setMainDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) handleMainImageFile(files[0]);
  };

  const handleSecDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleSecDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setSecDragOver(true); };
  const handleSecDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setSecDragOver(false); };
  const handleSecDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setSecDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleSecondaryFiles(files);
  };

  const validateForm = (formData: FormData): boolean => {
    const errors: Record<string, boolean> = {};
    if (!formData.get("name")) errors.name = true;
    if (!formData.get("price")) errors.price = true;
    if (!formData.get("cost")) errors.cost = true;
    if (!formData.get("stock")) errors.stock = true;
    if (!formData.get("category")) errors.category = true;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) return;

    try {
      setUploadingImages(true);
      let mainImageUrl = mainImagePreview;
      if (mainImageFile) mainImageUrl = await compressImage(mainImageFile);

      const productData = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        cost: parseFloat(formData.get("cost") as string),
        stock: parseInt(formData.get("stock") as string),
        category: formData.get("category") as string,
        subcategory: formData.get("subcategory") as string || "",
        description: formData.get("description") as string,
        image: mainImageUrl,
        images: secondaryImages,
        color: colorValue,
        isPopular: isPopular,
        supplierId: selectedSupplier
      };

      const authHeaders = await getAdminAuthHeaders();
      setUploadProgress("A guardar dados...");
      if (editingProduct?.id) {
        await fetch("/api/products", {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({ id: editingProduct.id, ...productData }),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(productData),
        });
      }

      closeModal();
      const data = await getProducts(true);
      setProducts(mergeProducts(staticProducts as unknown as FirestoreProduct[], data));
    } catch (error) {
      alert("Erro ao guardar");
    } finally {
      setUploadingImages(false);
      setUploadProgress("");
    }
  };

  function mergeProducts(staticProds: FirestoreProduct[], fbProds: FirestoreProduct[]): FirestoreProduct[] {
    const mergedMap = new Map<string, FirestoreProduct>();
    staticProds.forEach(p => mergedMap.set(p.id, p));
    fbProds.forEach(fb => {
      const existing = mergedMap.get(fb.id);
      if (existing) mergedMap.set(fb.id, { ...existing, ...fb, images: fb.images !== undefined ? fb.images : existing.images });
      else mergedMap.set(fb.id, fb);
    });
    return Array.from(mergedMap.values());
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza?")) return;
    try {
      const headers = await getAdminAuthHeaders();
      await fetch("/api/products", { method: "DELETE", headers, body: JSON.stringify({ id }) });
      const data = await getProducts(true);
      setProducts(data);
    } catch { alert("Erro ao eliminar"); }
  };

  const imageCount = (product: FirestoreProduct) => {
    let count = 0;
    if (product.image) count++;
    if (product.images) count += product.images.length;
    return count;
  };

  const extractColorsFromGradient = (gradient: string): string => {
    const hexMatch = gradient.match(/#[0-9a-fA-F]{6}/g);
    if (hexMatch && hexMatch.length >= 2) return `linear-gradient(135deg, ${hexMatch[0]}, ${hexMatch[1]})`;
    return gradient;
  };

  return (
    <div className="produtos-admin-page">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestão do Catálogo</h2>
        <button className="btn-primary" onClick={() => openModal()}>+ Adicionar Novo Produto</button>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>A carregar...</div>
        ) : (
          <table className="admin-table admin-table-products">
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Custo</th>
                <th>PVP</th>
                <th>Stock</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const imgCount = imageCount(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-thumb-wrapper">
                        {product.image ? <div className="product-thumb" style={{ backgroundImage: `url(${product.image})` }} /> : <div className="product-thumb-placeholder">Sem foto</div>}
                        {imgCount > 0 && <span className="product-thumb-badge">{imgCount} foto{imgCount > 1 ? "s" : ""}</span>}
                      </div>
                    </td>
                    <td>{product.name}</td>
                    <td>€ {(product.cost || 0).toFixed(2)}</td>
                    <td>€ {product.price.toFixed(2)}</td>
                    <td>{product.stock || 0} un.</td>
                    <td>
                      <button className="btn-text" onClick={() => openModal(product)}>Editar</button> |{" "}
                      <button className="btn-text text-danger" onClick={() => handleDelete(product.id)}>Remover</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={closeModal} />
          <div className="modal-content modal-content-wide">
            <h3 className="modal-title">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
            <form onSubmit={handleSave} className="product-form">
              <div className="form-section">
                <h4 className="form-section-title">Informações Gerais</h4>
                <div className="form-group">
                  <label>Nome *</label>
                  <input name="name" className={`input-field${validationErrors.name ? " input-error" : ""}`} defaultValue={editingProduct?.name} required />
                </div>
                <div className="form-row">
                  <div className="form-group"><label>PVP *</label><input name="price" type="number" step="0.01" className="input-field" defaultValue={editingProduct?.price} required /></div>
                  <div className="form-group"><label>Custo *</label><input name="cost" type="number" step="0.01" className="input-field" defaultValue={editingProduct?.cost} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Stock *</label><input name="stock" type="number" className="input-field" defaultValue={editingProduct?.stock} required /></div>
                  <div className="form-group">
                    <label>Categoria *</label>
                    <select name="category" className="input-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
                      <option value="" disabled>Selecionar...</option>
                      {settingsCategories.map((cat) => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Imagem Principal</h4>
                {mainImagePreview && (
                  <div className="main-image-preview">
                    <img src={mainImagePreview} alt="Preview" />
                    <button type="button" className="btn-remove-image" onClick={removeMainImage}>Remover</button>
                  </div>
                )}
                <div className={`drop-zone${mainDragOver ? " drop-zone-active" : ""}`} onDragOver={handleMainDrag} onDragEnter={handleMainDragEnter} onDragLeave={handleMainDragLeave} onDrop={handleMainDrop} onClick={() => mainFileInputRef.current?.click()}>
                  <p>Clique ou arraste a imagem principal</p>
                  <input ref={mainFileInputRef} type="file" accept="image/*" onChange={handleMainImageChange} style={{ display: "none" }} />
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Configurações e Origem</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fornecedor</label>
                    <select className="input-field" value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
                      <option value="">Sem fornecedor (Geral)</option>
                      {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="toggle-label" style={{marginTop: "28px"}}>
                      <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="toggle-checkbox" />
                      <span className="toggle-switch" />
                      <span className="toggle-text">Destaque</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={uploadingImages}>{uploadingImages ? "A guardar..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
