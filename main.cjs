const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Datastore = require('better-sqlite3');

let db;

/* ---------------------- DB INIT ---------------------- */

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

  // Cabeçalho da encomenda
  db.prepare(`
    CREATE TABLE IF NOT EXISTS encomenda (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      nome TEXT,
      observacoes TEXT,
      dataCriacao datetime DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    )
  `).run();

  // Linhas da encomenda (cada tamanho/quantidade/preço)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS encomenda_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encomenda_id INTEGER,
      tamanho TEXT,
      quantidade INTEGER,
      preco REAL,
      FOREIGN KEY (encomenda_id) REFERENCES encomenda(id) ON DELETE CASCADE
    )
  `).run();
}

/* ---------------------- IPC HANDLERS ---------------------- */

/* CLIENTES */

ipcMain.handle('get-clientes', () => {
  const stmt = db.prepare('SELECT * FROM clientes ORDER BY dataCriacao DESC');
  return stmt.all();
});

ipcMain.handle('add-cliente', (event, cliente) => {
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
  const created = db.prepare('SELECT * FROM clientes WHERE id = ?').get(info.lastInsertRowid);
  return created;
});

ipcMain.handle('get-cliente-by-id', (event, id) => {
  const stmt = db.prepare('SELECT * FROM clientes WHERE id = ?');
  return stmt.get(id);
});

ipcMain.handle('update-cliente', (event, cliente) => {
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
  const updated = db.prepare('SELECT * FROM clientes WHERE id = ?').get(cliente.id);
  return updated;
});

ipcMain.handle('delete-cliente', (event, id) => {
  const stmt = db.prepare('DELETE FROM clientes WHERE id = ?');
  return stmt.run(id);
});

/* ENCOMENDAS (cabeçalho) */

// lista de encomendas de um cliente (sem itens)
ipcMain.handle('get-encomendas', (event, cliente_id) => {
  const stmt = db.prepare('SELECT * FROM encomenda WHERE cliente_id = ? ORDER BY dataCriacao DESC');
  return stmt.all(cliente_id);
});

// itens de uma encomenda
ipcMain.handle('get-encomenda-itens', (event, encomenda_id) => {
  const stmt = db.prepare('SELECT * FROM encomenda_item WHERE encomenda_id = ?');
  return stmt.all(encomenda_id);
});

// criar encomenda + itens
ipcMain.handle('add-encomenda', (event, encomenda) => {
  const insertHeader = db.prepare(`
    INSERT INTO encomenda (cliente_id, nome, observacoes)
    VALUES (?, ?, ?)
  `);
  const info = insertHeader.run(
    encomenda.cliente_id,
    encomenda.nome,
    encomenda.observacoes || null
  );
  const encomendaId = info.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO encomenda_item (encomenda_id, tamanho, quantidade, preco)
    VALUES (?, ?, ?, ?)
  `);
  const items = Array.isArray(encomenda.items) ? encomenda.items : [];
  for (const item of items) {
    insertItem.run(
      encomendaId,
      item.tamanho || null,
      Number(item.quantidade) || 0,
      Number(item.preco) || 0
    );
  }

  const created = db.prepare('SELECT * FROM encomenda WHERE id = ?').get(encomendaId);
  return created;
});

// atualizar encomenda + substituir itens
ipcMain.handle('update-encomenda', (event, encomenda) => {
  db.prepare(`
    UPDATE encomenda
    SET nome = ?, observacoes = ?
    WHERE id = ?
  `).run(
    encomenda.nome,
    encomenda.observacoes || null,
    encomenda.id
  );

  db.prepare('DELETE FROM encomenda_item WHERE encomenda_id = ?').run(encomenda.id);

  const insertItem = db.prepare(`
    INSERT INTO encomenda_item (encomenda_id, tamanho, quantidade, preco)
    VALUES (?, ?, ?, ?)
  `);
  const items = Array.isArray(encomenda.items) ? encomenda.items : [];
  for (const item of items) {
    insertItem.run(
      encomenda.id,
      item.tamanho || null,
      Number(item.quantidade) || 0,
      Number(item.preco) || 0
    );
  }

  const updated = db.prepare('SELECT * FROM encomenda WHERE id = ?').get(encomenda.id);
  return updated;
});

// apagar encomenda (itens caem pelo ON DELETE CASCADE)
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
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.webContents.openDevTools();
    win.loadURL('http://localhost:3000');
  } else {
    const indexPath = path.join(__dirname, 'frontend', 'build', 'index.html');
    win.loadFile(indexPath);
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
