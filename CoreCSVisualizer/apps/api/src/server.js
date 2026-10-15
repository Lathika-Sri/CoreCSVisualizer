import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import apiRouter from './routes/api.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api', apiRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ error: err.message || 'Internal server error' });
});

if (!mongoUri) {
  console.error('MONGODB_URI is missing. Set it in the Render service environment.');
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`CoreCS API listening on port ${port}`);
  });
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
}