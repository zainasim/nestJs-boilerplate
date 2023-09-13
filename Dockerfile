FROM node:18-alpine AS builder
WORKDIR /app

COPY ./package.json ./package.json
RUN yarn install

COPY . ./
RUN yarn build

# Production image, copy all the files
FROM node:18-alpine AS runner
WORKDIR /app

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

COPY .buildinfo ./

EXPOSE 3000
CMD ["yarn", "run", "start:prod"]