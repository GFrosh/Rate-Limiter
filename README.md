# rate-limiter

A lightweight, pluggable rate limiting middleware for Express — built on the **Sliding Window** algorithm with an in-memory store. Designed to be dropped into any Express app with one line, and extended with other algorithms as your needs grow.

---

## Features

- ✅ Sliding Window algorithm (smooth, no burst at reset boundaries)
- ✅ Per-user or per-IP limiting
- ✅ Custom key resolver (limit by user ID, API key, route, or anything)
- ✅ Configurable limit, window size, and error response
- ✅ In-memory store (Map-based, zero dependencies)
- ✅ Clean architecture — swap in Redis or SQLite without touching middleware logic
- 🔜 Token Bucket algorithm (planned)
- 🔜 Fixed Window algorithm (planned)
- 🔜 npm package release (planned)

---

## Installation

```bash
npm install
```

> No published npm package yet — clone and use locally for now.

---

## Quick Start

```js
const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

app.use(rateLimiter({
  windowMs: 10000,   // 10 seconds
  maxRequests: 5,    // max 5 requests per window
}));

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello!' });
});

app.listen(3000);
```

That's it. Every request beyond the limit gets a `429 Too Many Requests` response — automatically.

---

## Configuration

| Option         | Type       | Default         | Description                                              |
|----------------|------------|-----------------|----------------------------------------------------------|
| `windowMs`     | `number`   | `10000`         | Size of the sliding window in milliseconds               |
| `maxRequests`  | `number`   | `5`             | Max requests allowed per window per key                  |
| `keyResolver`  | `function` | IP address      | Function that receives `req` and returns a unique string |
| `onLimitReached` | `function` | 429 JSON response | Custom handler `(req, res)` called when limit is hit  |
| `store`        | `object`   | In-memory Map   | Custom store (see [Custom Store](#custom-store))         |

---

## Examples

### Limit by authenticated user ID

```js
app.use(rateLimiter({
  windowMs: 60000,
  maxRequests: 30,
  keyResolver: (req) => req.user?.id || req.ip,
}));
```

### Limit a specific route only

```js
const apiLimiter = rateLimiter({ windowMs: 5000, maxRequests: 3 });

app.post('/api/login', apiLimiter, loginHandler);
```

### Custom error response

```js
app.use(rateLimiter({
  windowMs: 10000,
  maxRequests: 5,
  onLimitReached: (req, res) => {
    res.status(429).json({
      error: 'Slow down.',
      retryAfter: '10 seconds',
    });
  },
}));
```

---

## How the Sliding Window Works

Unlike Fixed Window (which resets a counter every N seconds and allows burst traffic at boundaries), Sliding Window tracks the **exact timestamps** of each request within the window.

```
Window = 10s, Max = 5 requests

Timeline:
  00:00 → req ✅  (1/5)
  00:03 → req ✅  (2/5)
  00:05 → req ✅  (3/5)
  00:07 → req ✅  (4/5)
  00:09 → req ✅  (5/5)
  00:10 → req ❌  (still 5 in [00:00 → 00:10])
  00:11 → req ✅  (00:00 drops out → 4/5)
```

Each request only counts if it falls within the last `windowMs` milliseconds. Old timestamps are pruned on every request.

---

## Project Structure

```
rate-limiter/
├── middleware/
│   └── rateLimiter.js     # Express middleware (entry point)
├── algorithms/
│   ├── slidingWindow.js   # Sliding Window implementation
│   └── tokenBucket.js     # Token Bucket (coming soon)
├── store/
│   └── memoryStore.js     # In-memory Map store
├── client/                # Demo visualiser (HTML/CSS/JS)
├── server/
│   └── server.js          # Demo Express server
├── package.json
└── README.md
```

---

## Custom Store

The store interface is simple — any object that implements `get` and `set` can be swapped in:

```js
const myStore = {
  data: new Map(),
  get(key) { return this.data.get(key); },
  set(key, value) { this.data.set(key, value); },
};

app.use(rateLimiter({
  windowMs: 10000,
  maxRequests: 5,
  store: myStore,
}));
```

This makes it straightforward to back the limiter with Redis, SQLite, or any persistent layer later — without changing any middleware code.

---

## Response Headers

When the limit is **not** reached, the middleware sets these headers on every response:

| Header                  | Value                                      |
|-------------------------|--------------------------------------------|
| `X-RateLimit-Limit`     | Max requests allowed in the window         |
| `X-RateLimit-Remaining` | Requests remaining in current window       |
| `X-RateLimit-Reset`     | Unix timestamp (ms) when the window resets |

When the limit **is** reached, `Retry-After` (in seconds) is also included.

---

## Algorithms (Roadmap)

| Algorithm       | Status      | Notes                                              |
|-----------------|-------------|----------------------------------------------------|
| Sliding Window  | ✅ Available | Default. Smooth and accurate.                      |
| Token Bucket    | 🔜 Planned  | Good for bursty traffic with a steady refill rate. |
| Fixed Window    | 🔜 Planned  | Simplest. Susceptible to boundary bursts.          |
| Leaky Bucket    | 🔜 Planned  | Enforces a strict output rate.                     |

Switching algorithms will be a one-line config change:

```js
// future API
app.use(rateLimiter({
  algorithm: 'token-bucket',
  windowMs: 10000,
  maxRequests: 5,
}));
```

---

## License

ISC

---

*Built by [GFrosh](https://github.com/GFrosh)*
