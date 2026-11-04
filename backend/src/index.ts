import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Sağlık kontrolü
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'Arya Pet Nakil Backend API', timestamp: new Date() });
});

// API rotaları
app.use('/api', apiRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🐾 Arya Pet Nakil API Servisi ${PORT} portunda çalışıyor...`);
  });
}

export default app;
