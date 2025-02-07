// src/routes/scrape.ts
import express from 'express';
import scrapeGithubRepo from '../services/githubScraper'; // Import the scraping function

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const repoUrl = req.body.url; // Get the repository URL from the request body

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }


    await scrapeGithubRepo(repoUrl);


    res.status(200).json({ message: 'Repository scraped successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error scraping repository:', error);
       // More specific error handling based on error type if needed
    }
    res.status(500).json({ error: 'Failed to scrape repository' });
  }
});

export default router;
