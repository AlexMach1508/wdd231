// scripts/cache.js
window.NTCache = window.NTCache || {
  read(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { timestamp, ttl, payload } = JSON.parse(raw);
      const age = Date.now() - timestamp;
      if (ttl && age > ttl) return { stale: true, payload }; // vencido pero usable
      return { stale: false, payload };
    } catch { return null; }
  },
  write(key, payload, ttlMs) {
    const record = { timestamp: Date.now(), ttl: ttlMs || 0, payload };
    localStorage.setItem(key, JSON.stringify(record));
  }
};
