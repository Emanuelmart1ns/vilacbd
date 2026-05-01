"use client";

import React, { useState, useEffect } from "react";
import { getAdminAuthHeaders } from "@/lib/admin-fetch";

interface Supplier {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
  category: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    nif: "",
    email: "",
    phone: "",
    address: "",
    category: ""
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/suppliers", { headers });
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (supplier: Supplier | null = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        nif: supplier.nif || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        category: supplier.category || ""
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: "", nif: "", email: "", phone: "", address: "", category: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingSupplier ? "PUT" : "POST";
    const body = editingSupplier ? { id: editingSupplier.id, ...formData } : formData;

    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch("/api/admin/suppliers", {
        method,
        headers,
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchSuppliers();
      }
    } catch (error) {
      alert("Erro ao guardar fornecedor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que deseja eliminar este fornecedor?")) return;
    try {
      const headers = await getAdminAuthHeaders();
      const res = await fetch(`/api/admin/suppliers?id=${id}`, { method: "DELETE", headers });
      if (res.ok) fetchSuppliers();
    } catch (error) {
      alert("Erro ao eliminar");
    }
  };

  return (
    <div className="suppliers-page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1>Gestão de Fornecedores</h1>
          <p style={{ color: "var(--text-secondary)" }}>Administre os parceiros e fornecedores da Vila CBD</p>
        </div>
        <button className="btn-action" onClick={() => handleOpenModal()}>+ Novo Fornecedor</button>
      </div>

      <div className="glass-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome / Empresa</th>
              <th>NIF</th>
              <th>Categoria</th>
              <th>Contacto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>A carregar...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan={5}>Nenhum fornecedor registado.</td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: "bold" }}>{s.name}</td>
                  <td>{s.nif || "-"}</td>
                  <td><span className="badge" style={{ background: "rgba(212, 175, 55, 0.1)", color: "var(--accent-gold)" }}>{s.category || "Geral"}</span></td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{s.email}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{s.phone}</div>
                  </td>
                  <td>
                    <button className="btn-text" onClick={() => handleOpenModal(s)}>Editar</button>
                    <button className="btn-text text-danger" style={{ marginLeft: "12px" }} onClick={() => handleDelete(s.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Nome da Empresa / Fornecedor *</label>
                <input 
                  className="input-field" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>NIF</label>
                  <input 
                    className="input-field" 
                    value={formData.nif} 
                    onChange={e => setFormData({...formData, nif: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <input 
                    className="input-field" 
                    placeholder="ex: Flores, Óleos, Embalagens"
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    className="input-field" 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Telemóvel / Telefone</label>
                  <input 
                    className="input-field" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Morada / Sede</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: "80px" }}
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-action">Guardar Fornecedor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
