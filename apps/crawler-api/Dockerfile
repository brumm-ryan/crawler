# Dockerfile for crawler-api
FROM node:22-slim

# Install system dependencies needed for Temporal native binaries
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /home/node/app

# Copy workspace configuration and package.json files for caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/crawler-api/package.json ./apps/crawler-api/

# Copy shared-contracts source code
COPY packages/shared-contracts/ ./packages/shared-contracts/

# Copy crawler-api source code
COPY apps/crawler-api/ ./apps/crawler-api/

# Install dependencies (this will build shared-contracts via prepack)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd apps/crawler-api && pnpm prisma generate

# Build the application
RUN cd apps/crawler-api && pnpm build

# Set working directory to the app
WORKDIR /home/node/app/apps/crawler-api

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start:prod"]