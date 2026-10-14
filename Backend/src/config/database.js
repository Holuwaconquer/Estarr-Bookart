const mongoose = require('mongoose');

let connectionPromise;

mongoose.connection.on('disconnected', () => {
  connectionPromise = null;
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI)
    .then((connection) => {
      console.log('MongoDB connected successfully');
      return connection.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('MongoDB connection failed:', error.message);
      throw error;
    });

  return connectionPromise;
};

connectDB.close = async () => {
  connectionPromise = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

module.exports = connectDB;