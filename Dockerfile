FROM node:18-bookworm-slim AS build
RUN mkdir -p /app
WORKDIR /app
COPY package*.json /app
COPY yarn.lock /app
RUN yarn install --production
COPY dist /app

FROM gcr.io/distroless/nodejs18-debian11
COPY --from=build /app /app
WORKDIR /app
