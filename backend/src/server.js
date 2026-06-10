require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const { getRedisClient } = require('./utils/cache');
const logger = require('./utils/Logger');

const PORT = process.env.PORT || 5000;



const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Attempt Redis connection (non-blocking — app runs without it)
    try {
      const redis = getRedisClient();
      await redis.connect();
    } catch (redisErr) {
      logger.warn(`Redis unavailable: ${redisErr.message}. Caching disabled.`);
    }

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📄 API Docs: http://localhost:${PORT}/api/docs`);
      logger.info(`❤️  Health: http://localhost:${PORT}/health`);
    });

    global.server = server;


    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`, err);
    });

    return server;
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();