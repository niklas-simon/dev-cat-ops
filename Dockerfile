FROM --platform=$BUILDPLATFORM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest && corepack enable

WORKDIR /app

FROM base AS build
COPY . /app
COPY docker.env .env
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS prod-deps
COPY package.json /app
COPY pnpm-lock.yaml /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM node:20-alpine AS system-deps

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest && corepack enable

FROM system-deps
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next
COPY --from=build /app/prisma /app/prisma
COPY --from=build /app/package.json /app
COPY --from=build /app/public /app/public
COPY --from=build /app/node_modules /app/node_modules

ENV NODE_ENV=production
ENV DATABASE_URL=mysql://example:example@localhost:3306/devcatops
ENV UPLOAD_FOLDER=/opt/devcatops/uploads

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 CMD wget -qO - http://localhost:3000/health

EXPOSE 3000
CMD pnpx prisma db push -- --skip-generate && pnpm start