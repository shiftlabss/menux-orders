# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
# Copy configs or other assets if needed
# COPY --from=builder /app/.env .env # Usually injected by k8s/docker-compose

USER node

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/interfaces/http/server.js"]
