# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files (assumes they are in backend/)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire src folder into container
COPY src/ ./src

# Set working directory to src inside container
WORKDIR /app/src

# Expose the port your app uses (e.g., 5000)
EXPOSE 5000

# Start the app (ensure this matches your actual start file)
CMD ["node", "index.js"]
