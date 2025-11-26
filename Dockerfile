# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV=production

FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential python3 make g++ pkg-config

COPY package*.json ./
RUN npm ci

COPY . .

# build if your project needs it (NextJS, NestJS, TS, React etc.)
RUN npm run build || echo "no build step"

FROM base

COPY --from=build /app /app

EXPOSE 3000
CMD ["npm","run","start"]
