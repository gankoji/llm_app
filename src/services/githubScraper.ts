// githubScraper.ts
import { SimpleGit, simpleGit } from 'simple-git';
import { ChromaClient } from 'chromadb';
import validUrl from 'valid-url';
import path from 'path';
import * as fs from 'fs/promises';


const chromaClient = new ChromaClient({ path: process.env.CHROMA_URL });

async function scrapeGithubRepo(repoUrl: string): Promise<void> {
  try {
    // 0. Get ChromaDB collection
    const collection = await chromaClient.getOrCreateCollection({
        name: 'default'
    });

    // 1. Validate URL
    if (!validUrl.isUri(repoUrl)) {
      throw new Error('Invalid repository URL');
    }

    // 2. Extract repo name (for local directory)
    const repoName = repoUrl.split('/').slice(-2).join('-'); // Basic extraction, adjust as needed

    // 3. Clone the repository
    const git: SimpleGit = simpleGit();
    const repoPath = path.join(process.cwd(), repoName); // Local path to the cloned repository
    await git.clone(repoUrl, repoName);

    // 4.  Read files recursively, ignoring specified directories/files
    const ignored = ['.git', '.gitignore', 'node_modules']; // Files/directories to ignore
    const files: { filename: string, content: string }[] = [];
    await walkDir(repoPath, ignored, files);

    // 5. Add to ChromaDB in batches
    const batchSize = 5; // Adjust batch size as needed
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await collection.add({
        ids: batch.map((file) => `${repoName}-${file.filename}`),
        documents: batch.map((file) => file.content),
        metadatas: batch.map((file) => ({ filename: file.filename, repoUrl })),
      });
    }

    await git.rm(['-rf', repoPath]);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error scraping repository:", error.message)
    }

    throw error;  // Re-throw the error for the calling function to handle
  }


}

async function walkDir(dir: string, ignored: string[], files: { filename: string; content: string }[]): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (ignored.includes(entry.name)) {
        continue; // Skip ignored files/directories
      }
  
      if (entry.isDirectory()) {
        await walkDir(fullPath, ignored, files);
      } else if (entry.isFile()) {
  
  
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            files.push({ filename: path.relative(process.cwd(), fullPath) , content });
  
          } catch(error) {
            // Consider whether to re-throw the error here based on the error type.
            console.warn("Error reading file (likely binary file or invalid encoding): ", fullPath, error)
          }
  
  
      }
    }
  }

export default scrapeGithubRepo;
