# 🚀 `tsoa-next` Playground

A multi-framework TypeScript playground for exploring how `tsoa-next` can be used with:

- ✨ Express
- ✨ Koa
- ✨ Hapi
- ✨ generated OpenAPI specs
- ✨ served OpenAPI specs and docs UIs
- ✨ generated framework routes
- ✨ framework-specific middleware decorators
- ✨ external validation adapters
- ✨ Playwright API verification

This repo is intentionally built as a broad exploration surface rather than a minimal demo. It is meant to be a practical "smorgasbord" of patterns you can inspect, run, and adapt.

## 🧭 What This Repo Shows

- Shared controllers that work across all supported server targets.
- Framework-specific middleware controllers that reuse a common base class while binding framework-native middleware types.
- External validation examples for all supported adapters in this playground:
  - `zod`
  - `joi`
  - `yup`
  - `superstruct`
  - `io-ts`
- `SpecPath` examples for generated spec serving, built-in docs UIs, and custom response handlers.
- `tsoa` CLI generation through three root configs:
  - [tsoa.express.yaml](./tsoa.express.yaml)
  - [tsoa.koa.yaml](./tsoa.koa.yaml)
  - [tsoa.hapi.yaml](./tsoa.hapi.yaml)
- Generated route files for each middleware target.
- Generated OpenAPI specs for each middleware target.
- Server-mounted spec explorer endpoints for raw spec delivery and Swagger UI.
- Playwright tests that exercise the shared API surface on all three frameworks and each framework-specific middleware showcase on its matching server.

## 📦 Requirements

- Node.js `>= 22`
- npm `>= 10`

## ⚠️ Dependency Notes

- `fp-ts` is installed directly in this repo because the `io-ts` validation showcase needs it at runtime and relying on transitive installation is fragile.
- This playground intentionally stays on `joi@18`, even though current `tsoa-next` runtime releases still advertise a peer range of `joi@^17.13.3`.
- In practice, the `joi` examples in this repo currently verify cleanly against the published `8.0.5` release, `tsoa-next` `main`, and `8.0.5-dev.57.84bb4a63`, but npm may still report the peer-range mismatch during clean installs depending on how you install overrides or prerelease builds.

## ⚡ Quick Start

```bash
npm install
npm run generate
npm test
```

To run one server at a time:

```bash
npm run serve:express
npm run serve:koa
npm run serve:hapi
```

## 🌐 Server Guide

Run exactly one of these when you want to explore a single framework locally:

- `npm run serve:express`
  Base URL: `http://127.0.0.1:3101`
- `npm run serve:koa`
  Base URL: `http://127.0.0.1:3102`
- `npm run serve:hapi`
  Base URL: `http://127.0.0.1:3103`

Each server mounts all shared controllers plus its own framework-specific middleware controller.

### Shared spec and docs endpoints on every server

Once a server is running, these endpoints work on all three frameworks:

- `/docs`
  Visual docs landing page for that server target.
- `/docs/swagger`
  Swagger UI mounted by the shared spec explorer layer.
- `/spec/openapi.yaml`
  The generated OpenAPI YAML for that framework.
- `/spec/openapi.json`
  The generated OpenAPI JSON for that framework.
- `/v1/specPath`
  Summary endpoint for the controller-local `@SpecPath(...)` showcase.
- `/v1/specPath/spec`
  Built-in JSON `SpecPath` target.
- `/v1/specPath/yaml`
  Built-in YAML `SpecPath` target.
- `/v1/specPath/customString`
  Custom string-producing `SpecPath` handler with in-memory caching.
- `/v1/specPath/customStream`
  Custom uncached stream-producing `SpecPath` handler.
- `/v1/specPath/customCachedStream`
  Custom stream-producing `SpecPath` handler backed by a custom cache.
- `/v1/specPath/swaggerUi`
  Built-in Swagger UI `SpecPath` target.
- `/v1/specPath/redocUi`
  Built-in Redoc `SpecPath` target.
- `/v1/specPath/rapidocUi`
  Built-in RapiDoc `SpecPath` target.

### Framework-specific middleware endpoints

These only work on the matching server because the middleware decorators and runtime types differ by framework:

- Express only: `http://127.0.0.1:3101/v1/middleware/express/trace`
- Koa only: `http://127.0.0.1:3102/v1/middleware/koa/trace`
- Hapi only: `http://127.0.0.1:3103/v1/middleware/hapi/trace`

### Generated spec files by server

The raw `/spec/openapi.*` endpoints map to different generated files depending on which server you start:

- Express serves `src/specs/expressApi.yaml`
- Koa serves `src/specs/koaApi.yaml`
- Hapi serves `src/specs/hapiApi.yaml`

## 🛠️ Useful Scripts

- `npm run generate`
  Generates specs and routes for all three server targets.
- `npm run generate:express`
  Runs `tsoa spec-and-routes -c tsoa.express.yaml`.
- `npm run generate:koa`
  Runs `tsoa spec-and-routes -c tsoa.koa.yaml`.
- `npm run generate:hapi`
  Runs `tsoa spec-and-routes -c tsoa.hapi.yaml`.
- `npm run typecheck`
  Runs TypeScript validation across the repo.
- `npm test`
  Regenerates artifacts and runs the Playwright API suite.
- `npm run build`
  Regenerates artifacts and compiles the repo.

## 🔎 How To Explore The Repo

### 1. Start with the root `tsoa` configs

These three files define the generation targets and are the entrypoint for understanding how middleware-specific generation differs:

