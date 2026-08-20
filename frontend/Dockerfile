# Stage 1: Build Angular SSR
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc* ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx + Node.js SSR
FROM nginx:alpine

# Install Node.js in the nginx container
RUN apk add --no-cache nodejs

# Copy built Angular SSR app
COPY --from=builder /app/dist/frontend /app/dist/frontend

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
