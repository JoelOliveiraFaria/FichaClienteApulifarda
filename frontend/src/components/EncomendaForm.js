import React, { useState } from "react";

export default function EncomendaForm({ clienteId, encomenda, onSaved }) {
  const [nome, setNome] = useState(encomenda ? encomenda.nome : "");
  const [tamanho, setTamanho] = useState(encomenda ? encomenda.tamanho : "");
  const [quantidade, setQuantidade] = useState(encomenda ? encomenda.quantidade : 1);
  const [preco, setPreco] = useState(encomenda ? encomenda.preco : 0);
  const [observacoes, setObservacoes] = useState(encomenda ? encomenda.observacoes : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      cliente_id: clienteId,
      nome,
      tamanho,
      quantidade: parseInt(quantidade),
      preco: parseFloat(preco),
      observacoes,
    };

    try {
      if (encomenda && encomenda.id) {
        // Atualizar
        await window.electronAPI.updateEncomenda({ ...data, id: encomenda.id });
      } else {
        // Criar nova
        await window.electronAPI.addEncomenda(data);
      }

      // Reset do form
      setNome("");
      setTamanho("");
      setQuantidade(1);
      setPreco(0);
      setObservacoes("");

      if (onSaved) onSaved();
    } catch (err) {
      console.error("Erro ao salvar encomenda:", err);
      alert("Não foi possível salvar a encomenda.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
      <h3>{encomenda ? "Editar Encomenda" : "Nova Encomenda"}</h3>

      <div style={{ marginBottom: "5px" }}>
        <label>Nome:</label><br />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "5px" }}>
        <label>Tamanho:</label><br />
        <input
          type="text"
          value={tamanho}
          onChange={(e) => setTamanho(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "5px" }}>
        <label>Quantidade:</label><br />
        <input
          type="number"
          value={quantidade}
          min={1}
          onChange={(e) => setQuantidade(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "5px" }}>
        <label>Preço (€):</label><br />
        <input
          type="number"
          value={preco}
          min={0}
          step="0.01"
          onChange={(e) => setPreco(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "5px" }}>
        <label>Observações:</label><br />
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          style={{ width: "100%", padding: "5px" }}
        />
      </div>

      <button type="submit" style={{ padding: "5px 10px" }}>
        {encomenda ? "Atualizar" : "Adicionar"}
      </button>
    </form>
  );
}
