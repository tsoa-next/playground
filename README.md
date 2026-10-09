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
- `SpecPath` examples for generated spec serving, built-in docs UIs, custom response handlers, and request-aware route gating.
- Root and per-method authentication, OR/AND credentials and scope checks.
- Request-scoped dependency injection without a DI framework.
- Body-property and native-request bindings, typed response callbacks, headers and media types.
- PUT, PATCH, DELETE, HEAD and OPTIONS, hidden/deprecated operations and extensions.
- Single and multiple multipart uploads on Express, Koa and Hapi.
- CLI discovery, change-aware generation/checks, template checking and programmatic metadata reuse.
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
- This playground currently stays on `joi@17.13.3` so the installed validator matches the published `tsoa-next` peer range.

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

Each server mounts all shared controllers plus its own framework-specific middleware controller. The existing catalog/order/shipping/validation/middleware/spec examples stay public through `@NoSecurity()`. `/v1/security/root` demonstrates API-wide `spec.rootSecurity`; it requires `x-api-key: playground-key`. These are demo credentials, not application authentication.

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
- `/v1/specPath/customUncachedString`
  Custom string-producing handler that runs for every request.
- `/v1/specPath/customStream`
  Custom uncached stream-producing `SpecPath` handler.
- `/v1/specPath/customCachedStream`
  Custom stream-producing `SpecPath` handler backed by a custom cache.
- `/v1/specPath/gated`
  JSON `SpecPath` target that only resolves when the request includes `x-allow-spec: true`.
- `/v1/specPath/swaggerUi`
  Built-in Swagger UI `SpecPath` target.
- `/v1/specPath/redocUi`
  Built-in Redoc `SpecPath` target.
- `/v1/specPath/rapidocUi`
  Built-in RapiDoc `SpecPath` target.

The showcase controller also declares `/v1/specPath/disabled`, but that route is intentionally excluded from registration through `gate: false`.

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
- the selected built-in middleware template
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
- request-aware spec gating and statically disabled routes
- memory and custom-cache behavior
### 6. Inspect the custom route templates

Custom Handlebars authoring examples are retained here:

- [expressRoutes.hbs](./templates/expressRoutes.hbs)
- [koaRoutes.hbs](./templates/koaRoutes.hbs)
- [hapiRoutes.hbs](./templates/hapiRoutes.hbs)

The main servers use the library's built-in templates, which include authentication, IoC, response callbacks, uploads and spec serving. The retained custom templates are separate authoring examples, exercised by template-check and generation tests. They show the original public API and spec-serving implementation; they are not substitutes for the full built-in template feature set.

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

## Full-feature server examples

The shared controllers run on every server. Explicit `@Head` examples live in the Express and Koa controller directories; Hapi automatically serves HEAD requests for GET routes and does not accept explicit HEAD registration:

- [featureShowcaseController.ts](src/controllers/featureShowcaseController.ts): `/v1/features/greeting` accepts `{ "name": "Ada" }` and reports the request-scoped `x-request-id`. `/body-property` binds only `name`; `/request` compares `@Request` and `@RequestProp` using the own `playgroundRequestId` data property added by each server’s middleware. `/response?conflict=true` uses a typed 409 callback and response header. `/media` consumes `application/vnd.playground+json` and produces `text/plain`. `/verbs` demonstrates PUT/PATCH/DELETE/HEAD/OPTIONS. `/legacy` is deprecated; `/hidden` works at runtime but is omitted from the spec.
- [securityShowcaseController.ts](src/controllers/securityShowcaseController.ts): `/v1/security/root` uses root API-key security; `/public` clears it. `/either` accepts either the API key or a bearer token with `read`; `/both` needs both; `/scoped` needs bearer `write` scope. Demo bearer headers are `authorization: Bearer playground-token` and `x-scopes: read write`. Missing credentials return 401 and missing scopes return 403.
- [uploadShowcaseController.ts](src/controllers/uploadShowcaseController.ts): `/v1/uploads/single` accepts multipart `title` and `asset`; `/many` accepts repeated `assets` fields. Responses include filenames and content so the examples show actual upload parsing. Express/Koa use memory-storage multer; Hapi uses its native multipart handling.
- [authentication.ts](src/lib/authentication.ts) exports each framework's authentication function; [ioc.ts](src/lib/ioc.ts) supplies a new controller/service for each request.

For example, with Express running:

```bash
curl -H 'x-api-key: playground-key' http://127.0.0.1:3101/v1/security/root
curl -H 'authorization: Bearer playground-token' -H 'x-scopes: read write' http://127.0.0.1:3101/v1/security/scoped
curl -H 'content-type: application/json' -H 'x-request-id: demo-123' -d '{"name":"Ada"}' http://127.0.0.1:3101/v1/features/greeting
curl -F title=Notes -F asset=@README.md http://127.0.0.1:3101/v1/uploads/single
```

## Generation and template authoring examples

[examples/generation](examples/generation) contains a small controller and conventional JSON configs for OpenAPI 2, 3 and 3.1. Each selects a different additional-property policy: `ignore` retains extra body fields; `silently-remove-extras` removes them; `throw-on-extras` rejects them. The default templates generate JSON specs and Express routes. Tests also exercise the same policies and versions with Koa/Hapi, plus YAML/YML and JS/CJS configuration loading.

```bash
# Inspect the conventional configs without generating output.
npx tsoa discover examples/generation/configs
# Generate only changed output; generated example files stay under the ignored output directory.
npm run examples:generate
# Check for missing/stale output without writing it.
npm run examples:check
# Parse/render the retained custom Express template and check TypeScript syntax without writing.
npm run examples:template-check
# Generate Express/Koa/Hapi from an object config, reusing returned metadata.
npm run examples:programmatic
# Use a standalone generator that owns its route writes.
npm run examples:standalone
```

`template-check` checks the selected render's TypeScript syntax; it does not type-check the application or cover unrendered branches. Edit `routes.middlewareTemplate` in [custom-template.json](examples/generation/custom-template.json) to check another template. Ordinary custom-template generation remains available with `tsoa spec-and-routes -c examples/generation/custom-template.json`.

[programmatic.ts](examples/generation/programmatic.ts) imports generation from `tsoa-next/cli`, while controllers import runtime decorators from `tsoa-next`. It preserves returned metadata identity when generating the other frameworks. CLI/config tests exercise failures at the selected dependency, then recover through an explicit retry; unused compiler/YAML/renderer integrations are not required by unrelated operations.

`npm test` runs the existing API suite plus [featureShowcaseSpec.ts](tests/featureShowcaseSpec.ts), [generationExamplesSpec.ts](tests/generationExamplesSpec.ts), [docsBrowserSpec.ts](tests/docsBrowserSpec.ts) and [specPathSpec.ts](tests/specPathSpec.ts). Browser tests render Swagger UI/Redoc/RapiDoc and verify the explorer actually fetches its spec. Chromium is needed for browser tests; install it with `npx playwright install chromium` when setting up a fresh machine.

[standaloneGenerator.cjs](examples/generation/standaloneGenerator.cjs) shows a custom generator producing a small `/custom-generation` route for the selected framework. Its config defaults to Express; tests run it on all three. It owns its output writes, so `tsoa generate`/`check` intentionally reject this config; use `spec-and-routes` or `routes` instead.
