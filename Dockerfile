# Use official Node.js LTS version as base image
FROM node:18

# Create app directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all project files to the container
COPY . .

# Run tests
RUN npm test

# Expose port (should match the port your app listens on)
EXPOSE 5000

# Default command to run your app
CMD ["node", "server.js"]
