# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies for frontend only
RUN pnpm install --frozen-lockfile --filter frontend

# Copy frontend source code
COPY frontend/ ./frontend/

# Set build-time environment variable (default to /api if not provided)
ARG VITE_API_PREFIX=/api
ENV VITE_API_PREFIX=$VITE_API_PREFIX

# Build the application
WORKDIR /app/frontend
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

