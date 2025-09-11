# ------ deps ------
    FROM node:20-alpine AS deps
    WORKDIR /app
    COPY package*.json ./

    ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

    RUN npm ci --no-audit --no-fund
    
    # ------ builder ------
    FROM deps AS builder
    
    ################  Build-time env (safe to expose)  ################
    # These come from --build-arg .... in docker-compose or `docker build`
    ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ARG NEXT_PUBLIC_API_URL
    ARG NEXT_PUBLIC_BASE_URL
    ARG NEXT_PUBLIC_AWS_S3_BUCKET_LINK
    ARG NEXT_PUBLIC_SWAGGER_PASS
    ARG NEXT_PUBLIC_CHAT_SOCKET_URL
    ARG NEXT_PUBLIC_REDIS_HOST
    ARG NEXT_PUBLIC_REDIS_PORT
    
    # Turn them into real environment variables so `npm run build`
    # and any shell commands can read them:
    ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
        NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
        NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
        NEXT_PUBLIC_AWS_S3_BUCKET_LINK=${NEXT_PUBLIC_AWS_S3_BUCKET_LINK} \
        NEXT_PUBLIC_SWAGGER_PASS=${NEXT_PUBLIC_SWAGGER_PASS} \
        NEXT_PUBLIC_CHAT_SOCKET_URL=${NEXT_PUBLIC_CHAT_SOCKET_URL} \
        NEXT_PUBLIC_REDIS_HOST=${NEXT_PUBLIC_REDIS_HOST} \
        NEXT_PUBLIC_REDIS_PORT=${NEXT_PUBLIC_REDIS_PORT}
    ###################################################################
    
    COPY . .
    # RUN npm run build && npx tsc -p tsconfig.build.json && npx tsc-alias -p tsconfig.build.json  # compile TS → JS
    RUN npm run build && \
    rm -rf .next/cache && \
    rm -rf node_modules/.cache
    # ------ prune ------
    FROM builder AS prune
    RUN npm prune --production && \
    npm cache clean --force && \
    rm -rf /tmp/* && \
    rm -rf node_modules/.cache && \
    find node_modules -name "*.d.ts" -delete && \
    find node_modules -name "*.map" -delete && \
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf node_modules/@aws-sdk/*/dist-cjs && \
    rm -rf node_modules/@aws-sdk/*/dist-types && \
    rm -rf node_modules/*/docs && \
    rm -rf node_modules/*/examples && \
    rm -rf node_modules/*/README.md
    # RUN npm prune --production
    
    # ------ super admin ------
    FROM node:20-alpine AS super-admin
    WORKDIR /app
    ENV NODE_ENV=production

    RUN apk add --no-cache chromium
    ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

    COPY --from=prune   /app/node_modules   ./node_modules
    COPY --from=builder /app/.next/standalone .
    COPY --from=builder /app/.next/static  ./.next/static
    COPY --from=builder /app/public        ./public
    EXPOSE 3000
    CMD ["node","server.js"]
