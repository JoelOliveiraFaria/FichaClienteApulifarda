import React, { useState, useEffect } from "react";
import ClienteForm from "./components/ClienteForm";
import ClienteList from "./components/ClienteList";
import EncomendaList from "./components/EncomendaList";

function App() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [page, setPage] = useState("home");

const loadClientes = async () => {
  if (!window.electronAPI) return;
  try {
    const data = await window.electronAPI.getClientes();
    console.log("getClientes:", data);
    setClientes(Array.isArray(data) ? data : []);
    if (data.length > 0 && !clienteSelecionado) {
      setClienteSelecionado(data[0]);
    }
  } catch (err) {
    console.error("Erro ao carregar clientes:", err);
  }
};

  useEffect(() => {
    loadClientes();
  }, []);

  // Callbacks simples para os componentes
const handleClienteSaved = async (cliente) => {
  try {
    if (cliente.id) {
      // editar
      await window.electronAPI.updateCliente(cliente);
    } else {
      // novo
      await window.electronAPI.addCliente(cliente);
    }
    await loadClientes();    // recarrega lista
    setPage("home");         // volta à página inicial
  } catch (err) {
    console.error("Erro ao salvar cliente:", err);
  }
};

  const handleClienteEdit = (cliente) => {
    setClienteSelecionado(cliente);
    setPage("criar-cliente");
  };

  const handleClienteDelete = async () => {
    await loadClientes();
  };

  const handleClienteSelect = (cliente) => {
    setClienteSelecionado(cliente);
  };

  const goToCreate = () => {
    setClienteSelecionado(null);
    setPage("criar-cliente");
  };

  const goHome = () => setPage("home");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "1400px" }}>
      <h1>🛒 Gestão de Clientes e Encomendas</h1>

      {/* PÁGINA HOME: Lista + Cliente selecionado */}
      {page === "home" && (
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
              <button 
                onClick={goToCreate}
                style={{ padding: "8px 16px", background: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
              >
                Novo Cliente
              </button>
            </div>
            <ClienteList
              clientes={clientes}
              onEdit={handleClienteEdit}
              onVerEncomendas={handleClienteSelect}
              onDelete={handleClienteDelete}
            />
          </div>

          {/* Detalhes do cliente + encomendas */}
          {clienteSelecionado && (
            <div style={{ flex: 2 }}>
              <div style={{ 
                background: "#f8f9fa", 
                padding: "20px", 
                borderRadius: "8px", 
                marginBottom: "20px",
                border: "1px solid #dee2e6"
              }}>
                <h3>👤 {clienteSelecionado.nome}</h3>
                <p><strong>Email:</strong> {clienteSelecionado.email || "—"}</p>
                <p><strong>Contato Empresarial:</strong> {clienteSelecionado.contatoEmpresarial || "—"}</p>
                <p><strong>Contato Pessoal:</strong> {clienteSelecionado.contatoPessoal || "—"}</p>
                <p><strong>Morada:</strong> {clienteSelecionado.morada || "—"}</p>
                <p><strong>NIF:</strong> {clienteSelecionado.nif || "—"}</p>
              </div>
              <EncomendaList clienteId={clienteSelecionado.id} />
            </div>
          )}
        </div>
      )}

      {/* PÁGINA FORMULÁRIO */}
      {page === "criar-cliente" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <button 
              onClick={goHome}
              style={{ padding: "8px 16px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px" }}
            >
              ← Voltar
            </button>
            <h2>{clienteSelecionado ? "✏️ Editar Cliente" : "Novo Cliente"}</h2>
          </div>
          <ClienteForm 
            onSaved={handleClienteSaved} 
            cliente={clienteSelecionado} 
          />
        </div>
      )}
    </div>
  );
}

export default App;
