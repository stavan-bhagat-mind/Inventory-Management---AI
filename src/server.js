const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('[DB] Database connection established successfully.');

    // Ensure models are synced in development if needed
    if (env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('[DB] Models synced with database.');
    }

    const server = app.listen(env.PORT, () => {
      console.log(`[SERVER] Inventory API running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n[SERVER] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('[SERVER] HTTP server closed.');
        try {
          await sequelize.close();
          console.log('[DB] Database connection pool closed.');
          process.exit(0);
        } catch (dbErr) {
          console.error('[DB] Error during database shutdown:', dbErr);
          process.exit(1);
        }
      });

      // Force shutdown after timeout
      setTimeout(() => {
        console.error('[SERVER] Forcefully shutting down due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('[SERVER] Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = startServer;
