import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Server } from '@hapi/hapi'
import type Router from '@koa/router'
import type { Express } from 'express'
import { parse } from 'yaml'

export type ServerFramework = 'express' | 'koa' | 'hapi'

type SwaggerUiAssetName = 'swagger-ui-bundle.js' | 'swagger-ui-standalone-preset.js' | 'swagger-ui.css'

interface SpecExplorerConfig {
  docsHomePath: '/docs'
  framework: ServerFramework
  frameworkLabel: string
  specFileName: string
  specJsonPath: '/spec/openapi.json'
  specYamlPath: '/spec/openapi.yaml'
  swaggerUiAssetsBasePath: '/docs/assets/swagger'
  swaggerUiPath: '/docs/swagger'
}

const swaggerUiAssetDirectory = require('swagger-ui-dist').absolutePath()

function createSpecExplorerConfig(framework: ServerFramework): SpecExplorerConfig {
  switch (framework) {
    case 'express':
      return {
        docsHomePath: '/docs',
        framework,
        frameworkLabel: 'Express',
        specFileName: 'expressApi.yaml',
        specJsonPath: '/spec/openapi.json',
        specYamlPath: '/spec/openapi.yaml',
        swaggerUiAssetsBasePath: '/docs/assets/swagger',
        swaggerUiPath: '/docs/swagger',
      }
    case 'koa':
      return {
        docsHomePath: '/docs',
        framework,
        frameworkLabel: 'Koa',
        specFileName: 'koaApi.yaml',
        specJsonPath: '/spec/openapi.json',
        specYamlPath: '/spec/openapi.yaml',
        swaggerUiAssetsBasePath: '/docs/assets/swagger',
        swaggerUiPath: '/docs/swagger',
      }
    case 'hapi':
      return {
        docsHomePath: '/docs',
        framework,
        frameworkLabel: 'Hapi',
        specFileName: 'hapiApi.yaml',
        specJsonPath: '/spec/openapi.json',
        specYamlPath: '/spec/openapi.yaml',
        swaggerUiAssetsBasePath: '/docs/assets/swagger',
        swaggerUiPath: '/docs/swagger',
      }
  }
}

function resolveSpecFilePath(specFileName: string): string {
  return resolve(process.cwd(), 'src/specs', specFileName)
}

function readSpecYaml(specFileName: string): string {
  return readFileSync(resolveSpecFilePath(specFileName), 'utf8')
}

function readSpecJson(specFileName: string): string {
  return JSON.stringify(parse(readSpecYaml(specFileName)), null, 2)
}

function resolveSwaggerUiAssetName(candidate: unknown): SwaggerUiAssetName | undefined {
  switch (candidate) {
    case 'swagger-ui-bundle.js':
      return candidate
    case 'swagger-ui-standalone-preset.js':
      return candidate
    case 'swagger-ui.css':
      return candidate
    default:
      return undefined
  }
}

function getSwaggerUiAssetContentType(assetName: SwaggerUiAssetName): string {
  switch (assetName) {
    case 'swagger-ui.css':
      return 'text/css; charset=utf-8'
    case 'swagger-ui-bundle.js':
      return 'application/javascript; charset=utf-8'
    case 'swagger-ui-standalone-preset.js':
      return 'application/javascript; charset=utf-8'
  }
}

function readSwaggerUiAsset(assetName: SwaggerUiAssetName): Buffer {
  return readFileSync(join(swaggerUiAssetDirectory, assetName))
}

