import dotenv from 'dotenv';

dotenv.config();

const integer = (name, fallback) => {
  const raw = process.env[name] ?? String(fallback);
  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const boolean = (name, fallback = false) => {
  const raw = (process.env[name] ?? String(fallback)).toLowerCase();

  if (!['true', 'false'].includes(raw)) {
    throw new Error(`${name} must be either true or false.`);
  }

  return raw === 'true';
};

const required = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const apiPrefix = process.env.API_PREFIX ?? '/api/v1';

if (!apiPrefix.startsWith('/')) {
  throw new Error('API_PREFIX must start with a forward slash.');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: integer('PORT', 5000),
  apiPrefix,
  databaseUrl: required('DATABASE_URL'),
  databaseSsl: boolean('DATABASE_SSL'),
  dbPoolMax: integer('DB_POOL_MAX', 10),
  dbIdleTimeoutMs: integer('DB_IDLE_TIMEOUT_MS', 30000),
  dbConnectionTimeoutMs: integer('DB_CONNECTION_TIMEOUT_MS', 5000),
});
