import express from 'express';
import path from 'path';
import { app, httpServer, startApolloServer } from './server/server';
import { logger } from './server/services/logger';

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const startServer = async (): Promise<void> => {
  await startApolloServer();
  httpServer.listen(port, () => {
    logger.info('server_listening', { port });
  });
};

startServer().catch((error: Error) => {
  logger.error('server_start_error', { message: error.message });
  process.exit(1);
});
