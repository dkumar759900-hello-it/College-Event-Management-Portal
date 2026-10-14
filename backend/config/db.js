const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
      isConnected = true;
      return;
    } catch (err) {
      console.warn(`⚠️ Failed to connect to MONGODB_URI (${mongoUri}). Error: ${err.message}`);
      console.log('🔄 Falling back to In-Memory MongoDB Server...');
    }
  }

  // Fallback to MongoMemoryServer for instant zero-config viva/demo execution
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected (In-Memory Database for local dev/demo): ${uri}`);
    isConnected = true;
  } catch (memoryErr) {
    console.error(`❌ In-Memory Mongo failed to start: ${memoryErr.message}`);
    // Try default local connection as last resort
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/college_event_portal');
      console.log('✅ Connected to local MongoDB default instance.');
      isConnected = true;
    } catch (localErr) {
      console.error(`❌ Local MongoDB connection failed: ${localErr.message}`);
    }
  }
};

module.exports = connectDB;
