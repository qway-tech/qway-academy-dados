# Dockerfile para a aplicação front‑end React
#
# Esta imagem instala dependências, compila o bundle com Vite e
# executa o servidor de desenvolvimento. Para uso em produção,
# recomenda‑se servir os arquivos estáticos a partir de um servidor
# como Nginx ou qualquer CDN, mas para simplificar o ambiente de
# desenvolvimento utilizamos o próprio Vite com a opção --host.

# apps/plataforma/frontend/Dockerfile

# Etapa de deps para cache
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --audit=false --fund=false

# Etapa de desenvolvimento
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Etapa de build para produção (opcional)
FROM node:20-alpine AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa de runtime de produção com Nginx (opcional)
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html

