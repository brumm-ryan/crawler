# Dockerfile
FROM mcr.microsoft.com/playwright:v1.52.0-noble

# (Re‑enable Corepack / pnpm if your repo needs it)
RUN corepack enable \
 && corepack prepare pnpm@9.15.0 --activate

WORKDIR /home/pwuser/app

# copy only package metadata to leverage caching
COPY package.json ./

# install all deps (runs playwright postinstall hooks too)
RUN pnpm install
RUN pnpm playwright install --with-deps chromium

# copy your code
COPY . .

CMD ["pnpm", "start"]
