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

const supabaseUrl = required('SUPABASE_URL');

try {
  new URL(supabaseUrl);
} catch {
  throw new Error('SUPABASE_URL must be a valid URL.');
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: integer('PORT', 5000),
  apiPrefix,
  supabaseUrl,
  supabaseSecretKey: required('SUPABASE_SECRET_KEY'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
});
