import React, { useState, useEffect } from "react";
import EncomendaList from "./components/EncomendaList";
import ClienteForm from "./components/ClienteForm"; // vamos criar este componente

function App() {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [page, setPage] = useState("home"); // home ou criar-cliente

  // Carregar lista de clientes
  const loadClientes = async () => {
    try {
      const data = await window.electronAPI.getClientes();
      setClientes(data);
      if (data.length > 0 && !selectedCliente) {
        setSelectedCliente(data[0]);
      }
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente);
  };

  const goToCreateCliente = () => {
    setPage("criar-cliente");
  };

  const goHome = () => {
    setPage("home");
    loadClientes(); // recarrega lista após criar cliente
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Gestão de Clientes e Encomendas</h1>

      {page === "home" && (
        <>
          <button onClick={goToCreateCliente} style={{ marginBottom: "10px", padding: "5px 10px" }}>
            Criar Cliente
          </button>

          <div style={{ marginBottom: "20px" }}>
            <h2>Clientes</h2>
            {clientes.length === 0 && <p>Nenhum cliente encontrado.</p>}
            {clientes.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCliente(c)}
                style={{
                  marginRight: "5px",
                  marginBottom: "5px",
                  padding: "5px 10px",
                  backgroundColor: selectedCliente && selectedCliente.id === c.id ? "#ccc" : "#eee",
                }}
              >
                {c.nome}
              </button>
            ))}
          </div>

          {selectedCliente && (
            <div>
              <h2>Cliente: {selectedCliente.nome}</h2>
              <p>Email: {selectedCliente.email}</p>
              <p>Contato Empresarial: {selectedCliente.contatoEmpresarial}</p>
              <p>Contato Pessoal: {selectedCliente.contatoPessoal}</p>
              <p>Morada: {selectedCliente.morada}</p>
              <p>NIF: {selectedCliente.nif}</p>

              {/* Lista de encomendas do cliente */}
              <EncomendaList clienteId={selectedCliente.id} />
            </div>
          )}
        </>
      )}

      {page === "criar-cliente" && (
        <div>
          <h2>Criar Cliente</h2>
          <button onClick={goHome} style={{ marginBottom: "10px", padding: "5px 10px" }}>
            Voltar
          </button>
          <ClienteForm onSaved={goHome} />
        </div>
      )}
    </div>
  );
}

export default App;
