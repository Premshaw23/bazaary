# --- BUILD STAGE ---
FROM node:22-alpine AS builder

# Set build arguments
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the source code
COPY . .

# Build the NestJS application  
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set production environment
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Install runtime dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request('http://localhost:3001/api/health/live', res => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"

# Start the application
EXPOSE 3001
CMD ["node", "dist/main"]
