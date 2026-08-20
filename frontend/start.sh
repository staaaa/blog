#!/bin/sh

# Start Node.js SSR server in background
PORT=4000 node /app/dist/frontend/server/server.mjs &

# Wait for SSR server to be ready
sleep 2

# Start Nginx in foreground
nginx -g 'daemon off;'
