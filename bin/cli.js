#!/usr/bin/env node
import { createWebhookServer } from '../src/server.js';

const args = process.argv.slice(2);
let port = 3333;
let delay = 0;
let status = 200;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' || args[i] === '-p') port = parseInt(args[++i], 10);
  if (args[i] === '--delay' || args[i] === '-d') delay = parseInt(args[++i], 10);
  if (args[i] === '--status' || args[i] === '-s') status = parseInt(args[++i], 10);
  if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
🛰️ Webhook Mock Engine CLI — Zero-Dependency Local Webhook Inspector

Usage:
  npx webhook-mock [options]

Options:
  -p, --port <number>    Port to listen on (default: 3333)
  -d, --delay <ms>       Simulate server response delay in ms (default: 0)
  -s, --status <code >   Default HTTP response status (default: 200)
  -h, --help             Show this help message

Endpoints:
  POST, GET, PUT /*      Captures any inbound webhook request
  GET /__inspect         Returns JSON array of all captured events
  GET /__inspect/types   Generates TypeScript interfaces from captured payloads
  DELETE /__inspect      Clears event history
    `);
    process.exit(0);
  }
}

const app = createWebhookServer({ port, delayMs: delay, statusCode: status });
app.start().then(p => {
  console.log(`🛰️ Webhook Mock Engine active on http://localhost:${p}`);
  console.log(`   • Inspector UI:   http://localhost:${p}/__inspect`);
  console.log(`   • TypeScript API: http://localhost:${p}/__inspect/types`);
  console.log(`   • Simulated Lag:  ${delay}ms | Status Code: ${status}`);
});
