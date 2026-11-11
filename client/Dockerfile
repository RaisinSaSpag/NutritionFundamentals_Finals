# ========================================================
# Stage 1: Build & Bundle Frontend Assets
# ========================================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Optional build-time argument for API Base URL
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ========================================================
# Stage 2: Production Nginx High-Performance Web Server
# ========================================================
FROM nginx:alpine AS runner

# Remove default boilerplate files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static assets and custom Nginx reverse proxy configuration
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
