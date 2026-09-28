require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('[Database] PostgreSQL connection established successfully.');

    const server = app.listen(PORT, () => {
      console.log(`[Server] Inventory Management API running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Inventory endpoint: http://localhost:${PORT}/api/inventory`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('[Database] Database connections closed.');
          process.exit(0);
        } catch (err) {
          console.error('[Database] Error during disconnect:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Failed to connect to database:', error.message);
    process.exit(1);
  }
}

startServer();
