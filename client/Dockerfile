# Stage 1: node_modules dependencies
FROM node:26-alpine AS deps

#app directory
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Stage 2: build app
FROM node:26-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Stage 3: production runner
FROM node:26-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static

EXPOSE 4000
ENV PORT=4000

CMD ["node", "server.js"]