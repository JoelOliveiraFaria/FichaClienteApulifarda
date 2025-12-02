import React, { useEffect, useState } from "react";
import EncomendaForm from "./EncomendaForm";

export default function EncomendaList({ clienteId }) {
  const [encomendas, setEncomendas] = useState([]);
  const [totais, setTotais] = useState({});   // { [id]: total }
  const [tamanhos, setTamanhos] = useState({}); // { [id]: "M×5, L×2" }
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadEncomendas = async () => {
    try {
      const data = await window.electronAPI.getEncomendas(clienteId);
      setEncomendas(data);

      const novosTotais = {};
      const novosTamanhos = {};

      for (const enc of data) {
        const itens = await window.electronAPI.getEncomendaItens(enc.id);

        const total = itens.reduce(
          (acc, it) =>
            acc + (Number(it.quantidade) || 0) * (Number(it.preco) || 0),
          0
        );
        novosTotais[enc.id] = total;

        // resumo de tamanhos, ex: "M×5, L×2"
        const resumo = itens
          .map(
            (it) =>
              `${it.tamanho || "—"}×${it.quantidade != null ? it.quantidade : 0}`
          )
          .join(", ");
        novosTamanhos[enc.id] = resumo || "—";
      }

      setTotais(novosTotais);
      setTamanhos(novosTamanhos);
    } catch (err) {
      console.error("Erro ao carregar encomendas:", err);
    }
  };

  useEffect(() => {
    if (clienteId) loadEncomendas();
  }, [clienteId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem a certeza que deseja apagar esta encomenda?")) return;

    try {
      await window.electronAPI.deleteEncomenda(id);
      loadEncomendas();
    } catch (err) {
      console.error("Erro ao apagar encomenda:", err);
    }
  };

  const handleEdit = async (encomenda) => {
    const itens = await window.electronAPI.getEncomendaItens(encomenda.id);
    setEditing({ ...encomenda, items: itens });
    setShowForm(true);
  };

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
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Tamanhos</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Data</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Observações</th>
            <th style={{ border: "1px solid #ccc", padding: "5px" }}>Total (€)</th>
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
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                {tamanhos[e.id] || "—"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                {e.dataCriacao
                  ? new Date(e.dataCriacao).toLocaleString()
                  : "—"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                {e.observacoes || "—"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                {totais[e.id] != null ? totais[e.id].toFixed(2) : "0.00"}
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                <button
                  onClick={() => handleEdit(e)}
                  style={{ marginRight: "5px" }}
                >
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
