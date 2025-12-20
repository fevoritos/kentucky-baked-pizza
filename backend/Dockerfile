# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies for backend only
RUN pnpm install --frozen-lockfile --filter backend

# Copy backend source code
COPY backend/ ./backend/

# Build the application
WORKDIR /app/backend
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json
COPY backend/package.json ./backend/

# Install only production dependencies for backend
# This will create node_modules in /app/node_modules (pnpm workspace structure)
RUN pnpm install --prod --frozen-lockfile --filter backend

# Copy built application from builder to backend/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Set NODE_PATH to help Node.js find modules in workspace root
ENV NODE_PATH=/app/node_modules

# Change working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 3000

# Start the application (node_modules is in /app/node_modules, accessible via NODE_PATH)
CMD ["node", "dist/main.js"]

