import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import  pool  from './config/db';
import itemRoutes from './routes/itemRoute';
import userRoutes from './routes/userRoutes';
import claimRoutes from './routes/claimRoutes';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Item Routes
app.use('/api/items', itemRoutes);
// User Auth Routes
app.use('/api/users', userRoutes);
// Health Check Route
// Claim Routes
app.use('/api/claims', claimRoutes);
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'Server is running',
      dbTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});