FROM node:22-bookworm-slim
WORKDIR /app
COPY google-server/package*.json ./google-server/
RUN npm ci --omit=dev --prefix google-server
COPY google-server/*.mjs ./google-server/
USER node
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "google-server/server.mjs"]
