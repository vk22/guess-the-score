FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --ignore-scripts

FROM deps AS build
COPY . .
RUN npm run prisma:generate && npm run build

FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["sh", "-lc", "npx prisma migrate deploy && node .output/server/index.mjs"]
