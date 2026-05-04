// ════════════════════════════════════════
//  FETCH / CACHE
// ════════════════════════════════════════
const _cache = new Map();

async function apiFetch(url) {
  if (_cache.has(url)) return _cache.get(url);
  let lastErr;
  for (const p of PROXIES) {
    try {
      const r = await fetch(p(url), { signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        const data = await r.json();
        _cache.set(url, data);
        const ttl = url.includes('standings') ? 10 * 60 * 1000 : 5 * 60 * 1000;
        setTimeout(() => _cache.delete(url), ttl);
        return data;
      }
      lastErr = new Error(`HTTP ${r.status}`);
    } catch(e) { lastErr = e; }
  }
  throw lastErr;
}

// ════════════════════════════════════════
//  DATE HELPERS
// ════════════════════════════════════════
function fmtDate(s) {
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y,m-1,d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
}
function dateNDaysAgo(n) { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().split('T')[0]; }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
