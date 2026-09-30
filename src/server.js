import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { jsonToTypeScript } from './type_generator.js';

export function createWebhookServer(options = {}) {
  const port = options.port || 3333;
  const simulatedDelay = options.delayMs || 0;
  const defaultStatus = options.statusCode || 200;
  const capturedEvents = [];

  const server = http.createServer(async (req, res) => {
    // 1. Management API
    if (req.url === '/__inspect' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ total: capturedEvents.length, events: capturedEvents }, null, 2));
    }

    if (req.url === '/__inspect/types' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      if (capturedEvents.length === 0) {
        return res.end('// No webhooks captured yet.\n');
      }
      const lastEvent = capturedEvents[capturedEvents.length - 1];
      const types = jsonToTypeScript(lastEvent.body, 'CapturedWebhookPayload');
      return res.end(types);
    }

    if (req.url === '/__inspect' && req.method === 'DELETE') {
      capturedEvents.length = 0;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'All events cleared' }));
    }

    // 2. Webhook Ingestion
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      let parsedBody = null;

      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }

      const event = {
        id: randomUUID(),
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.url,
        headers: req.headers,
        body: parsedBody
      };

      capturedEvents.push(event);

      if (simulatedDelay > 0) {
        await new Promise(r => setTimeout(r, simulatedDelay));
      }

      res.writeHead(defaultStatus, {
        'Content-Type': 'application/json',
        'X-Webhook-Mock-Id': event.id
      });

      res.end(JSON.stringify({
        status: 'received',
        id: event.id,
        receivedAt: event.timestamp,
        simulatedDelayMs: simulatedDelay
      }));
    });
  });

  return {
    server,
    events: capturedEvents,
    start: () => new Promise(resolve => server.listen(port, () => resolve(port))),
    close: () => new Promise(resolve => server.close(resolve))
  };
}

if (process.argv[1]?.endsWith('server.js')) {
  const port = parseInt(process.env.PORT || '3333', 10);
  const engine = createWebhookServer({ port });
  engine.start().then(p => {
    console.log(`🛰️ Webhook Mock Engine listening on http://localhost:${p}`);
    console.log(`🔍 Inspect events at: http://localhost:${p}/__inspect`);
    console.log(`📝 Generated TypeScript at: http://localhost:${p}/__inspect/types`);
  });
}
