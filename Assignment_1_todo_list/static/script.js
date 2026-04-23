//
===========================================
========================
// Dynamic To-Do List â€“ Frontend Script
// Communicates with Node/Express/SQLite backend.
// Falls back to LocalStorage if the server is unreachable.
//
===========================================
========================
const API_BASE = 'http://localhost:3000';
let tasks = []; // in-memory cache
let currentFilter = 'all';
let editingId = null;
let useLocalStorage = false; // set true when backend is
down
// ---- Toast Helper -----------------------------------------------
function showToast(msg, duration = 2500) {
let toast = document.getElementById('toast');
if (!toast) {
toast = document.createElement('div');
toast.id = 'toast';
document.body.appendChild(toast);
}
toast.textContent = msg;
toast.classList.add('show');
setTimeout(() => toast.classList.remove('show'),
duration);
}
// ---- LocalStorage helpers ----------------------------------------
function lsLoad() {
const data = localStorage.getItem('todo_tasks');
return data ? JSON.parse(data) : [];
}
function lsSave(arr) {
localStorage.setItem('todo_tasks', JSON.stringify(arr));
}
// ---- API / LocalStorage wrappers
---------------------------------
async function apiFetch(method, path, body) {
const opts = { method, headers: { 'Content-Type':
'application/json' } };
if (body) opts.body = JSON.stringify(body);
const res = await fetch(API_BASE + path, opts);
if (!res.ok) throw new Error(await res.text());
return res.json();
}
// ---- Load tasks on page load ------------------------------------
async function loadTasks() {
try {
tasks = await apiFetch('GET', '/tasks');
useLocalStorage = false;
} catch {
// Backend not reachable â†’ use LocalStorage fallback
useLocalStorage = true;
tasks = lsLoad();
showToast('âš ï¸ Server offline â€“ using LocalStorage
fallback');
}
renderTasks();
}
// ---- Add Task ---------------------------------------------------
async function addTask() {
const titleEl = document.getElementById('taskTitle');
const priorityEl =
document.getElementById('taskPriority');
const descEl =
document.getElementById('taskDescription');
const dueEl =
document.getElementById('taskDueDate');
const title = titleEl.value.trim();
const priority = priorityEl.value;
const description = descEl.value.trim();
const dueDate = dueEl.value || null;
// Validations
if (!title) { showToast('â— Task title cannot be empty.');
titleEl.focus(); return; }
if (title.length > 50) { showToast('â— Title must be 50
characters or less.'); return; }
const payload = { title, priority, description, dueDate };
try {
let newTask;
if (!useLocalStorage) {
newTask = await apiFetch('POST', '/tasks', payload);
tasks.push(newTask);
} else {
newTask = {
id: Date.now(),
title, priority, description, dueDate,
isDone: 0,
createdAt: new Date().toISOString()
};
tasks.push(newTask);
lsSave(tasks);
}
// Clear form
titleEl.value = '';
descEl.value = '';
dueEl.value = '';
priorityEl.value = 'Medium';
showToast('âœ… Task added!');
renderTasks();
} catch (e) {
showToast('âŒ Failed to add task: ' + e.message);
}
}
// ---- Toggle Completed -------------------------------------------
async function toggleDone(id) {
const task = tasks.find(t => t.id === id);
if (!task) return;
const newStatus = task.isDone ? 0 : 1;
try {
if (!useLocalStorage) {
await apiFetch('PATCH', `/tasks/${id}/status`,
{ isDone: newStatus });
}
task.isDone = newStatus;
if (useLocalStorage) lsSave(tasks);
renderTasks();
} catch (e) {
showToast('âŒ Could not update task.');
}
}
// ---- Open Edit Modal -------------------------------------------
function openEdit(id) {
const task = tasks.find(t => t.id === id);
if (!task) return;
editingId = id;
document.getElementById('editTitle').value = task.title;
document.getElementById('editPriority').value =
task.priority;
document.getElementById('editDescription').value =
task.description || '';
document.getElementById('editDueDate').value =
task.dueDate || '';
document.getElementById('editModal').classList.remove('
hidden');
}
function closeModal() {
document.getElementById('editModal').classList.add('hidd
en');
editingId = null;
}
// ---- Save Edit -------------------------------------------------
async function saveEdit() {
const title =
document.getElementById('editTitle').value.trim();
const priority =
document.getElementById('editPriority').value;
const description =
document.getElementById('editDescription').value.trim();
const dueDate =
document.getElementById('editDueDate').value || null;
if (!title) { showToast('â— Title cannot be empty.'); return;
}
if (title.length > 50) { showToast('â— Title max 50
characters.'); return; }
const payload = { title, priority, description, dueDate };
try {
if (!useLocalStorage) {
const updated = await apiFetch('PUT', `/tasks/$
{editingId}`, payload);
const idx = tasks.findIndex(t => t.id === editingId);
if (idx !== -1) tasks[idx] = updated;
} else {
const idx = tasks.findIndex(t => t.id === editingId);
if (idx !== -1) { tasks[idx] = { ...tasks[idx], ...payload };
lsSave(tasks); }
}
closeModal();
showToast('âœï¸ Task updated!');
renderTasks();
} catch (e) {
showToast('âŒ Failed to update: ' + e.message);
}
}
// ---- Delete Task -----------------------------------------------
async function deleteTask(id) {
if (!confirm('Delete this task?')) return;
try {
if (!useLocalStorage) {
await apiFetch('DELETE', `/tasks/${id}`);
}
tasks = tasks.filter(t => t.id !== id);
if (useLocalStorage) lsSave(tasks);
showToast('ðŸ—‘ï¸ Task deleted.');
renderTasks();
} catch (e) {
showToast('âŒ Failed to delete: ' + e.message);
}
}
// ---- Filter ----------------------------------------------------
function setFilter(filter, el) {
currentFilter = filter;
document.querySelectorAll('.filter-btn').forEach(b =>
b.classList.remove('active'));
el.classList.add('active');
renderTasks();
}
// ---- Export JSON -----------------------------------------------
function exportJSON() {
const blob = new Blob([JSON.stringify(tasks, null, 2)],
{ type: 'application/json' });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'tasks_export.json';
a.click();
showToast('ðŸ“¥ Tasks exported!');
}
// ---- Render Task List ------------------------------------------
function renderTasks() {
const list = document.getElementById('taskList');
const searchVal =
document.getElementById('searchInput').value.trim().toLo
werCase();
const sortVal =
document.getElementById('sortSelect').value;
// Filter
let filtered = tasks.filter(t => {
if (currentFilter === 'active') return !t.isDone;
if (currentFilter === 'completed') return t.isDone;
return true;
});
// Search
if (searchVal) {
filtered = filtered.filter(t =>
t.title.toLowerCase().includes(searchVal) ||
(t.description || '').toLowerCase().includes(searchVal)
);
}
// Sort
const priorityOrder = { High: 0, Medium: 1, Low: 2 };
filtered.sort((a, b) => {
if (sortVal === 'priority') return priorityOrder[a.priority] -
priorityOrder[b.priority];
if (sortVal === 'duedate') {
if (!a.dueDate && !b.dueDate) return 0;
if (!a.dueDate) return 1;
if (!b.dueDate) return -1;
return new Date(a.dueDate) - new Date(b.dueDate);
}
if (sortVal === 'oldest') return new Date(a.createdAt) -
new Date(b.createdAt);
return new Date(b.createdAt) - new
Date(a.createdAt); // newest
});
// Update counter
const done = tasks.filter(t => t.isDone).length;
document.getElementById('counter').textContent =
`Completed: ${done} / Total: ${tasks.length}`;
// Empty state
if (filtered.length === 0) {
list.innerHTML = `<li class="empty-state"><span>ðŸ
—’ï¸</span><p>No tasks here yet. Add one above!</p></
li>`;
return;
}
// Build list
list.innerHTML = filtered.map(t => {
const today = new Date().toISOString().split('T')[0];
const isOverdue = t.dueDate && !t.isDone &&
t.dueDate < today;
const createdFormatted = new
Date(t.createdAt).toLocaleDateString('en-IN', {
day: '2-digit', month: 'short', year: 'numeric'
});
return `
<li class="task-item priority-${t.priority} ${t.isDone ?
'completed' : ''} ${isOverdue ? 'overdue' : ''}">
<input
class="task-checkbox"
type="checkbox"
${t.isDone ? 'checked' : ''}
onchange="toggleDone(${t.id})"
title="${t.isDone ? 'Mark as active' : 'Mark as
completed'}"
/>
<div class="task-body">
<div class="task-title">${escapeHtml(t.title)}</div>
<div class="task-meta">
<span class="badge badge-${t.priority}">$
{t.priority}</span>
${t.dueDate ? `<span class="due-date">ðŸ“…
Due: ${t.dueDate}${isOverdue ? ' âš ï¸ Overdue' : ''}</
span>` : ''}
<span class="created-date">Added: $
{createdFormatted}</span>
</div>
${t.description ? `<div class="task-description">$
{escapeHtml(t.description)}</div>` : ''}
</div>
<div class="task-actions">
<button class="btn-edit" onclick="openEdit($
{t.id})">âœï¸ Edit</button>
<button class="btn-delete" onclick="deleteTask($
{t.id})">ðŸ—‘ï¸ Delete</button>
</div>
</li>
`;
}).join('');
}
// ---- Helpers ---------------------------------------------------
function escapeHtml(str) {
return str.replace(/&/g,'&amp;').replace(/</
g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
// Allow Enter key to add task
document.addEventListener('DOMContentLoaded', () => {
document.getElementById('taskTitle').addEventListener('k
eydown', e => {
if (e.key === 'Enter') addTask();
});
// Close modal on backdrop click
document.getElementById('editModal').addEventListener(
'click', e => {
if (e.target === document.getElementById('editModal'))
closeModal();
});
loadTasks();
});
