# Use the official Node.js 18 image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies (including dev dependencies for development)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port that Next.js runs on
EXPOSE 3000

# Set environment variables for development
ENV NODE_ENV=development
ENV PORT=3000

# Start the application in development mode
CMD ["npm", "run", "dev"]
