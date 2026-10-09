const fs = require('node:fs/promises')
const path = require('node:path')

// A small standalone generator owns its writes; no default renderer or Handlebars is needed.
module.exports = class StandaloneGenerator {
  constructor(metadata, config) { this.metadata = metadata; this.config = config }
  async GenerateCustomRoutes() {
    const payload = JSON.stringify({ controllers: this.metadata.controllers.map(controller => controller.name) })
    const framework = this.config.middleware || 'express'
    const handlers = {
      express: `import type { Router } from 'express'; export function RegisterRoutes(server: Router) { server.get('/custom-generation', (_request, response) => response.json(${payload})) }`,
      koa: `import type Router from '@koa/router'; export function RegisterRoutes(server: Router) { server.get('/custom-generation', context => { context.body = ${payload} }) }`,
      hapi: `import type { Server } from '@hapi/hapi'; export function RegisterRoutes(server: Server) { server.route({ method: 'GET', path: '/custom-generation', handler: () => (${payload}) }) }`,
    }
    if (!handlers[framework]) { throw new Error(`Unsupported standalone demo framework: ${framework}`) }
    await fs.writeFile(path.join(this.config.routesDir, 'routes.ts'), handlers[framework])
  }
}
