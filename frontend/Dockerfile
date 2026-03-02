# --- BUILD STAGE ---
FROM node:22-alpine AS builder

# Check if libc6-compat is needed for alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (including devDeps for build)
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Pass build arguments to environment variables so Next.js can inline them
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY

# Build the Next.js application
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Re-copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Start the application
EXPOSE 3000
CMD ["node", "server.js"]
