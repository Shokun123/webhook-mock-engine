# 🛰️ Webhook Mock Engine

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success.svg?style=flat-square)](#)
[![Binance Pay](https://img.shields.io/badge/Support-Binance%20Pay-F0B90B.svg?style=flat-square&logo=binance&logoColor=white)](https://pay.binance.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **Zero-dependency local HTTP webhook inspector, simulated delay relay, and automated TypeScript interface generator.**

Stop paying \$10–\$20/month for Ngrok or Webhook.site just to inspect payloads from Stripe, Binance Pay, GitHub, or Shopify. Run a private, lightning-fast local webhook receiver in 2 seconds with zero external npm dependencies.

---

## ⚡ Quick Start

### 1. Run via npx (Zero Installation)
```bash
npx webhook-mock --port 3333
```

### 2. Send Any Webhook Request
```bash
curl -X POST http://localhost:3333/api/v1/payment \
  -H "Content-Type: application/json" \
  -H "X-Vendor: Binance-Pay" \
  -d '{"orderId":"ORD-9821","amount":49.00,"currency":"USDT","status":"PAID"}'
```

### 3. Inspect Inbound Events
Open `http://localhost:3333/__inspect` in your browser or curl it to get the formatted JSON log of headers, body, timestamp, and metadata.

### 4. Auto-Generate TypeScript Types
Fetch instant TypeScript interfaces matching your last captured payload:
```bash
curl http://localhost:3333/__inspect/types
```
**Output:**
```typescript
export interface CapturedWebhookPayload {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
}
```

---

## 🛠️ CLI Options

| Flag | Default | Description |
| :--- | :---: | :--- |
| `-p, --port <number>` | `3333` | Port to bind local receiver |
| `-d, --delay <ms>` | `0` | Artificial server response lag (test timeouts) |
| `-s, --status <code>` | `200` | Custom HTTP status code to return |
| `-h, --help` | — | Display command line manual |

---

## 💎 Pro Super-Pack ($19 USDT)

Upgrade to the **Webhook Mock Engine Pro Bundle** to receive:
1. **Mock Fixture Generator:** Converts captured requests into mock suites for Jest, Vitest, and Node:test.
2. **Webhook Replay Daemon:** Re-dispatches captured events to staging/production endpoints with exponential backoff.
3. **Encrypted SQLite Storage:** Persistent, encrypted disk cache for historical audits.

### How to Purchase:
Transfer **$19.00 USDT** directly via **Binance Pay**:
- **Binance Pay UID:** `1049392123`
- **Username:** `User-79a91`
- **Networks:** BEP20 / Polygon
- Reference note: `WEBHOOK-PRO`

Or purchase with instant license generation at [Shokun DevTools Hub](https://shokun123.github.io/shokun-devtools-hub/).

---

## 📄 License
MIT © [Shokun123](https://github.com/Shokun123).
