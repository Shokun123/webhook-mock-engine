import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createWebhookServer } from '../src/server.js';
import { jsonToTypeScript } from '../src/type_generator.js';

function sendRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

test('Webhook Mock Engine - Integration Suite', async (t) => {
  const port = 41234;
  const engine = createWebhookServer({ port, statusCode: 201 });
  await engine.start();

  t.after(async () => {
    await engine.close();
  });

  await t.test('captures POST webhook payload and headers', async () => {
    const payload = JSON.stringify({
      orderId: 'ORD-98213',
      amount: 49.00,
      currency: 'USDT',
      customer: {
        email: 'test@domain.com',
        binanceUid: '1049392123'
      }
    });

    const res = await sendRequest({
      hostname: 'localhost',
      port,
      path: '/api/v1/binance-pay/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': 'mock-hmac-sha512'
      }
    }, payload);

    assert.equal(res.statusCode, 201);
    const parsed = JSON.parse(res.body);
    assert.equal(parsed.status, 'received');
    assert.ok(parsed.id);
  });

  await t.test('retrieves captured events from /__inspect', async () => {
    const res = await sendRequest({
      hostname: 'localhost',
      port,
      path: '/__inspect',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.equal(data.total, 1);
    assert.equal(data.events[0].body.orderId, 'ORD-98213');
    assert.equal(data.events[0].headers['x-signature'], 'mock-hmac-sha512');
  });

  await t.test('generates strongly typed TypeScript interface via /__inspect/types', async () => {
    const res = await sendRequest({
      hostname: 'localhost',
      port,
      path: '/__inspect/types',
      method: 'GET'
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.body.includes('export interface CapturedWebhookPayload'));
    assert.ok(res.body.includes('orderId: string'));
    assert.ok(res.body.includes('amount: number'));
  });

  await t.test('clears event history via DELETE /__inspect', async () => {
    const res = await sendRequest({
      hostname: 'localhost',
      port,
      path: '/__inspect',
      method: 'DELETE'
    });

    assert.equal(res.statusCode, 200);
    assert.equal(engine.events.length, 0);
  });

  await t.test('jsonToTypeScript helper handles nested objects and arrays', () => {
    const sample = {
      id: 'evt_123',
      tags: ['crypto', 'billing'],
      metadata: { active: true, score: 99 }
    };
    const ts = jsonToTypeScript(sample, 'PaymentEvent');
    assert.ok(ts.includes('export interface PaymentEvent'));
    assert.ok(ts.includes('tags: string[]'));
    assert.ok(ts.includes('export interface Metadata'));
  });
});
