# use node:26 as our base image
FROM node:26-alpine AS builder

# goes to the app directory
WORKDIR /app

# copy package.json * mean wild card so it will also copy package-lock and (./) mean put the package in /app
COPY package*.json ./

# Install dependencies
RUN npm ci

#Copy the rest of our app into the container
COPY . .

#build dist
RUN npm run build

# Development stage
FROM node:26-alpine AS production

# Set the environment variable to ensure frameworks optimize for production
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit-dev

COPY --from=builder /app/dist ./dist
# Build the NestJS application

# Expose the port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]