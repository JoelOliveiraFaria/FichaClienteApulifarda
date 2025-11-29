import React, { useEffect, useState } from "react";
import EncomendaForm from "./EncomendaForm";

export default function EncomendaList({ clienteId }) {
  const [encomendas, setEncomendas] = useState([]);
  const [editing, setEditing] = useState(null); // encomenda que está a ser editada
  const [showForm, setShowForm] = useState(false);

  // Carregar encomendas do cliente
  const loadEncomendas = async () => {
    try {
      const data = await window.electronAPI.getEncomendas(clienteId);
      setEncomendas(data);
    } catch (err) {
      console.error("Erro ao carregar encomendas:", err);
    }
  };

  useEffect(() => {
    loadEncomendas();
  }, [clienteId]);

  // Apagar encomenda
  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar esta encomenda?")) return;

    try {
      await window.electronAPI.deleteEncomenda(id);
      loadEncomendas();
    } catch (err) {
      console.error("Erro ao apagar encomenda:", err);
    }
  };

  // Abrir form para editar
  const handleEdit = (encomenda) => {
    setEditing(encomenda);
    setShowForm(true);
  };

  // Abrir form para criar
  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
      <h2>Encomendas</h2>

      <button onClick={handleAdd} style={{ marginBottom: "10px" }}>
        Nova Encomenda
      </button>

      {showForm && (
        <EncomendaForm
          clienteId={clienteId}
          encomenda={editing}
          onSaved={() => {
            setShowForm(false);
            loadEncomendas();
          }}
        />
      )}

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Nome</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Tamanho</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Quantidade</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Preço (€)</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Observações</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {encomendas.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "5px" }}>
                Nenhuma encomenda encontrada
              </td>
            </tr>
          )}
          {encomendas.map((e) => (
            <tr key={e.id}>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{e.nome}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{e.tamanho}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{e.quantidade}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{e.preco.toFixed(2)}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{e.observacoes}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <button onClick={() => handleEdit(e)} style={{ marginRight: "5px" }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(e.id)}>Apagar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
