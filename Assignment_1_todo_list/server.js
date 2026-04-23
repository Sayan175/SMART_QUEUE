//
===========================================
========================
// Dynamic To-Do List â€“ Backend Server
// Stack: Node.js + Express + SQLite (via better-sqlite3)
// Run: node server.js (from the backend/ directory)
//
===========================================
========================
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
// ---------- App setup --------------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); // Allow frontend (different
port) to call the API
app.use(express.json());
// ---------- Database setup ---------------------------------------
const DB_PATH = path.join(__dirname, 'db.sqlite');
const db = new Database(DB_PATH); // Creates
db.sqlite if it doesn't exist
// Initialise the tasks table
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
priority TEXT DEFAULT 'Medium',
description TEXT DEFAULT '',
dueDate TEXT DEFAULT NULL,
isDone INTEGER DEFAULT 0,
createdAt DATETIME DEFAULT
CURRENT_TIMESTAMP
);
`);
console.log('âœ… Database ready at', DB_PATH);
// ---------- Helper -----------------------------------------------
function rowToTask(row) {
return { ...row, isDone: row.isDone === 1 };
}
//
===========================================
=====================
// REST API Endpoints
//
===========================================
=====================
// GET /tasks â†’ Return all tasks (newest first)
app.get('/tasks', (req, res) => {
try {
const rows = db.prepare('SELECT * FROM tasks
ORDER BY createdAt DESC').all();
res.json(rows.map(rowToTask));
} catch (err) {
res.status(500).json({ error: err.message });
}
});
// POST /tasks â†’ Add new task { title, priority,
description?, dueDate? }
app.post('/tasks', (req, res) => {
const { title, priority = 'Medium', description = '', dueDate
= null } = req.body;
if (!title || title.trim() === '') {
return res.status(400).json({ error: 'Title is required.' });
}
if (title.length > 50) {
return res.status(400).json({ error: 'Title must be 50
characters or less.' });
}
try {
const stmt = db.prepare(
'INSERT INTO tasks (title, priority, description,
dueDate) VALUES (?, ?, ?, ?)'
);
const info = stmt.run(title.trim(), priority,
description.trim(), dueDate);
const newTask = db.prepare('SELECT * FROM tasks
WHERE id = ?').get(info.lastInsertRowid);
res.status(201).json(rowToTask(newTask));
} catch (err) {
res.status(500).json({ error: err.message });
}
});
// PUT /tasks/:id â†’ Update task title, priority, description,
dueDate
app.put('/tasks/:id', (req, res) => {
const { id } = req.params;
const { title, priority, description = '', dueDate = null } =
req.body;
if (!title || title.trim() === '') {
return res.status(400).json({ error: 'Title is required.' });
}
if (title.length > 50) {
return res.status(400).json({ error: 'Title must be 50
characters or less.' });
}
try {
const stmt = db.prepare(
'UPDATE tasks SET title = ?, priority = ?, description
= ?, dueDate = ? WHERE id = ?'
);
const info = stmt.run(title.trim(), priority,
description.trim(), dueDate, id);
if (info.changes === 0) return
res.status(404).json({ error: 'Task not found.' });
const updated = db.prepare('SELECT * FROM tasks
WHERE id = ?').get(id);
res.json(rowToTask(updated));
} catch (err) {
res.status(500).json({ error: err.message });
}
});
// PATCH /tasks/:id/status â†’ Toggle completed status
app.patch('/tasks/:id/status', (req, res) => {
const { id } = req.params;
try {
const task = db.prepare('SELECT * FROM tasks
WHERE id = ?').get(id);
if (!task) return res.status(404).json({ error: 'Task not
found.' });
const newStatus = task.isDone ? 0 : 1;
db.prepare('UPDATE tasks SET isDone = ? WHERE id
= ?').run(newStatus, id);
const updated = db.prepare('SELECT * FROM tasks
WHERE id = ?').get(id);
res.json(rowToTask(updated));
} catch (err) {
res.status(500).json({ error: err.message });
}
});
// DELETE /tasks/:id â†’ Delete a task
app.delete('/tasks/:id', (req, res) => {
const { id } = req.params;
try {
const info = db.prepare('DELETE FROM tasks WHERE
id = ?').run(id);
if (info.changes === 0) return
res.status(404).json({ error: 'Task not found.' });
res.json({ message: 'Task deleted successfully.', id:
Number(id) });
} catch (err) {
res.status(500).json({ error: err.message });
}
});
// ---------- Start ------------------------------------------------
app.listen(PORT, () => {
console.log(`ðŸš€ To-Do API running at http://localhost:
${PORT}`);
console.log('Endpoints:');
console.log(' GET /tasks');
console.log(' POST /tasks');
console.log(' PUT /tasks/:id');
console.log(' PATCH /tasks/:id/status');
console.log(' DELETE /tasks/:id');
});
