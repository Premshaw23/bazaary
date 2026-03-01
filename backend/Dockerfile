# --- BUILD STAGE ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build the NestJS application
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy built application from build stage
COPY --from=builder /app/dist ./dist

# Start the application
EXPOSE 3001
CMD ["node", "dist/main"]