function renderDocsIndexHtml(config: SpecExplorerConfig): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${config.frameworkLabel} Spec Explorer</title>
    <style>
      :root {
        color-scheme: light;
        --paper: #fffaf3;
        --ink: #17202a;
        --muted: #51606f;
        --accent: #d2672a;
        --accent-deep: #0f5c76;
        --card: #ffffff;
        --line: #e6d9ca;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(210, 103, 42, 0.16), transparent 28rem),
          radial-gradient(circle at top right, rgba(15, 92, 118, 0.14), transparent 24rem),
          var(--paper);
      }

      main {
        max-width: 64rem;
        margin: 0 auto;
        padding: 3rem 1.5rem 4rem;
      }

      .eyebrow {
        margin: 0 0 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.78rem;
        color: var(--accent-deep);
      }

      h1 {
        margin: 0;
        font-size: clamp(2.2rem, 6vw, 4rem);
        line-height: 0.95;
      }

      .lede {
        max-width: 44rem;
        margin: 1rem 0 2rem;
        font-size: 1.08rem;
        line-height: 1.7;
        color: var(--muted);
      }

      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
      }

      .card {
        display: block;
        padding: 1.2rem;
        border: 1px solid var(--line);
        border-radius: 1.25rem;
        background: var(--card);
        color: inherit;
        text-decoration: none;
        box-shadow: 0 1rem 2rem rgba(23, 32, 42, 0.06);
      }

      .card strong {
        display: block;
        margin-bottom: 0.45rem;
        font-size: 1.05rem;
      }

      .card span {
        color: var(--muted);
        line-height: 1.5;
      }

      .meta {
        margin-top: 2rem;
        padding: 1rem 1.25rem;
        border-left: 0.35rem solid var(--accent);
        background: rgba(255, 255, 255, 0.75);
        color: var(--muted);
      }

      code {
        font-family: "SFMono-Regular", "Monaco", monospace;
        font-size: 0.95em;
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">${config.frameworkLabel} server docs</p>
      <h1>Generated spec,<br />servable docs UI.</h1>
      <p class="lede">
        This playground publishes the generated OpenAPI description for the ${config.frameworkLabel} server and layers a
        local Swagger UI on top of it. The endpoints below are intentionally simple so they can serve as reference
        implementations while the upstream spec-endpoint feature evolves.
      </p>

      <section class="grid">
        <a class="card" href="${config.specYamlPath}">
          <strong>OpenAPI YAML</strong>
          <span>Download or inspect the generated YAML spec exactly as emitted into <code>src/specs/${config.specFileName}</code>.</span>
        </a>
        <a class="card" href="${config.specJsonPath}">
          <strong>OpenAPI JSON</strong>
          <span>Consume a JSON rendering of the same generated spec for tools that prefer JSON inputs.</span>
        </a>
        <a class="card" href="${config.swaggerUiPath}">
          <strong>Swagger UI</strong>
          <span>Browse and execute the ${config.frameworkLabel} API interactively against this running server.</span>
        </a>
      </section>

      <p class="meta">
        API base path: <code>/v1</code><br />
        Generated spec source: <code>src/specs/${config.specFileName}</code><br />
        Framework-specific middleware route example: <code>/v1/middleware/${config.framework}/trace</code>
      </p>
    </main>
  </body>
</html>
`
}

function renderSwaggerUiHtml(config: SpecExplorerConfig): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${config.frameworkLabel} Swagger UI</title>
    <link rel="stylesheet" href="${config.swaggerUiAssetsBasePath}/swagger-ui.css" />
    <style>
      body {
        margin: 0;
        background: linear-gradient(180deg, #fff8ef 0%, #ffffff 10rem);
      }

      .docsBanner {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid rgba(23, 32, 42, 0.12);
        background: rgba(255, 255, 255, 0.95);
        font-family: "Avenir Next", "Segoe UI", sans-serif;
      }

      .docsBanner strong {
        display: block;
        font-size: 1rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #0f5c76;
      }

      .docsBanner span {
        color: #51606f;
      }
    </style>
  </head>
  <body>
    <div class="docsBanner">
      <strong>${config.frameworkLabel} Swagger UI</strong>
      <span>Backed by <code>${config.specYamlPath}</code> and the generated <code>${config.specFileName}</code>.</span>
    </div>
    <div id="swagger-ui"></div>
    <script src="${config.swaggerUiAssetsBasePath}/swagger-ui-bundle.js"></script>
    <script src="${config.swaggerUiAssetsBasePath}/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        deepLinking: true,
        dom_id: '#swagger-ui',
        layout: 'BaseLayout',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        showExtensions: true,
        showCommonExtensions: true,
        url: '${config.specYamlPath}',
      })
    </script>
  </body>
</html>
`
}

