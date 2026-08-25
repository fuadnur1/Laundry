import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  const app = createApp({ databaseHealthCheck: async () => new Date() });

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET /api/v1/health reports a healthy API and database', async () => {
  const response = await fetch(`${baseUrl}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'healthy');
  assert.equal(body.data.database, 'connected');
  assert.match(body.data.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

test('unknown endpoints use the standard JSON error response', async () => {
  const response = await fetch(`${baseUrl}/api/v1/unknown`);
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.match(body.message, /Route not found/);
});

test('health endpoint reports 503 when PostgreSQL is unavailable', async () => {
  const unavailableApp = createApp({
    databaseHealthCheck: async () => {
      throw new Error('database unavailable');
    },
  });

  const unavailableServer = await new Promise((resolve) => {
    const instance = unavailableApp.listen(0, '127.0.0.1', () => resolve(instance));
  });

  const address = unavailableServer.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/health`);
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.success, false);
  assert.equal(body.data.database, 'disconnected');

  await new Promise((resolve) => unavailableServer.close(resolve));
});
