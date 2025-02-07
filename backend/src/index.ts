import express from 'express';
import promptRouter from './routes/prompt';
import scrapeRouter from './routes/scrape';
import conversationsRouter from './routes/conversations';

const app = express();
const port = 3000;

app.use(express.json());

// Routes
app.use('/conversations', conversationsRouter);
app.use('/prompt', promptRouter);
app.use('/scrape', scrapeRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
