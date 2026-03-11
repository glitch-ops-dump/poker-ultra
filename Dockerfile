FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM node:20-slim
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .
RUN npx tsc
COPY --from=client-build /app/client/dist /app/client/dist
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
