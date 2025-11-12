# Stage 1: Build Angular Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy frontend source
COPY frontend/ ./

# Build Angular app for production
RUN npm run build -- --base-href /k3s/

# Stage 2: Build Backend and Final Image
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy backend source
COPY backend/src ./src

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist/k3s-admin-frontend ./frontend/dist/k3s-admin-frontend

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/metrics', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]
