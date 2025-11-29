// CLIENTES
export const getClientes = () => window.electronAPI.getClientes();
export const addCliente = (cliente) => window.electronAPI.addCliente(cliente);
export const getClientById = (id) => window.electronAPI.getClientById(id);
export const updateCliente = (cliente) => window.electronAPI.updateCliente(cliente);
export const deleteCliente = (id) => window.electronAPI.deleteCliente(id);

// ENCOMENDAS
export const getEncomendas = (cliente_id) => window.electronAPI.getEncomendas(cliente_id);
export const addEncomenda = (e) => window.electronAPI.addEncomenda(e);
export const updateEncomenda = (e) => window.electronAPI.updateEncomenda(e);
export const deleteEncomenda = (id) => window.electronAPI.deleteEncomenda(id);
