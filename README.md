# Adolla Store API

## Project Description
A simple REST API to create and manage products in a store

## Repository Architecture

This monorepo implements Clean NestJs Architecture with Typescript (Controller, Service, and Data Layer).

## Postman Documentation

[https://documenter.getpostman.com/view/11044390/2s9YeG5rJ5](https://documenter.getpostman.com/view/11044390/2s9YeG5rJ5)

## App Features

- Authentication & Authorization
- Admin Activity Trail
- Product & Category Management (CRUD)
- Pagination, Search, and Filter available on Products and Category EPs
- Containerization with Docker (62Mb image size)
- Live API on Heroku
- E2E Testing (72 Test cases)


## Installation

```bash
$ yarn install
```

## Running the app

```bash
# with docker compose
$ docker-compose up

# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
