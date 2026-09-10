FROM node:22-bookworm-slim
WORKDIR /app
COPY google-server/package*.json ./google-server/
RUN npm ci --omit=dev --prefix google-server
COPY index.html sleep-lab.html landing.css landing.js night-passage.css night-passage.js lab-polish.css tools.js ./
COPY tools/ ./tools/
COPY assets/*.webp ./assets/
COPY google-server/*.mjs ./google-server/
USER node
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "google-server/server.mjs"]
