import express, { Express, NextFunction, Request, Response } from 'express'
import { toErrorPayload } from '../../lib/httpError'
import { resolveServerPort } from '../../lib/serverPort'
import { registerExpressSpecExplorer } from '../../lib/specExplorer'
import { RegisterRoutes } from '../../server/express/routes/controllerGen'

export function createExpressApp(): Express {
  const app = express()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.get('/health', (_request, response) => {
    response.json({ framework: 'express', status: 'ok' })
  })

  registerExpressSpecExplorer(app, 'express')

  RegisterRoutes(app)

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const payload = toErrorPayload(error)
    response.status(payload.status).json(payload)
  })

  return app
}

export function startExpressServer(port = resolveServerPort(3101)) {
  const app = createExpressApp()
  return app.listen(port, '127.0.0.1', () => {
    console.log(`Express server listening on http://127.0.0.1:${port}`)
  })
}

if (require.main === module) {
  startExpressServer()
}
