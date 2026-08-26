import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp } from '../src/app.js';

const availableServices = [
  {
    id: '3ba506d8-e0d4-4c36-b63c-ad7bc52a34f4',
    name: 'Wash and Iron',
    category: 'Washing',
    description: 'Professional washing and ironing per item.',
    unit_type: 'ITEM',
    unit_price: '80.00',
    estimated_hours: 24,
    express_available: true,
    express_surcharge: '30.00',
    provider: {
      user_id: '53b8cbde-c46d-4a08-b92e-f4c2df88b92c',
      business_name: 'Campus Cleaners',
      business_address: 'Bashundhara, Dhaka',
      average_rating: '4.50',
    },
  },
];

let server;
let baseUrl;

before(async () => {
  const app = createApp({
    databaseHealthCheck: async () => true,
    serviceRepository: async () => availableServices,
  });

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

test('GET /api/v1/services returns normalized available services and provider information', async () => {
  const response = await fetch(`${baseUrl}/api/v1/services`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.meta.count, 1);
  assert.deepEqual(body.data[0], {
    id: availableServices[0].id,
    name: 'Wash and Iron',
    category: 'Washing',
    description: 'Professional washing and ironing per item.',
    price: 80,
    unitType: 'ITEM',
    estimatedHours: 24,
    expressAvailable: true,
    expressSurcharge: 30,
    provider: {
      id: availableServices[0].provider.user_id,
      businessName: 'Campus Cleaners',
      address: 'Bashundhara, Dhaka',
      averageRating: 4.5,
    },
  });
});

test('GET /api/v1/services returns an empty array when no services are available', async () => {
  const emptyApp = createApp({
    databaseHealthCheck: async () => true,
    serviceRepository: async () => [],
  });
  const emptyServer = await new Promise((resolve) => {
    const instance = emptyApp.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = emptyServer.address();

  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/services`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.data, []);
  assert.equal(body.meta.count, 0);

  await new Promise((resolve) => emptyServer.close(resolve));
});

test('GET /api/v1/services passes database failures to the error handler', async () => {
  const failingApp = createApp({
    databaseHealthCheck: async () => true,
    serviceRepository: async () => {
      throw new Error('Unable to retrieve laundry services.');
    },
  });
  const failingServer = await new Promise((resolve) => {
    const instance = failingApp.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const address = failingServer.address();

  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/services`);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.equal(body.success, false);
  assert.equal(body.message, 'Unable to retrieve laundry services.');

  await new Promise((resolve) => failingServer.close(resolve));
});
