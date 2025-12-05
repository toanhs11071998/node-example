const mongoose = require('mongoose');

// For serverless environments (Vercel), reuse mongoose connection across invocations
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // don't exit in serverless environment; rethrow so caller can handle
    throw error;
  }
};

module.exports = connectDB;
