import { Server } from '@hapi/hapi'
import { resolveServerPort } from '../../lib/serverPort'
import { registerHapiSpecExplorer } from '../../lib/specExplorer'
import { RegisterRoutes } from '../../server/hapi/routes/controllerGen'

export async function createHapiServer(port = resolveServerPort(3103)): Promise<Server> {
  const server = new Server({
    host: '127.0.0.1',
    port,
  })

  server.route({
    handler: () => ({ framework: 'hapi', status: 'ok' }),
    method: 'GET',
    path: '/health',
  })

  registerHapiSpecExplorer(server, 'hapi')

  RegisterRoutes(server)

  return server
}

export async function startHapiServer(port = resolveServerPort(3103)): Promise<Server> {
  const server = await createHapiServer(port)
  await server.start()
  console.log(`Hapi server listening on http://127.0.0.1:${port}`)
  return server
}

if (require.main === module) {
  void startHapiServer().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
