import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import hsaRoutes from './routes/hsa';
import claimsRoutes from './routes/claims';
import publicClaimsRoutes from './routes/claims-public';

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.send('HSA API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/hsa', hsaRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/public', publicClaimsRoutes);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
