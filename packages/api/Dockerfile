# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/

# Install dependencies
RUN npm ci --workspace=api

# Copy source code
COPY packages/api ./packages/api

# Build the application
WORKDIR /app/packages/api
RUN npm run build -- --ignore-ts-errors

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY packages/api/package*.json ./packages/api/

# Install production dependencies only
RUN npm ci --workspace=api --omit=dev

# Copy built application
COPY --from=builder /app/packages/api/build ./packages/api/build

WORKDIR /app/packages/api

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "build/bin/server.js"]
