# Build stage
FROM node:22-alpine AS build

# Enable pnpm
RUN corepack enable \
    && corepack prepare pnpm@9.15.0 --activate

WORKDIR /home/node/app

# Copy workspace configuration and package.json files for caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-contracts/package.json ./packages/shared-contracts/
COPY apps/crawl-ux/package.json ./apps/crawl-ux/

# Copy shared-contracts source code
COPY packages/shared-contracts/ ./packages/shared-contracts/

# Copy crawl-ux source code
COPY apps/crawl-ux/ ./apps/crawl-ux/

# Install dependencies (this will build shared-contracts via prepack)
RUN pnpm install --frozen-lockfile

# Build the application
RUN cd apps/crawl-ux && pnpm build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from the build stage
COPY --from=build /home/node/app/apps/crawl-ux/dist /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]