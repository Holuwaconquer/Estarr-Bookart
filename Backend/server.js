require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL) {
  module.exports = app;
} else {
  const startServer = async () => {
    await connectDB();
    app.locals.server = app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
    app.locals.server.on('error', (error) => {
      console.error('Backend server error:', error);
      if (error.code === 'EADDRINUSE') process.exitCode = 1;
    });
  };

  const gracefulShutdown = async () => {
    try {
      await new Promise((resolve, reject) => {
        app.locals.server?.close((error) => (error ? reject(error) : resolve()));
        if (!app.locals.server) resolve();
      });
      await connectDB.close();
      process.exit(0);
    } catch (error) {
      console.error('Failed to shut down backend cleanly:', error);
      process.exit(1);
    }
  };

  startServer().catch((error) => {
    console.error('Failed to start backend:', error);
    process.exitCode = 1;
  });

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    gracefulShutdown();
  });
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    gracefulShutdown();
  });
}
