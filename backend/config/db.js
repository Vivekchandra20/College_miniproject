/**
 * Database Configuration
 * Connects to MongoDB using Mongoose
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise} - Database connection promise
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI ;
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
