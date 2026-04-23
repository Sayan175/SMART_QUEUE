// ─────────────────────────────────────────
// SMART QUEUE — Display Board JS
// ─────────────────────────────────────────

window.onload = () => {
  loadDisplay();
  setInterval(loadDisplay, 4000);
  setInterval(updateClock, 1000);
  updateClock();
};

async function loadDisplay() {
  try {
    const res = await fetch('/api/queue');
    const data = await res.json();
    const { queue, stats } = data;

    // Now serving
    const serving = stats.current;
    document.getElementById('dNowToken').textContent = serving ? `#${serving.id}` : '—';
    document.getElementById('dNowName').textContent = serving ? serving.name : 'Waiting to begin';
    document.getElementById('dNowService').textContent = serving ? serving.service : '';

    // Footer
    document.getElementById('dWaiting').textContent = `${stats.waiting} waiting`;
    document.getElementById('dDone').textContent = `${stats.done} served today`;
    document.getElementById('dAvgWait').textContent = stats.avg_wait_minutes;

    // Queue list (only waiting)
    const waiting = queue.filter(p => p.status === 'waiting');
    const listEl = document.getElementById('displayQueueList');

    if (waiting.length === 0) {
      listEl.innerHTML = '<div class="dq-empty">Queue is empty</div>';
      return;
    }

    listEl.innerHTML = waiting.slice(0, 8).map((p, i) => `
      <div class="dq-row">
        <span style="color:var(--accent);font-family:var(--font-head);font-weight:700">#${p.id}</span>
        <span>${escHtml(p.name)}</span>
        <span style="color:var(--muted)">${escHtml(p.service)}</span>
        <span>
          <div class="dq-pos">${i + 1}</div>
        </span>
      </div>
    `).join('');

  } catch (e) {
    console.error('Display board error', e);
  }
}

function updateClock() {
  const now = new Date();
  document.getElementById('displayClock').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
