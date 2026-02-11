FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set legacy-peer-deps true && \
    npm install
COPY . .
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache libcap
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/dist /app/dist
RUN npm install -g serve
RUN setcap 'cap_net_bind_service=+ep' $(readlink -f $(which node))
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80
CMD ["serve", "-s", "dist", "-l", "80"]