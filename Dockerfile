# ------------------------------------
# ETAPA 1: BUILDER (Compilação)
# ------------------------------------
FROM node:22.12.0-alpine AS builder

ENV NODE_ENV development
WORKDIR /usr/src/app

# Copia e instala todas as dependências
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código do monorepo (apps/, libs/, configs)
COPY . .

# Compila todos os projetos do monorepo em NestJS
RUN npm run build

# ------------------------------------
# ETAPA 2: PRODUCTION (Runtime Otimizado)
# ------------------------------------
# Usa uma imagem base Alpine para o runtime (leve)
FROM node:22.12.0-alpine AS production

ENV NODE_ENV production
WORKDIR /usr/src/app

RUN apk add --no-cache curl


# Copia e instala somente as dependências de produção
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copia o código compilado ('dist/') da etapa de build
COPY --from=builder /usr/src/app/dist ./dist

# Copia arquivos de configuração (se houver)
COPY nest-cli.json tsconfig.json ./

# Porta padrão para a API
EXPOSE 3000

# O comando de inicialização é o da API, mas será sobrescrito no Docker Compose
CMD [ "node", "dist/apps/planejamento-ethos/main.js" ]