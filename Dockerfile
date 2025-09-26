## Multi-stage Dockerfile for Vite + React app served by Nginx

# --- Build Stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Optional: inject API base URL at build time
ARG VITE_API_BASE_URL
# If provided, write it into .env which Vite picks up at build time
RUN if [ -n "$VITE_API_BASE_URL" ]; then echo "VITE_API_BASE_URL=$VITE_API_BASE_URL" > .env; fi

# Copy source and build
COPY . .
RUN npm run build

# --- Runtime Stage ---
FROM nginx:1.27-alpine

# Nginx expects content here
COPY --from=builder /app/dist /usr/share/nginx/html

# Use custom nginx config with SPA fallback and gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Container listens on $PORT (default 8080)
ENV PORT=8080
EXPOSE 8080

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/ || exit 1

CMD ["nginx", "-g", "daemon off;"]


