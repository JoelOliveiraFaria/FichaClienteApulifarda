import { useState } from "react";

export default function ClienteList({ clientes, onEdit, onVerEncomendas, onDelete }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar este cliente?")) return;
    
    try {
      await window.electronAPI.deleteCliente(id);
      if (onDelete) onDelete(id);
    } catch (err) {
      console.error("Erro ao apagar cliente:", err);
      alert("Erro ao apagar cliente.");
    }
  };

  if (!Array.isArray(clientes)) {
    return <p>Carregando clientes...</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {clientes.map((c) => (
        <li 
          key={c.id}
          style={{ 
            padding: "10px", 
            marginBottom: "5px", 
            border: "1px solid #ddd", 
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>
            <strong>{c.nome}</strong> - {c.contatoPessoal} - {c.email}
          </span>
          <div>
            <button 
              onClick={() => onEdit(c)}
              style={{ marginRight: "5px", padding: "5px 10px" }}
            >
              Editar
            </button>
            <button 
              onClick={() => onVerEncomendas(c)}
              style={{ marginRight: "5px", padding: "5px 10px" }}
            >
              Ver Encomendas
            </button>
            <button 
              onClick={() => handleDelete(c.id)}
              style={{ padding: "5px 10px", backgroundColor: "#ff4444", color: "white" }}
            >
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
