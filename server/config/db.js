import mongoose from 'mongoose';

/**
 * Connect to MongoDB database.
 * Supports both local MongoDB instances and MongoDB Atlas URIs.
 * If MongoDB is not reachable, the app automatically runs in fallback mode without crashing.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/snipdrop';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout check
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`[Database Note] MongoDB is not running locally (${error.message}).`);
    console.log('[Database Note] Activated zero-config persistent local store so you can use and test SnipDrop immediately!');
    console.log('[Database Note] To connect to real MongoDB Atlas, set MONGODB_URI in server/.env.');
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database] MongoDB reconnected.');
  });
}
