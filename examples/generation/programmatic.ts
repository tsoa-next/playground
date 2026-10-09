import { resolve } from 'node:path'
import { generateSpecAndRoutes } from 'tsoa-next/cli'
import type { Config } from 'tsoa-next'

/** Generate once, then reuse returned metadata for the other selected frameworks. */
export async function generateExample(output = resolve('examples/generation/output/programmatic')) {
  const config: Config = {
    entryFile: resolve('examples/generation/generationController.ts'),
    tsconfig: resolve('tsconfig.json'),
    spec: { outputDirectory: resolve(output, 'express'), specVersion: 3.1 },
    routes: { routesDir: resolve(output, 'express'), middleware: 'express' },
  }
  const metadata = await generateSpecAndRoutes({ configuration: config })
  for (const framework of ['koa', 'hapi'] as const) {
    const reused = await generateSpecAndRoutes({ configuration: {
      ...config,
      spec: { ...config.spec, outputDirectory: resolve(output, framework) },
      routes: { routesDir: resolve(output, framework), middleware: framework },
    } }, metadata)
    if (reused !== metadata) { throw new Error('Expected supplied metadata identity to be preserved') }
  }
  return metadata
}
if (require.main === module) { generateExample(process.argv[2]).catch(error => { console.error(error); process.exitCode = 1 }) }
