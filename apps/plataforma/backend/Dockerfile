# syntax=docker/dockerfile:1.7

# apps/plataforma/backend/Dockerfile

FROM node:18-alpine AS builder
WORKDIR /app

# Dependência para Prisma
RUN apk add --no-cache openssl

# Permite trocar o registry se precisar de mirror
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm config set registry ${NPM_REGISTRY}

# Flags do npm ci (pode ajustar via args no compose)
ARG NPM_CI_FLAGS="--audit=false --fund=false"

# Manifestos e diretórios necessários para cache
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Cache de diretório do NPM acelera builds subsequentes
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci $NPM_CI_FLAGS

# Gera o Prisma Client (schema já deve estar válido)
RUN npx prisma generate

# Código fonte e build
COPY . .
RUN npm run build

# IMPORTANTE: não executar prune aqui se você quer rodar 'prisma migrate' no runtime

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL para Prisma e cliente do Postgres para checagem de disponibilidade
RUN apk add --no-cache openssl postgresql-client

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# força "type": "commonjs"
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.type='commonjs';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

# entrypoint
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["/app/docker-entrypoint.sh"]
