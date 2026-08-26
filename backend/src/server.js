import { app } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection } from './config/database.js';

const startServer = async () => {
  await checkDatabaseConnection();

  const server = app.listen(env.port, () => {
    console.log(`LAUNDRRY API listening on http://localhost:${env.port}${env.apiPrefix}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`);

    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error('Unable to start LAUNDRRY API:', error.message);
  process.exit(1);
});
