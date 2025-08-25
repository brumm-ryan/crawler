# Dockerfile
FROM mcr.microsoft.com/playwright:v1.52.0-noble

# (Re‑enable Corepack / pnpm if your repo needs it)
RUN corepack enable \
 && corepack prepare pnpm@9.15.0 --activate

WORKDIR /home/pwuser/app

# Copy workspace configuration and package.json files for caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/stagehand-temporal/package.json ./apps/stagehand-temporal/

# Copy shared-contracts source code
COPY packages/shared-contracts/ ./packages/shared-contracts/

# Copy stagehand-temporal source code
COPY apps/stagehand-temporal/ ./apps/stagehand-temporal/

# Install all dependencies (runs playwright postinstall hooks and builds shared-contracts via prepack)
RUN pnpm install --frozen-lockfile
RUN cd apps/stagehand-temporal && pnpm playwright install --with-deps chromium

# Set working directory to the app
WORKDIR /home/pwuser/app/apps/stagehand-temporal

CMD ["pnpm", "start"]
