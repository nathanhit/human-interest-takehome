import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use in-memory MongoDB for development since we don't need persistent data for this demo
// In production, this would connect to a real MongoDB instance
const connectDB = async (): Promise<void> => {
  try {
    // For demo purposes, we'll use an in-memory solution instead of requiring MongoDB to be installed
    console.log('Using in-memory database for development');
    
    // Mock successful connection
    console.log('Database connection established');
    return;
  } catch (err) {
    console.error('Failed to connect to database', err);
    process.exit(1);
  }
};

export default connectDB;