- [tsoa.express.yaml](./tsoa.express.yaml)
- [tsoa.koa.yaml](./tsoa.koa.yaml)
- [tsoa.hapi.yaml](./tsoa.hapi.yaml)

Each one controls:

- the middleware type
- the route output directory
- the custom route template
- the generated spec output file
- the controller discovery globs

The servers then mount a shared spec explorer layer that exposes:

- `/spec/openapi.yaml`
- `/spec/openapi.json`
- `/docs`
- `/docs/swagger`

### 2. Look at the shared controllers

These are generated into all three server variants:

- [catalogLookupController.ts](./src/controllers/catalogLookupController.ts)
- [shippingQuoteController.ts](./src/controllers/shippingQuoteController.ts)
- [orderDraftController.ts](./src/controllers/orderDraftController.ts)
- [externalValidationShowcaseController.ts](./src/controllers/externalValidationShowcaseController.ts)
- [specPathShowcaseController.ts](./src/controllers/specPathShowcaseController.ts)

They demonstrate:

- `@Route`, `@Get`, `@Post`
- path, query, and header binding
- body validation and response typing
- use-case-oriented controller documentation
- external schema validation with `@Validate(...)`
- generated spec publishing with `@SpecPath(...)`

### 3. Inspect the framework-specific middleware controllers

These are intentionally separate because middleware signatures differ by framework:

- [Express middleware showcase](./src/controllers/express/expressMiddlewareShowcaseController.ts)
- [Koa middleware showcase](./src/controllers/koa/koaMiddlewareShowcaseController.ts)
- [Hapi middleware showcase](./src/controllers/hapi/hapiMiddlewareShowcaseController.ts)

They all inherit shared behavior from:

- [middlewareShowcaseBase.ts](./src/controllers/support/middlewareShowcaseBase.ts)

This lets the repo show a useful inheritance pattern:

- one shared base for business behavior
- one derived controller per framework for middleware decoration

### 4. Review the validation models

External validation schemas and payload types live in:

- [validationShowcase.ts](./src/models/validationShowcase.ts)

That file is the central place to compare the shape and ergonomics of each supported external validator.

### 5. Inspect the `SpecPath` showcase

The controller-level `SpecPath` examples live in:

- [specPathShowcaseController.ts](./src/controllers/specPathShowcaseController.ts)

They demonstrate:

- built-in JSON and YAML spec publishing
- built-in Swagger UI, Redoc, and RapiDoc targets
- custom string and stream handlers
- memory and custom-cache behavior
### 6. Inspect the custom route templates

The generated route files are produced through custom Handlebars templates instead of the stock defaults:

- [expressRoutes.hbs](./templates/expressRoutes.hbs)
- [koaRoutes.hbs](./templates/koaRoutes.hbs)
- [hapiRoutes.hbs](./templates/hapiRoutes.hbs)

These templates exist so the generated output stays aligned with this repo’s conventions and constraints.

### 7. Inspect generated output

Generated specs:

- [expressApi.yaml](./src/specs/expressApi.yaml)
- [koaApi.yaml](./src/specs/koaApi.yaml)
- [hapiApi.yaml](./src/specs/hapiApi.yaml)

Generated routes:

- [Express routes](./src/server/express/routes/controllerGen.ts)
- [Koa routes](./src/server/koa/routes/controllerGen.ts)
- [Hapi routes](./src/server/hapi/routes/controllerGen.ts)

Spec explorer implementation:

- [specExplorer.ts](./src/lib/specExplorer.ts)

### 8. Run the API verification suite

The Playwright test project lives in:

- [playwrightConfig.ts](./playwrightConfig.ts)
- [apiSmokeSpec.ts](./tests/apiSmokeSpec.ts)

It verifies:

- shared controller behavior on Express, Koa, and Hapi
- external validator endpoints across all frameworks
- `SpecPath` JSON/YAML/custom/UI targets across all frameworks
- served OpenAPI YAML and JSON endpoints across all frameworks
- the docs hub and Swagger UI across all frameworks
- middleware showcase endpoints on the matching framework

## 🧩 Repo Layout

```text
src/
  controllers/
    express/
    hapi/
    koa/
    support/
  lib/
  models/
  server/
  servers/
  services/
  specs/
templates/
tests/
```

## 🧪 What To Try

If you want to explore the repo interactively, these are good first stops:

1. Open [externalValidationShowcaseController.ts](./src/controllers/externalValidationShowcaseController.ts) and compare it with [validationShowcase.ts](./src/models/validationShowcase.ts).
2. Open one middleware controller and compare it to [middlewareShowcaseBase.ts](./src/controllers/support/middlewareShowcaseBase.ts).
3. Run `npm run generate` and inspect how [controllerGen.ts](./src/server/express/routes/controllerGen.ts) differs across Express, Koa, and Hapi.
4. Run one server and hit the routes manually.
5. Run `npm test` and use the test suite as an executable map of the playground’s features.

## 🎯 Why This Repo Exists

This repo is not trying to be the smallest possible `tsoa-next` example.

It is trying to be:

- approachable for someone evaluating `tsoa-next`
- broad enough to compare framework integrations
- concrete enough to copy patterns into a real service
- explicit enough to show where generation, controllers, middleware, validation, and tests connect

## 📘 Summary

If you want to understand how `tsoa-next` can power a real Node API surface across multiple frameworks, this repo is meant to give you:

- 🧱 controller examples
- 🧪 validation examples
- 🔌 middleware examples
- 🗺️ generated route examples
- 📄 generated spec examples
- ✅ executable verification
