FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package metadata
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port (Render defaults to 10000 or reads the PORT env var)
ENV PORT=3000
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]
