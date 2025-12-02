const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
  // CLIENTES
  getClientes: () => ipcRenderer.invoke("get-clientes"),
  addCliente: (cliente) => ipcRenderer.invoke("add-cliente", cliente),
  getClientById: (id) => ipcRenderer.invoke("get-cliente-by-id", id),
  updateCliente: (cliente) => ipcRenderer.invoke("update-cliente", cliente),
  deleteCliente: (id) => ipcRenderer.invoke("delete-cliente", id),

  // ENCOMENDAS (cabeçalho)
  getEncomendas: (cliente_id) => ipcRenderer.invoke("get-encomendas", cliente_id),
  addEncomenda: (e) => ipcRenderer.invoke("add-encomenda", e),
  updateEncomenda: (e) => ipcRenderer.invoke("update-encomenda", e),
  deleteEncomenda: (id) => ipcRenderer.invoke("delete-encomenda", id),

  // ITENS DA ENCOMENDA (linhas/tamanhos)
  getEncomendaItens: (encomenda_id) =>
    ipcRenderer.invoke("get-encomenda-itens", encomenda_id),
});
