// ─────────────────────────────────────────
// SMART QUEUE — Customer JS
// ─────────────────────────────────────────

let currentToken = null;
let pollInterval = null;

// Load live stats on page load
window.onload = () => {
  loadStats();
  setInterval(loadStats, 8000); // refresh every 8s
};

async function loadStats() {
  try {
    const res = await fetch('/api/queue');
    const data = await res.json();
    const s = data.stats;
    document.getElementById('statWaiting').textContent = s.waiting;
    document.getElementById('statServing').textContent = s.serving;
    document.getElementById('statWait').textContent = s.avg_wait_minutes;
  } catch (e) {
    console.error('Stats load failed', e);
  }
}

async function joinQueue() {
  const name = document.getElementById('nameInput').value.trim();
  const service = document.getElementById('serviceInput').value;
  const phone = document.getElementById('phoneInput').value.trim();
  const errorEl = document.getElementById('formError');
  const btn = document.getElementById('joinBtn');
  const btnText = document.getElementById('joinBtnText');

  errorEl.textContent = '';

  if (!name) { errorEl.textContent = '⚠ Please enter your name.'; return; }
  if (!service) { errorEl.textContent = '⚠ Please select a service.'; return; }

  btn.disabled = true;
  btnText.textContent = 'Joining...';

  try {
    const res = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, service, phone })
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong.';
      btn.disabled = false;
      btnText.textContent = 'Join Queue →';
      return;
    }

    currentToken = data.token;
    showTokenCard(data);
    startPolling(data.token);

  } catch (e) {
    errorEl.textContent = 'Network error. Please try again.';
    btn.disabled = false;
    btnText.textContent = 'Join Queue →';
  }
}

function showTokenCard(data) {
  document.getElementById('joinSection').classList.add('hidden');
  document.getElementById('tokenSection').classList.remove('hidden');

  document.getElementById('tokenNumber').textContent = `#${data.token}`;
  document.getElementById('tokenName').textContent = data.name;
  document.getElementById('tokenService').textContent = data.service;
  updateTokenMeta(data);
}

function updateTokenMeta(data) {
  const pos = data.position || 0;
  const wait = data.estimated_wait || 0;
  const status = data.status || 'waiting';

  document.getElementById('tokenPosition').textContent = pos > 0 ? `#${pos}` : '—';
  document.getElementById('tokenWait').textContent = wait > 0 ? `~${wait} min` : 'Soon!';

  const statusEl = document.getElementById('tokenStatus');
  statusEl.textContent = status;
  statusEl.className = `meta-val status-badge ${status}`;

  // Progress bar (inverse — closer to front = more filled)
  const bar = document.getElementById('progressBar');
  const label = document.getElementById('progressLabel');

  if (status === 'serving') {
    bar.style.width = '100%';
    label.textContent = '🎉 It\'s your turn! Please proceed.';
    label.style.color = 'var(--green)';
  } else if (status === 'done' || status === 'skipped') {
    bar.style.width = '100%';
    label.textContent = status === 'done' ? '✅ Service complete. Thank you!' : '⏭ You were skipped. Please re-join.';
    label.style.color = 'var(--muted)';
  } else {
    const fill = pos <= 1 ? 90 : Math.max(10, 100 - pos * 15);
    bar.style.width = `${fill}%`;
    label.textContent = pos === 1
      ? '⏳ You\'re next!'
      : `⏳ ${pos - 1} people ahead of you`;
    label.style.color = 'var(--muted)';
  }
}

function startPolling(tokenId) {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/status/${tokenId}`);
      const data = await res.json();
      if (res.ok) updateTokenMeta(data);
      // Stop polling once done
      if (data.status === 'done' || data.status === 'removed') {
        clearInterval(pollInterval);
      }
    } catch (e) {}
  }, 5000); // poll every 5s
}

function resetForm() {
  if (pollInterval) clearInterval(pollInterval);
  currentToken = null;
  document.getElementById('tokenSection').classList.add('hidden');
  document.getElementById('joinSection').classList.remove('hidden');
  document.getElementById('nameInput').value = '';
  document.getElementById('serviceInput').value = '';
  document.getElementById('phoneInput').value = '';
  document.getElementById('joinBtn').disabled = false;
  document.getElementById('joinBtnText').textContent = 'Join Queue →';
}
