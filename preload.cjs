const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
    getClientes: () => ipcRenderer.invoke("get-clientes"),
    addCliente: (cliente) => ipcRenderer.invoke("add-cliente", cliente),
    getClientById: (id) => ipcRenderer.invoke("get-cliente-by-id", id),
    updateCliente: (cliente) => ipcRenderer.invoke("update-cliente", cliente),
    deleteCliente: (id) => ipcRenderer.invoke("delete-cliente", id),

    getEncomendas: (cliente_id) => ipcRenderer.invoke("get-encomendas", cliente_id),
    addEncomenda: (e) => ipcRenderer.invoke("add-encomenda", e),
    updateEncomenda: (e) => ipcRenderer.invoke("update-encomenda", e),
    deleteEncomenda: (id) => ipcRenderer.invoke("delete-encomenda", id)
});
