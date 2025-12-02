const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Datastore = require('better-sqlite3');

let db;

// Live reload só em dev
if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'clientes.db');
  db = new Datastore(dbPath);
  db.pragma('foreign_keys = ON');

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
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )
  `).run();
}

/* ---------------------- IPC HANDLERS ---------------------- */

// CLIENTES
ipcMain.handle('get-clientes', () => {
  const stmt = db.prepare('SELECT * FROM clientes ORDER BY dataCriacao DESC');
  return stmt.all(); // ← SEMPRE retorna array
});

ipcMain.handle('add-cliente', async (event, cliente) => {
  const stmt = db.prepare(`
    INSERT INTO clientes (nome, email, contatoEmpresarial, contatoPessoal, morada, nif)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    cliente.nome,
    cliente.email,
    cliente.contatoEmpresarial,
    cliente.contatoPessoal,
    cliente.morada,
    cliente.nif
  );
  // Retorna o cliente CRIADO completo
  const created = db.prepare('SELECT * FROM clientes WHERE id = ?').get(info.lastInsertRowid);
  return created;
});

ipcMain.handle('get-cliente-by-id', (event, id) => {
  const stmt = db.prepare('SELECT * FROM clientes WHERE id = ?');
  return stmt.get(id);
});

ipcMain.handle('update-cliente', async (event, cliente) => {
  const stmt = db.prepare(`
    UPDATE clientes
    SET nome = ?, email = ?, contatoEmpresarial = ?, contatoPessoal = ?, morada = ?, nif = ?
    WHERE id = ?
  `);
  stmt.run(
    cliente.nome,
    cliente.email,
    cliente.contatoEmpresarial,
    cliente.contatoPessoal,
    cliente.morada,
    cliente.nif,
    cliente.id
  );
  // Retorna o cliente ATUALIZADO completo
  const updated = db.prepare('SELECT * FROM clientes WHERE id = ?').get(cliente.id);
  return updated;
});

ipcMain.handle('delete-cliente', (event, id) => {
  const stmt = db.prepare('DELETE FROM clientes WHERE id = ?');
  return stmt.run(id);
});

// ENCOMENDAS
ipcMain.handle('get-encomendas', (event, cliente_id) => {
  const stmt = db.prepare('SELECT * FROM encomenda WHERE cliente_id = ? ORDER BY dataCriacao DESC');
  return stmt.all(cliente_id); // ← SEMPRE retorna array
});

ipcMain.handle('add-encomenda', async (event, e) => {
  const stmt = db.prepare(`
    INSERT INTO encomenda (cliente_id, nome, tamanho, quantidade, preco, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    e.cliente_id,
    e.nome,
    e.tamanho,
    e.quantidade,
    e.preco,
    e.observacoes
  );
  // Retorna a encomenda CRIADA completa
  const created = db.prepare('SELECT * FROM encomenda WHERE id = ?').get(info.lastInsertRowid);
  return created;
});

ipcMain.handle('update-encomenda', async (event, e) => {
  const stmt = db.prepare(`
    UPDATE encomenda
    SET nome = ?, tamanho = ?, quantidade = ?, preco = ?, observacoes = ?
    WHERE id = ?
  `);
  stmt.run(
    e.nome,
    e.tamanho,
    e.quantidade,
    e.preco,
    e.observacoes,
    e.id
  );
  // Retorna a encomenda ATUALIZADA completa
  const updated = db.prepare('SELECT * FROM encomenda WHERE id = ?').get(e.id);
  return updated;
});

ipcMain.handle('delete-encomenda', (event, id) => {
  const stmt = db.prepare('DELETE FROM encomenda WHERE id = ?');
  return stmt.run(id);
});

/* ---------------------- WINDOW ---------------------- */

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    win.webContents.openDevTools();
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
  }

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Falha ao carregar:', errorCode, errorDescription);
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
