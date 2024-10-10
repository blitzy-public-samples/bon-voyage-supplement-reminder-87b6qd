# Use the official Node.js 16 Alpine image as the base
# Node.js 16 is the current LTS version, offering better performance and security
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
# This is done before copying the rest of the files to leverage Docker cache
COPY package*.json ./

# Install production dependencies
# Use npm ci for more reliable builds and clear npm cache to reduce image size
# Also add dumb-init for proper signal handling and process management
RUN npm ci --only=production && \
    npm cache clean --force && \
    apk add --no-cache dumb-init

# Copy the rest of the application code
# .dockerignore should be used to exclude unnecessary files
COPY . .

# Set NODE_ENV to production
# This optimizes Node.js for production use
ENV NODE_ENV=production

# Expose the port the app runs on
# Note: This is for documentation purposes. You still need to map the port when running the container
EXPOSE 3000

# Use dumb-init as the entrypoint to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the Node.js application
# Using an array ensures proper argument parsing
CMD ["node", "server.js"]

# Use a non-root user for improved security
# Create a non-root user and group with explicit IDs
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nodejs -G nodejs
USER nodejs

# Health check to ensure the application is running
# Assuming healthcheck.js is present in the project root
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Label the image with metadata
LABEL maintainer="Your Organization <maintainer@example.com>"
LABEL version="1.1"
LABEL description="Dockerfile for the supplement reminder backend application"

# Multi-stage build to scan for vulnerabilities
FROM aquasec/trivy:latest as vulnscan
COPY --from=0 /usr/src/app /app
RUN trivy filesystem --exit-code 1 --severity HIGH,CRITICAL /app

# Final stage
FROM node:16-alpine
COPY --from=0 /usr/src/app /usr/src/app
WORKDIR /usr/src/app
USER nodejs
CMD ["node", "server.js"]

# Security: Specify a specific version of Node.js and Alpine
# This Dockerfile uses Node.js 16 (Alpine 3.14)
# It's recommended to periodically update these versions for security patches
```

This regenerated Dockerfile includes several improvements and best practices for an enterprise-grade, production-ready Node.js application:

1. Updated to Node.js 16, which is the current LTS version, offering better performance and security.
2. Added dumb-init for proper signal handling and process management.
3. Created a non-root user with explicit IDs for improved security.
4. Implemented a multi-stage build to include vulnerability scanning with Trivy.
5. Improved LABEL metadata for better documentation.
6. Used ENTRYPOINT with dumb-init for proper process management.
7. Assumed the presence of a healthcheck.js file for the HEALTHCHECK instruction.
8. Added comments explaining each step and best practices.

Note: This Dockerfile assumes the existence of a `healthcheck.js` file in the project root. If this file doesn't exist, you should create it with appropriate health check logic for your application.

Also, make sure to create a `.dockerignore` file in the same directory as the Dockerfile to exclude unnecessary files from the Docker build context, improving build performance and reducing image size.

Here's a comment about a change needed in another file:

```dockerfile
# TODO: Create a healthcheck.js file in the project root with the following content:
# 
# const http = require('http');
# 
# const options = {
#   host: 'localhost',
#   port: 3000,
#   timeout: 2000,
#   path: '/health'
# };
# 
# const request = http.request(options, (res) => {
#   console.log(`STATUS: ${res.statusCode}`);
#   if (res.statusCode == 200) {
#     process.exit(0);
#   } else {
#     process.exit(1);
#   }
# });
# 
# request.on('error', function(err) {
#   console.log('ERROR');
#   process.exit(1);
# });
# 
# request.end();