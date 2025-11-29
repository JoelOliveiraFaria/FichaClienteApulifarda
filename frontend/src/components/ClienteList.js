import { useState, useEffect } from "react";
import { getClientes, deleteCliente } from "../api";

export default function ClienteList({ onEdit, onVerEncomendas }) {
  const [clientes, setClientes] = useState([]);

  const loadClientes = () => { setClientes(getClientes()); }

  useEffect(() => { loadClientes(); }, []);

  const handleDelete = (id) => { deleteCliente(id); loadClientes(); }

  return (
    <ul>
      {clientes.map(c => (
        <li key={c.id}>
          {c.nome} - {c.telefone} - {c.email}
          <button onClick={() => onEdit(c)}>Editar</button>
          <button onClick={() => onVerEncomendas(c)}>Ver Encomendas</button>
          <button onClick={() => handleDelete(c.id)}>Excluir</button>
        </li>
      ))}
    </ul>
  );
}
