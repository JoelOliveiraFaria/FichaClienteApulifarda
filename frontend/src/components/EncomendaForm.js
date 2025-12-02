import React, { useState, useEffect } from "react";

export default function EncomendaForm({ clienteId, encomenda, onSaved }) {
  const [nome, setNome] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [items, setItems] = useState([
    { tamanho: "", quantidade: 1, preco: 0 },
  ]);

  // quando muda a encomenda (editar vs nova), sincroniza o form
  useEffect(() => {
    if (encomenda) {
      setNome(encomenda.nome || "");
      setObservacoes(encomenda.observacoes || "");
      // se vierem itens da encomenda, usa-os; senão põe uma linha vazia
      if (Array.isArray(encomenda.items) && encomenda.items.length > 0) {
        setItems(
          encomenda.items.map((it) => ({
            tamanho: it.tamanho || "",
            quantidade: it.quantidade ?? 1,
            preco: it.preco ?? 0,
          }))
        );
      } else {
        setItems([{ tamanho: "", quantidade: 1, preco: 0 }]);
      }
    } else {
      setNome("");
      setObservacoes("");
      setItems([{ tamanho: "", quantidade: 1, preco: 0 }]);
    }
  }, [encomenda]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { tamanho: "", quantidade: 1, preco: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clienteId) {
      alert("Selecione um cliente antes de adicionar uma encomenda.");
      return;
    }

    const data = {
      id: encomenda ? encomenda.id : undefined,
      cliente_id: clienteId,
      nome,
      observacoes,
      items: items.map((it) => ({
        tamanho: it.tamanho,
        quantidade: parseInt(it.quantidade, 10) || 0,
        preco: parseFloat(it.preco) || 0,
      })),
    };

    try {
      if (encomenda && encomenda.id) {
        await window.electronAPI.updateEncomenda(data);
      } else {
        await window.electronAPI.addEncomenda(data);
      }

      if (!encomenda) {
        setNome("");
        setObservacoes("");
        setItems([{ tamanho: "", quantidade: 1, preco: 0 }]);
      }

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Erro ao salvar encomenda:", err);
      alert("Não foi possível salvar a encomenda.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}
    >
      <h3>{encomenda ? "Editar Encomenda" : "Nova Encomenda"}</h3>

      <div style={{ marginBottom: "5px" }}>
        <label>Nome:</label>
        <br />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "5px" }}>
        <label>Observações gerais:</label>
        <br />
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <h4>Linhas da encomenda (tamanhos)</h4>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "5px",
          }}
        >
          <input
            placeholder="Tamanho"
            type="text"
            value={item.tamanho}
            onChange={(e) => handleItemChange(index, "tamanho", e.target.value)}
            style={{ flex: 1, padding: "5px" }}
          />
          <input
            placeholder="Quantidade"
            type="number"
            min={1}
            value={item.quantidade}
            onChange={(e) =>
              handleItemChange(index, "quantidade", e.target.value)
            }
            style={{ width: "90px", padding: "5px" }}
          />
          <input
            placeholder="Preço (€)"
            type="number"
            min={0}
            step="0.01"
            value={item.preco}
            onChange={(e) => handleItemChange(index, "preco", e.target.value)}
            style={{ width: "100px", padding: "5px" }}
          />
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            disabled={items.length === 1}
          >
            X
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddItem}
        style={{ marginBottom: "10px", padding: "5px 10px" }}
      >
        + Adicionar tamanho
      </button>

      <br />

      <button type="submit" style={{ padding: "5px 10px" }}>
        {encomenda ? "Atualizar" : "Adicionar"}
      </button>
    </form>
  );
}
