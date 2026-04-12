import Router from '@koa/router'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { toErrorPayload } from '../../lib/httpError'
import { resolveServerPort } from '../../lib/serverPort'
import { registerKoaSpecExplorer } from '../../lib/specExplorer'
import { RegisterRoutes } from '../../server/koa/routes/controllerGen'

export function createKoaApp(): Koa {
  const app = new Koa()
  const router = new Router()

  app.use(async (context, next) => {
    try {
      await next()
    } catch (error) {
      const payload = toErrorPayload(error)
      context.status = payload.status
      context.body = payload
    }
  })

  app.use(bodyParser())

  router.get('/health', context => {
    context.body = { framework: 'koa', status: 'ok' }
  })

  registerKoaSpecExplorer(router, 'koa')

  RegisterRoutes(router)

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}

export function startKoaServer(port = resolveServerPort(3102)) {
  const app = createKoaApp()
  return app.listen(port, '127.0.0.1', () => {
    console.log(`Koa server listening on http://127.0.0.1:${port}`)
  })
}

if (require.main === module) {
  startKoaServer()
}
