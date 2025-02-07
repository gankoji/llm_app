import express from 'express';
import promptRouter from './routes/prompt';
import scrapeRouter from './routes/scrape';

const app = express();
const port = 3000;

app.use(express.json());

// Routes
app.use('/prompt', promptRouter);
app.use('/scrape', scrapeRouter);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
