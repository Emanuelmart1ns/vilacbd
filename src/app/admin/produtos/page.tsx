"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getProducts,
  FirestoreProduct,
  uploadProductImage,
} from "@/lib/firebase";
import { products as staticProducts } from "@/data/products";

const CATEGORIES = [
  "Óleos e Tinturas",
  "Flores de Cânhamo",
  "Gomas e Edibles",
  "Tópicos e Cosméticos",
  "Acessórios e Vapes",
];

export default function ProdutosAdminPage() {
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
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
        const data = await getProducts(true); // Force refresh
        if (!cancelled) {
          const merged = mergeProducts(staticProducts as unknown as FirestoreProduct[], data);
          setProducts(merged);
        }
      } catch {
        if (!cancelled) setProducts(staticProducts as unknown as FirestoreProduct[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openModal = (product: FirestoreProduct | null = null) => {
    setEditingProduct(product);
    setSecondaryImages(product?.images || []);
    setMainImageFile(null);
    setMainImagePreview(product?.image || "");
    setIsPopular(product?.isPopular || false);
    setColorValue(product?.color || "linear-gradient(135deg, #1e3c27, #2a6344)");
    setValidationErrors({});
    setUploadProgress("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSecondaryImages([]);
    setMainImageFile(null);
    setMainImagePreview("");
    setIsPopular(false);
    setColorValue("linear-gradient(135deg, #1e3c27, #2a6344)");
    setValidationErrors({});
    setUploadProgress("");
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
        
        // Fundo branco para garantir que transparências não ficam pretas no WebP/JPG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        
        ctx.drawImage(img, 0, 0, w, h);
        // Usar WebP para máxima compressão
        resolve(canvas.toDataURL("image/webp", quality));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSecondaryFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setUploadProgress(`A processar 0/${files.length} imagens...`);
    try {
      const urls: string[] = [];
      const fileArr = Array.from(files);
      for (let i = 0; i < fileArr.length; i++) {
        setUploadProgress(`A processar ${i + 1}/${fileArr.length} imagens...`);
        const url = await compressImage(fileArr[i]);
        urls.push(url);
      }
      setSecondaryImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload das imagens: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setUploadingImages(false);
      setUploadProgress("");
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

  const handleMainDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleMainDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMainDragOver(true);
  }, []);

  const handleMainDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMainDragOver(false);
  }, []);

  const handleMainDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setMainDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type.startsWith("image/")) {
        handleMainImageFile(files[0]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingProduct]
  );

  const handleSecDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSecDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSecDragOver(true);
  }, []);

  const handleSecDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSecDragOver(false);
  }, []);

  const handleSecDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSecDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleSecondaryFiles(files);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingProduct, uploadingImages]
  );

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
      setUploadProgress("A preparar imagens...");

      // 1. Lidar com a imagem principal
      let mainImageUrl = mainImagePreview;
      if (mainImageFile) {
        setUploadProgress("A otimizar imagem principal...");
        mainImageUrl = await compressImage(mainImageFile);
      }

      // 2. Lidar com imagens secundárias
      const finalSecondaryImages: string[] = [];
      for (let i = 0; i < secondaryImages.length; i++) {
        const img = secondaryImages[i];
        if (img.startsWith("data:")) {
          // Já está em base64 (possivelmente já otimizado pelo handleSecondaryFiles)
          finalSecondaryImages.push(img);
        } else {
          // É um URL antigo ou ficheiro
          finalSecondaryImages.push(img);
        }
      }

      const productData = {
        name: formData.get("name") as string,
        price: parseFloat(formData.get("price") as string),
        cost: parseFloat(formData.get("cost") as string),
        stock: parseInt(formData.get("stock") as string),
        category: formData.get("category") as string,
        description: formData.get("description") as string,
        image: mainImageUrl,
        images: finalSecondaryImages,
        color: colorValue,
        isPopular: isPopular,
      };

      setUploadProgress("A guardar dados no servidor...");
      if (editingProduct?.id) {
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProduct.id, ...productData }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.details || "Erro ao atualizar");
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.details || "Erro ao criar");
        }
      }

      closeModal();

      // Recarregar lista
      const data = await getProducts(true);
      const merged = mergeProducts(staticProducts as unknown as FirestoreProduct[], data);
      setProducts(merged);
    } catch (error) {
      alert("Erro ao guardar produto: " + (error instanceof Error ? error.message : "Erro desconhecido"));
      console.error(error);
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
      if (existing) {
         mergedMap.set(fb.id, {
           ...existing,
           ...fb,
           images: fb.images !== undefined ? fb.images : existing.images,
         });
      } else {
         mergedMap.set(fb.id, fb);
      }
    });
    return Array.from(mergedMap.values());
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Erro ao eliminar");
      const data = await getProducts();
      setProducts(data.length === 0 ? (staticProducts as unknown as FirestoreProduct[]) : data);
    } catch {
      alert("Erro ao eliminar produto.");
    }
  };

  const imageCount = (product: FirestoreProduct) => {
    let count = 0;
    if (product.image) count++;
    if (product.images) count += product.images.length;
    return count;
  };

  const extractColorsFromGradient = (gradient: string): string => {
    const hexMatch = gradient.match(/#[0-9a-fA-F]{6}/g);
    if (hexMatch && hexMatch.length >= 2) {
      return `linear-gradient(135deg, ${hexMatch[0]}, ${hexMatch[1]})`;
    }
    if (hexMatch && hexMatch.length === 1) {
      return hexMatch[0];
    }
    return gradient;
  };

  return (
    <div className="produtos-admin-page">
      <header className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestão do Catálogo</h2>
        <button className="btn-primary" onClick={() => openModal()}>
          + Adicionar Novo Produto
        </button>
      </header>

      <div className="glass-panel" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>A carregar produtos...</div>
        ) : (
          <table className="admin-table admin-table-products">
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
                const imgCount = imageCount(product);
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-thumb-wrapper">
                        {product.image ? (
                          <div
                            className="product-thumb"
                            style={{ backgroundImage: `url(${product.image})` }}
                          />
                        ) : (
                          <div className="product-thumb-placeholder">
                            <span>Sem imagem</span>
                          </div>
                        )}
                        {imgCount > 0 && (
                          <span className="product-thumb-badge">{imgCount} foto{imgCount > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-name-cell">
                        {product.isPopular && <span className="popular-star">⭐</span>}
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>€ {(product.cost || 0).toFixed(2)}</td>
                    <td>€ {product.price.toFixed(2)}</td>
                    <td style={{ color: "var(--accent-green-light)" }}>€ {lucro.toFixed(2)}</td>
                    <td>{product.stock || 0} un.</td>
                    <td>
                      <button className="btn-text" onClick={() => openModal(product)}>
                        Editar
                      </button>{" "}
                      |{" "}
                      <button className="btn-text text-danger" onClick={() => handleDelete(product.id)}>
                        Remover
                      </button>
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
                  <input
                    name="name"
                    className={`input-field${validationErrors.name ? " input-error" : ""}`}
                    defaultValue={editingProduct?.name}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preço de Venda (PVP) *</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      className={`input-field${validationErrors.price ? " input-error" : ""}`}
                      defaultValue={editingProduct?.price}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Custo de Compra *</label>
                    <input
                      name="cost"
                      type="number"
                      step="0.01"
                      className={`input-field${validationErrors.cost ? " input-error" : ""}`}
                      defaultValue={editingProduct?.cost}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock *</label>
                    <input
                      name="stock"
                      type="number"
                      className={`input-field${validationErrors.stock ? " input-error" : ""}`}
                      defaultValue={editingProduct?.stock}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoria *</label>
                    <select
                      name="category"
                      className={`input-field${validationErrors.category ? " input-error" : ""}`}
                      defaultValue={editingProduct?.category || ""}
                      required
                    >
                      <option value="" disabled>
                        Selecionar categoria...
                      </option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea
                    name="description"
                    className="input-field"
                    style={{ minHeight: "100px" }}
                    defaultValue={editingProduct?.description}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Imagem Principal</h4>
                {mainImagePreview && (
                  <div className="main-image-preview">
                    <img src={mainImagePreview} alt="Preview" onClick={() => mainFileInputRef.current?.click()} style={{ cursor: "pointer" }} title="Clique para substituir" />
                    <button type="button" className="btn-remove-image" onClick={removeMainImage}>
                      Remover imagem
                    </button>
                  </div>
                )}
                <div
                  ref={mainDropRef}
                  className={`drop-zone${mainDragOver ? " drop-zone-active" : ""}`}
                  onDragOver={handleMainDrag}
                  onDragEnter={handleMainDragEnter}
                  onDragLeave={handleMainDragLeave}
                  onDrop={handleMainDrop}
                  onClick={() => mainFileInputRef.current?.click()}
                >
                  <div className="drop-zone-content">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Arraste uma imagem ou clique para selecionar</p>
                    <small>JPG, PNG ou WEBP</small>
                  </div>
                  <input
                    ref={mainFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Imagens Secundárias ({secondaryImages.length})</h4>
                <div
                  ref={secDropRef}
                  className={`drop-zone drop-zone-small${secDragOver ? " drop-zone-active" : ""}`}
                  onDragOver={handleSecDrag}
                  onDragEnter={handleSecDragEnter}
                  onDragLeave={handleSecDragLeave}
                  onDrop={handleSecDrop}
                  onClick={() => !uploadingImages && secFileInputRef.current?.click()}
                  style={uploadingImages ? { opacity: 0.5, pointerEvents: "none" } : undefined}
                >
                  <div className="drop-zone-content">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p>Arraste imagens ou clique para selecionar</p>
                    <small>Pode selecionar várias imagens</small>
                  </div>
                  <input
                    ref={secFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSecondaryImageChange}
                    style={{ display: "none" }}
                  />
                </div>
                {uploadingImages && uploadProgress && (
                  <div className="upload-progress">{uploadProgress}</div>
                )}
                {secondaryImages.length > 0 && (
                  <div className="secondary-images-grid">
                    {secondaryImages.map((img, index) => (
                      <div key={index} className="secondary-image-item">
                        <img src={img} alt={`Imagem ${index + 1}`} onClick={() => handleReplaceImage(index)} style={{ cursor: "pointer" }} title="Clique para substituir" />
                        <div className="secondary-image-controls">
                          <button
                            type="button"
                            className="btn-reorder"
                            disabled={index === 0}
                            onClick={() => moveSecondaryImage(index, "up")}
                            title="Mover para cima"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-reorder btn-reorder-down"
                            disabled={index === secondaryImages.length - 1}
                            onClick={() => moveSecondaryImage(index, "down")}
                            title="Mover para baixo"
                          >
                            ▼
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn-delete-image"
                          onClick={() => removeSecondaryImage(index)}
                          title="Remover imagem"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Configurações</h4>
                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-switch" />
                    <span className="toggle-text">Produto Popular (aparece nos Mais Vendidos)</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Cor / Gradiente</label>
                  <div className="color-input-row">
                    <input
                      type="text"
                      className="input-field"
                      value={colorValue}
                      onChange={(e) => setColorValue(e.target.value)}
                      placeholder="linear-gradient(135deg, #1e3c27, #2a6344)"
                    />
                    <div
                      className="color-preview-swatch"
                      style={{ background: extractColorsFromGradient(colorValue) }}
                    />
                  </div>
                  <small style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                    Ex: linear-gradient(135deg, #1e3c27, #2a6344) ou #2a6344
                  </small>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={closeModal} disabled={uploadingImages}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={uploadingImages}>
                  {uploadingImages ? "A guardar..." : "Guardar Produto"}
                </button>
              </div>
              <input
                ref={replaceFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceFile}
                style={{ display: "none" }}
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
