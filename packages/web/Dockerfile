# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/web/package*.json ./packages/web/

# Install dependencies
RUN npm ci --workspace=web

# Copy source code
COPY packages/web ./packages/web

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_VAPID_PUBLIC_KEY

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY}

# Build the application
WORKDIR /app/packages/web
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY packages/web/nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
