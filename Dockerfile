# Moringa Development Studio - Docker Container
# Minimal, production-ready container for the visual development environment

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && npm cache clean --force

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p user-scripts dev-studio

# Create non-root user for security
RUN addgroup -g 1001 -S moringa && \
    adduser -S moringa -u 1001

# Set ownership
RUN chown -R moringa:moringa /app

# Switch to non-root user
USER moringa

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/system/info', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start command
CMD ["npm", "start"]