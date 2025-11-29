export {};

declare global {
  interface Window {
    electronAPI: {
      getClientes: () => Promise<any>;
      addCliente: (cliente: any) => Promise<any>;
      getClienteById: (id: number) => Promise<any>;
      updateCliente: (cliente: any) => Promise<any>;
      deleteCliente: (id: number) => Promise<any>;

      getEncomendas: (cliente_id: number) => Promise<any>;
      addEncomenda: (e: any) => Promise<any>;
      updateEncomenda: (e: any) => Promise<any>;
      deleteEncomenda: (id: number) => Promise<any>;
    };
  }
}
