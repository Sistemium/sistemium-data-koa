# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript library (sistemium-data-koa) providing REST API helpers for Koa.js. Automatically generates CRUD routes for MongoDB-based data models using the `sistemium-data` library. Published as an npm package — only `lib/` is distributed.

## Build & Development

- `npm run watch` — continuous TypeScript compilation via tsc-watch
- No test suite in this repo; testing happens at consuming application level
- TypeScript compiles to `lib/` (ES2022, CommonJS, strict mode)

## Architecture

### Model-Driven REST API

Each `KoaModel` automatically gets 5 REST endpoints via `defaultRoutes.ts`:
- `GET /:collection` — list with filtering/pagination (`getMany.ts`)
- `GET /:collection/:id` — single item retrieval (`getOne.ts`)
- `POST/PUT /:collection/:id?` — create/replace, supports batch (`postAny.ts`)
- `PATCH /:collection/:id` — partial update (`patchOne.ts`)
- `DELETE /:collection/:id` — hard delete with optional archival (`deleteOne.ts`)

### Core Types (`types.ts`)

- `KoaModel<T>` — extends sistemium-data Model with `normalizeItem`, `rolesFilter`, `mergeBy`, `merge()`
- `KoaModelController<T>` — optional per-model customization: `normalizeItemRead()`, `normalizeItemWrite()`, `getPipeline()`

### Entry Point (`KoaApi.ts`)

Sets up Koa with middleware chain: CORS → Morgan logging → body-parser → auth (pluggable) → router. Graceful shutdown on SIGINT. Listens on `REST_PORT` env var if set.

### Query Filtering (`predicates.ts`)

URL params map to MongoDB filters with schema-aware type coercion. Supports where clause syntax: `?where:{"field":{"==":value}}` with operators `==`, `<`, `>`, `>=`, `<=`, `in`, `like`.

### Handler Pattern

All handlers: validate params → build aggregation pipeline → apply role filters (`ctx.state.rolesFilter`) → execute → normalize response → return. Debug logs namespaced per handler (`rest:GET`, `rest:POST`, etc.).

## Code Style

- Prettier: no semicolons, single quotes, trailing commas, 80 char width, avoid arrow parens
- EditorConfig: 2 spaces, LF, UTF-8, final newline for `.ts` files only
- Comments and documentation in English

## Key Dependencies

- `sistemium-data` — core Model, BaseItem types, aggregation
- `sistemium-debug` — namespaced debug logging (enable with `DEBUG=rest:*`)
- `@koa/router`, `koa-bodyparser`, `qs`, `lodash`

## Environment Variables

- `REST_PORT` — server listen port (if unset, server doesn't bind)
- `MORGAN_FORMAT` — custom HTTP log format (default: `:status :method :url :res[content-length] - :response-time ms`)
