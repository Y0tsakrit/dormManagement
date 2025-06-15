import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalLimiter } from './middleware/ratelimit';
import routes from './routes/route';


const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Dorm Management API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

export default app;