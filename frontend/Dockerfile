# Frontend Dockerfile
FROM node:20-slim AS builder

# Install pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend code
COPY . .

# Build the application
RUN pnpm build

# Production image
FROM nginx:alpine

# Copy the built assets to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]