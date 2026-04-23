// ─────────────────────────────────────────
// SMART QUEUE — Admin JS
// ─────────────────────────────────────────

let currentServingId = null;

window.onload = () => {
  loadAdminData();
  setInterval(loadAdminData, 5000);
};

async function loadAdminData() {
  try {
    const res = await fetch('/api/admin/queue');
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    const data = await res.json();
    renderServingBanner(data.stats);
    renderQueue(data.waiting);
    renderSidebarStats(data.stats);
  } catch (e) {
    console.error('Failed to load admin data', e);
  }
}

function renderSidebarStats(stats) {
  document.getElementById('sWaiting').textContent = stats.waiting;
  document.getElementById('sServing').textContent = stats.serving;
  document.getElementById('sDone').textContent = stats.done;
}

function renderServingBanner(stats) {
  const current = stats.current;
  if (current) {
    currentServingId = current.id;
    document.getElementById('servingToken').textContent = `#${current.id}`;
    document.getElementById('servingName').textContent = current.name;
    document.getElementById('servingService').textContent = current.service;
    document.getElementById('doneBtn').disabled = false;
    document.getElementById('skipBtn').disabled = false;
  } else {
    currentServingId = null;
    document.getElementById('servingToken').textContent = '—';
    document.getElementById('servingName').textContent = 'No one being served';
    document.getElementById('servingService').textContent = 'Press "Call Next" to begin';
    document.getElementById('doneBtn').disabled = true;
    document.getElementById('skipBtn').disabled = true;
  }
}

function renderQueue(waiting) {
  const tbody = document.getElementById('queueBody');
  if (!waiting || waiting.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Queue is empty 🎉</td></tr>`;
    return;
  }
  tbody.innerHTML = waiting.map((p, i) => `
    <tr>
      <td><strong>${i + 1}</strong></td>
      <td><strong style="color:var(--accent)">#${p.id}</strong></td>
      <td>${escHtml(p.name)}</td>
      <td>${escHtml(p.service)}</td>
      <td>${escHtml(p.phone || '—')}</td>
      <td>${formatTime(p.joined_at)}</td>
      <td>
        <button class="btn-remove" onclick="removeToken(${p.id})">✕ Remove</button>
      </td>
    </tr>
  `).join('');
}

async function callNext() {
  const btn = document.getElementById('nextBtn');
  btn.disabled = true;
  btn.textContent = 'Calling...';
  try {
    const res = await fetch('/api/admin/next', { method: 'POST' });
    const data = await res.json();
    if (!data.success) alert(data.message || 'No one in queue');
    await loadAdminData();
  } catch (e) {
    alert('Error calling next customer');
  }
  btn.disabled = false;
  btn.textContent = 'Call Next ▶';
}

async function markDone() {
  if (!currentServingId) return;
  await fetch(`/api/admin/done/${currentServingId}`, { method: 'POST' });
  await loadAdminData();
}

async function skipCurrent() {
  if (!currentServingId) return;
  await fetch(`/api/admin/skip/${currentServingId}`, { method: 'POST' });
  await loadAdminData();
}

async function removeToken(tokenId) {
  if (!confirm(`Remove token #${tokenId} from queue?`)) return;
  await fetch(`/api/admin/remove/${tokenId}`, { method: 'POST' });
  await loadAdminData();
}

function formatTime(dtStr) {
  if (!dtStr) return '—';
  const d = new Date(dtStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