export function registerExpressSpecExplorer(app: Express, framework: ServerFramework): void {
  const config = createSpecExplorerConfig(framework)

  app.get(config.docsHomePath, (_request, response) => {
    response.type('html').send(renderDocsIndexHtml(config))
  })

  app.get(config.specYamlPath, (_request, response) => {
    response.type('application/yaml').send(readSpecYaml(config.specFileName))
  })

  app.get(config.specJsonPath, (_request, response) => {
    response.type('application/json').send(readSpecJson(config.specFileName))
  })

  app.get(`${config.swaggerUiAssetsBasePath}/:assetName`, (request, response) => {
    const assetName = resolveSwaggerUiAssetName(request.params.assetName)

    if (!assetName) {
      response.status(404).send('Not Found')
      return
    }

    response.type(getSwaggerUiAssetContentType(assetName)).send(readSwaggerUiAsset(assetName))
  })

  app.get(config.swaggerUiPath, (_request, response) => {
    response.type('html').send(renderSwaggerUiHtml(config))
  })
}

export function registerKoaSpecExplorer(router: Router, framework: ServerFramework): void {
  const config = createSpecExplorerConfig(framework)

  router.get(config.docsHomePath, context => {
    context.type = 'text/html; charset=utf-8'
    context.body = renderDocsIndexHtml(config)
  })

  router.get(config.specYamlPath, context => {
    context.type = 'application/yaml; charset=utf-8'
    context.body = readSpecYaml(config.specFileName)
  })

  router.get(config.specJsonPath, context => {
    context.type = 'application/json; charset=utf-8'
    context.body = readSpecJson(config.specFileName)
  })

  router.get(`${config.swaggerUiAssetsBasePath}/:assetName`, context => {
    const assetName = resolveSwaggerUiAssetName(context.params.assetName)

    if (!assetName) {
      context.status = 404
      context.body = 'Not Found'
      return
    }

    context.type = getSwaggerUiAssetContentType(assetName)
    context.body = readSwaggerUiAsset(assetName)
  })

  router.get(config.swaggerUiPath, context => {
    context.type = 'text/html; charset=utf-8'
    context.body = renderSwaggerUiHtml(config)
  })
}

export function registerHapiSpecExplorer(server: Server, framework: ServerFramework): void {
  const config = createSpecExplorerConfig(framework)

  server.route({
    handler: (_request, h) => h.response(renderDocsIndexHtml(config)).type('text/html; charset=utf-8'),
    method: 'GET',
    path: config.docsHomePath,
  })

  server.route({
    handler: (_request, h) => h.response(readSpecYaml(config.specFileName)).type('application/yaml; charset=utf-8'),
    method: 'GET',
    path: config.specYamlPath,
  })

  server.route({
    handler: (_request, h) => h.response(readSpecJson(config.specFileName)).type('application/json; charset=utf-8'),
    method: 'GET',
    path: config.specJsonPath,
  })

  server.route({
    handler: (request, h) => {
      const assetName = resolveSwaggerUiAssetName(request.params['assetName'])

      if (!assetName) {
        return h.response('Not Found').code(404)
      }

      return h.response(readSwaggerUiAsset(assetName)).type(getSwaggerUiAssetContentType(assetName))
    },
    method: 'GET',
    path: `${config.swaggerUiAssetsBasePath}/{assetName}`,
  })

  server.route({
    handler: (_request, h) => h.response(renderSwaggerUiHtml(config)).type('text/html; charset=utf-8'),
    method: 'GET',
    path: config.swaggerUiPath,
  })
}
