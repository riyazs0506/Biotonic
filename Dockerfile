# Production image: prerendered site + Node enquiry server.
# Build args are PUBLIC build-time settings; runtime secrets are passed as env at `docker run`.
FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_CONTENT_MODE=release
ARG VITE_SITE_URL
ENV VITE_CONTENT_MODE=$VITE_CONTENT_MODE VITE_SITE_URL=$VITE_SITE_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN if [ "$VITE_CONTENT_MODE" = "release" ]; then npm run build:release; else npm run build; fi

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8787/api/health || exit 1
CMD ["node", "dist/server/index.js"]
