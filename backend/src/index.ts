import express from 'express';
import cors from 'cors';
import promptRouter from './routes/prompt';
import scrapeRouter from './routes/scrape';
import conversationsRouter from './routes/conversations';

const app = express();
const port = 3000;

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:8080', // Frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If you need to send cookies or authentication headers
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/conversations', conversationsRouter);
app.use('/prompt', promptRouter);
app.use('/scrape', scrapeRouter);

app.listen(port, '0.0.0.0',() => {
  console.log(`Server running at http://localhost:${port}`);
});
