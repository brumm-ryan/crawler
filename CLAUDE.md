# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a pnpm monorepo for a web crawling/data extraction platform with the following applications:

- **crawl-ux**: React frontend built with Vite, TanStack Router, and Tailwind CSS
- **crawler-api**: FastAPI backend with SQLModel and Temporal integration
- **stagehand-temporal**: Temporal worker service using Stagehand for browser automation

## Development Setup

### Prerequisites
- pnpm (package manager)
- Docker and Docker Compose
- Node.js (for frontend and temporal worker)
- Python (for API backend)

### Starting the Development Environment

```bash
# Start all services with Docker Compose
docker-compose up

# Or start specific services:
docker-compose up crawl-ux    # Frontend at http://localhost:8081
docker-compose up crawl-api   # API at http://localhost:8000  
docker-compose up worker      # Temporal worker
```

### Individual Application Commands

**Frontend (crawl-ux):**
```bash
cd apps/crawl-ux
pnpm install
pnpm dev          # Development server
pnpm build        # Production build
pnpm test         # Run tests with Vitest
```

**API (crawler-api):**
```bash
cd apps/crawler-api
pip install -r requirements.txt
python main.py    # Start FastAPI server
```

**Temporal Worker (stagehand-temporal):**
```bash
cd apps/stagehand-temporal
pnpm install
pnpm build        # TypeScript compilation
pnpm start        # Start Temporal worker
pnpm workflow     # Start workflow client

# Docker build (run from monorepo root):
docker build -f apps/stagehand-temporal/Dockerfile -t stagehand-temporal .
```

## Architecture Overview

### Core Services
- **Temporal**: Workflow orchestration (localhost:7233, UI at localhost:8080)
- **MySQL**: Primary database for Temporal (port 3306) and crawler data (port 3307)
- **Redis**: Caching layer for Stagehand operations (port 6379)
- **Browserless**: Browser automation service (localhost:3000)

### Data Flow
1. Frontend (crawl-ux) sends requests to crawler-api
2. API stores scan requests and triggers Temporal workflows
3. Temporal worker (stagehand-temporal) executes browser automation tasks
4. Results are stored in MySQL and cached in Redis
5. Frontend polls for results and displays data

### Key Technologies
- **Frontend**: Vite + React + TanStack Router + Tailwind CSS + Shadcn/ui
- **Backend**: FastAPI + SQLModel + Pydantic
- **Automation**: Stagehand + Playwright + Temporal
- **Databases**: MySQL + Redis
- **Infrastructure**: Docker + Docker Compose

## Browser Automation

The stagehand-temporal service uses:
- **Stagehand SDK** for high-level browser automation with AI fail-safes
- **Connection pooling** (2-10 instances) for performance optimization  
- **Redis caching** for expensive operations
- **Browserless** for headless Chrome instances

Use the `withStagehand` helper for automatic pool management:
```typescript
import { withStagehand } from "../stagehand-helper";

async function myActivity(stagehand: Stagehand): Promise<any> {
  // Browser automation logic here
}

export const exportedActivity = withStagehand(myActivity);
```

## Database Models

**Crawler API uses:**
- Users, Scans, Datasheets models with SQLModel
- MySQL for persistence with automatic migrations
- Temporal client integration for workflow management

## Testing

- **Frontend**: Vitest with Testing Library
- **API**: Use test_main.http for endpoint testing
- **Worker**: Built-in Temporal testing capabilities

## Environment Configuration

Key environment variables:
- `TEMPORAL_ADDRESS`: Temporal server connection
- `DATABASE_URL`: MySQL connection string  
- `REDIS_HOST/PORT`: Redis configuration
- `BROWSERLESS`: Browser service endpoint
- API keys for OpenAI/Anthropic (in .env files)