# --- BUILD STAGE ---
FROM node:22-alpine AS builder

# Check if libc6-compat is needed for alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (including devDeps for build)
RUN npm ci && npm cache clean --force

# Copy the rest of the source code
COPY . .

# Pass build arguments to environment variables so Next.js can inline them
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# --- PRODUCTION STAGE ---
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone output from builder
COPY --from=builder /app/public ./public
# Set permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request('http://localhost:3000/_next/static', res => process.exit(res.statusCode === 200 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"

# Start the application
EXPOSE 3000
CMD ["node", "server.js"]
