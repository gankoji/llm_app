# RAG Application with ChromaDB Integration

A Node.js application that implements Retrieval-Augmented Generation (RAG) using ChromaDB as the vector database and Anthropic's Claude 3 as the foundation model. The application can scrape GitHub repositories and use their contents as context for answering questions.

## Features

- **GitHub Repository Scraping**: Automatically clone and process repositories (supports both public and private repositories via SSH)
- **Vector Storage**: Uses ChromaDB to store and query document embeddings
- **RAG-powered Responses**: Combines retrieved context with user queries to generate more informed responses
- **REST API Interface**: Simple HTTP endpoints for both scraping and querying

## Prerequisites

- Docker and Docker Compose
- An Anthropic API key
- (Optional) SSH key for accessing private GitHub repositories

## Quick Start

1. Clone this repository
2. Create a `.env` file in the root directory:

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

3. (Optional) For private repository access, add your SSH keys:

```bash
cp ~/.ssh/id_rsa ./id_rsa
cp ~/.ssh/id_rsa.pub ./id_rsa.pub
```

4. Build and start the services:

```bash
docker-compose up --build
```

## API Endpoints

### Scrape Repository

```bash
POST /scrape
Content-Type: application/json

{
    "url": "https://github.com/username/repository"
}
```

### Query with RAG

```bash
POST /prompt
Content-Type: application/json

{
    "messages": [
        {
            "role": "user",
            "content": "Your question here"
        }
    ]
}
```

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `MODEL_NAME`: The Claude model to use (defaults to claude-3-sonnet-20240229)
- `CHROMA_URL`: ChromaDB instance URL (defaults to http://chromadb:8000)

### Docker Volumes

- `app_data`: Temporary storage for git operations
- `chroma_data`: Persistent storage for ChromaDB

## Architecture

The application consists of several key components:

- **Express Server**: Handles HTTP requests and routing
- **ChromaDB**: Vector database for storing and querying document embeddings
- **LLM Service**: Interfaces with Anthropic's Claude 3 model
- **GitHub Scraper**: Clones and processes repository content

## Development

1. Install dependencies:

```bash
npm install
```

2. Run in development mode:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Dependencies

### Main Dependencies

- @anthropic-ai/sdk: Anthropic Claude API client
- chromadb: Vector database client
- express: Web framework
- simple-git: Git operations
- typescript: Type support
- zod: Schema validation

### Dev Dependencies

- ts-node-dev: Development server
- @types/\*: TypeScript type definitions

## Security Notes

- Ensure proper SSH key permissions (600) when using private repositories
- Keep your Anthropic API key secure
- Consider implementing rate limiting for production use
- The application currently accepts GitHub host keys automatically in development
