const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Datastore = require('better-sqlite3');

let db;

// Live reload (opcional em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function initDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'clientes.db');
    const db = new Datastore(dbPath);

    // Tabela clientes
    db.prepare(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            email TEXT,
            contatoEmpresarial TEXT,
            contatoPessoal TEXT,
            morada TEXT,
            nif TEXT,
            dataCriacao datetime DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // Tabela encomendas
    db.prepare(`
        CREATE TABLE IF NOT EXISTS encomenda (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            nome TEXT,
            tamanho TEXT,
            quantidade INTEGER,
            preco REAL,
            observacoes TEXT,
            dataCriacao datetime DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        )
    `).run();

    return db;
}

/* ---------------------- IPC HANDLERS ---------------------- */

// CLIENTES
ipcMain.handle("get-clientes", () =>
    db.prepare("SELECT * FROM clientes").all()
);

ipcMain.handle("add-cliente", (event, cliente) =>
    db.prepare(`
        INSERT INTO clientes (nome, email, contatoEmpresarial, contatoPessoal, morada, nif)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(cliente.nome, cliente.email, cliente.contatoEmpresarial, cliente.contatoPessoal, cliente.morada, cliente.nif)
);

ipcMain.handle("get-cliente-by-id", (event, id) =>
    db.prepare("SELECT * FROM clientes WHERE id = ?").get(id)
);

ipcMain.handle("update-cliente", (event, cliente) =>
    db.prepare(`
        UPDATE clientes SET nome=?, email=?, contatoEmpresarial=?, contatoPessoal=?, morada=?, nif=?
        WHERE id=?
    `).run(cliente.nome, cliente.email, cliente.contatoEmpresarial, cliente.contatoPessoal, cliente.morada, cliente.nif, cliente.id)
);

ipcMain.handle("delete-cliente", (event, id) =>
    db.prepare("DELETE FROM clientes WHERE id=?").run(id)
);

// ENCOMENDAS
ipcMain.handle("get-encomendas", (event, cliente_id) =>
    db.prepare("SELECT * FROM encomenda WHERE cliente_id=?").all(cliente_id)
);

ipcMain.handle("add-encomenda", (event, e) =>
    db.prepare(`
        INSERT INTO encomenda (cliente_id, nome, tamanho, quantidade, preco, observacoes)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(e.cliente_id, e.nome, e.tamanho, e.quantidade, e.preco, e.observacoes)
);

ipcMain.handle("update-encomenda", (event, e) =>
    db.prepare(`
        UPDATE encomenda SET nome=?, tamanho=?, quantidade=?, preco=?, observacoes=?
        WHERE id=?
    `).run(e.nome, e.tamanho, e.quantidade, e.preco, e.observacoes, e.id)
);

ipcMain.handle("delete-encomenda", (event, id) =>
    db.prepare("DELETE FROM encomenda WHERE id=?").run(id)
);

/* ---------------------- WINDOW ---------------------- */

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Abrir DevTools para debug
    win.webContents.openDevTools();

    // Em desenvolvimento, usar o servidor React
    if (process.env.NODE_ENV !== 'production') {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
    }
    
    // Log de erros
    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Falha ao carregar:', errorCode, errorDescription);
    });
}
app.whenReady().then(() => {
    db = initDatabase(); 
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

module.exports = db;