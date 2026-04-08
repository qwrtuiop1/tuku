const subscribers = new Map(); // userId -> Set<res>

function subscribe(userId, res) {
  if (!subscribers.has(userId)) subscribers.set(userId, new Set());
  subscribers.get(userId).add(res);

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // initial ping
  res.write(`event: ping\n`);
  res.write(`data: {"ts": ${Date.now()}}\n\n`);

  const pingTimer = setInterval(() => {
    try {
      res.write(`event: ping\n`);
      res.write(`data: {"ts": ${Date.now()}}\n\n`);
    } catch (_) {}
  }, 25000);

  // cleanup on close
  reqOnClose(res, () => {
    clearInterval(pingTimer);
    const set = subscribers.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) subscribers.delete(userId);
    }
  });
}

function reqOnClose(res, cb) {
  res.on('close', cb);
  res.on('finish', cb);
  res.on('error', cb);
}

function publishToUsers(userIds, payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const userId of userIds) {
    const set = subscribers.get(userId);
    if (!set) continue;
    for (const res of set) {
      try { res.write(data); } catch (_) {}
    }
  }
}

module.exports = {
  subscribe,
  publishToUsers,
};


