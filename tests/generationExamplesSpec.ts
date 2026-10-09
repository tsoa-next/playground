import { expect, test } from '@playwright/test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import ts from 'typescript'
import express from 'express'
import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { Server } from '@hapi/hapi'
import { generateExample } from '../examples/generation/programmatic'

const root = resolve(__dirname, '..')
const cli = join(dirname(require.resolve('@tsoa-next/cli/package.json')), 'dist/cli.js')
function run(args: string[], cwd = root) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8', timeout: 40_000 })
}
type RegisterGeneratedRoutes = ((server: express.Express) => void) & ((server: Router) => void) & ((server: Server) => void)
function compileGeneratedRoutes(sourcePath: string, directory: string): RegisterGeneratedRoutes {
  const parsed = ts.readConfigFile(join(root, 'tsconfig.json'), ts.sys.readFile)
  expect(parsed.error).toBeUndefined()
  const settings = ts.parseJsonConfigFileContent(parsed.config, ts.sys, root)
  const outputDirectory = join(directory, 'compiled')
  const program = ts.createProgram([sourcePath], { ...settings.options, rootDir: root, outDir: outputDirectory, noEmit: false })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  expect(diagnostics.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))).toEqual([])
  expect(program.emit().emitSkipped).toBe(false)
  const emittedPath = join(outputDirectory, relative(root, sourcePath).replace(/\.ts$/, '.js'))
  return require(emittedPath).RegisterRoutes
}
async function startGeneratedRoutes(framework: string, RegisterRoutes: RegisterGeneratedRoutes) {
  let baseURL: string
  let stop: () => Promise<void>
  if (framework === 'hapi') {
    const server = new Server({ host: '127.0.0.1', port: 0 })
    RegisterRoutes(server)
    await server.start()
    baseURL = server.info.uri
    stop = () => server.stop()
  } else {
    const app = framework === 'express' ? express() : new Koa()
    if (app instanceof Koa) {
      const router = new Router()
      app.use(async (context, next) => { try { await next() } catch { context.status = 400 } })
      app.use(bodyParser())
      RegisterRoutes(router)
      app.use(router.routes())
    } else {
      app.use(express.json())
      RegisterRoutes(app)
      app.use((_error: unknown, _req: express.Request, response: express.Response, _next: express.NextFunction) => { response.status(400).json({ message: 'invalid' }) })
    }
    const server = app.listen(0, '127.0.0.1')
    await new Promise<void>(resolve => server.once('listening', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') { throw new Error('Expected an ephemeral TCP listener') }
    baseURL = `http://127.0.0.1:${address.port}`
    stop = () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
  return { baseURL, stop }
}

function config(directory: string, framework: string, version: number = 3.1) {
  return {
    entryFile: join(root, 'examples/generation/generationController.ts'), tsconfig: join(root, 'tsconfig.json'),
    spec: { outputDirectory: directory, specVersion: version }, routes: { routesDir: directory, middleware: framework },
  }
}

test('runs installed help/version and generates JSON specs using JSON YAML and CJS configs for every OpenAPI version', ({}, testInfo) => {
  test.setTimeout(90_000)
  const directory = mkdtempSync(join(tmpdir(), 'playground-configs-'))
  try {
    expect(run(['--version']).stdout.trim()).toBe(require('tsoa-next/package.json').version)
    expect(run(['--help']).stdout).toContain('template-check')
    expect(run(['unsupported-command']).status).not.toBe(0)
    expect(run(['spec', '--unsupported-option']).status).not.toBe(0)
    expect(require('@tsoa-next/cli/package.json').version).toBe(require('tsoa-next/package.json').version)
    expect(require('@tsoa-next/runtime/package.json').version).toBe(require('tsoa-next/package.json').version)
    for (const [version, extension] of [[2, 'json'], [3, 'yaml'], [3.1, 'config.cjs'], [3.1, 'yml'], [3.1, 'config.js']] as const) {
      const output = join(directory, String(version))
      const file = join(directory, `tsoa.${extension}`)
      const value = config(output, testInfo.project.name, version)
      writeFileSync(file, extension.startsWith('config.') ? `module.exports = ${JSON.stringify(value)}` : JSON.stringify(value))
      const generated = run(['spec-and-routes', '-c', file])
      expect(generated.status, generated.stderr).toBe(0)
      const spec = JSON.parse(readFileSync(join(output, 'swagger.json'), 'utf8'))
      const expectedVersion = version === 3 ? '3.0.0' : '3.1.0'
      expect(version === 2 ? spec.swagger : spec.openapi).toBe(version === 2 ? '2.0' : expectedVersion)
      expect(spec.paths['/generation-example'].post).toBeTruthy()
      expect(readFileSync(join(output, 'routes.ts'), 'utf8')).toContain('RegisterRoutes')
    }
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('discovers configs and checks stale output without writing, then generates only changed output', ({}, testInfo) => {
  test.setTimeout(90_000)
  const directory = mkdtempSync(join(tmpdir(), 'playground-output-policy-'))
  try {
    writeFileSync(join(directory, 'tsoa.json'), JSON.stringify(config(join(directory, 'output'), testInfo.project.name)))
    expect(run(['discover', directory]).stdout).toContain('tsoa.json')
    const missing = run(['check', directory])
    expect(missing.status).not.toBe(0)
    expect(missing.stderr + missing.stdout).toContain('tsoa generate')
    expect(run(['generate', directory]).status).toBe(0)
    const routes = join(directory, 'output/routes.ts')
    const time = statSync(routes).mtimeMs
    expect(run(['check', directory]).status).toBe(0)
    expect(statSync(routes).mtimeMs).toBe(time)
    expect(run(['generate', directory]).status).toBe(0)
    expect(statSync(routes).mtimeMs).toBe(time)
    writeFileSync(routes, '// stale output\n')
    const stale = readFileSync(routes, 'utf8')
    expect(run(['check', directory]).status).not.toBe(0)
    expect(readFileSync(routes, 'utf8')).toBe(stale)
    expect(run(['generate', directory]).status).toBe(0)
    expect(readFileSync(routes, 'utf8')).toContain('RegisterRoutes')
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('checks the selected custom template without writes and reports real parse failures before source analysis', ({}, testInfo) => {
  test.setTimeout(90_000)
  const directory = mkdtempSync(join(tmpdir(), 'playground-template-'))
  try {
    const file = join(directory, 'tsoa.json')
    const value = { ...config(join(directory, 'output'), testInfo.project.name), routes: { routesDir: join(directory, 'output'), middleware: testInfo.project.name, middlewareTemplate: join(root, `templates/${testInfo.project.name}Routes.hbs`) } }
    writeFileSync(file, JSON.stringify(value))
    const checked = run(['template-check', '-c', file])
    expect(checked.status, checked.stderr).toBe(0)
    expect(() => statSync(join(directory, 'output'))).toThrow()
    const template = join(directory, 'broken.hbs')
    writeFileSync(template, '{{#if broken}}')
    writeFileSync(file, JSON.stringify({ ...value, entryFile: join(directory, 'unused-missing.ts'), routes: { ...value.routes, middlewareTemplate: template } }))
    const failed = run(['template-check', '-c', file])
    expect(failed.status).not.toBe(0)
    expect(failed.stderr + failed.stdout).toContain('broken.hbs')
    expect(failed.stderr + failed.stdout).not.toContain('EntryFile not found')
    writeFileSync(file, JSON.stringify(value))
    expect(run(['template-check', '-c', file]).status).toBe(0)
    const generated = run(['spec-and-routes', '-c', file])
    expect(generated.status, generated.stderr).toBe(0)
    expect(readFileSync(join(directory, 'output/routes.ts'), 'utf8')).toContain('RegisterRoutes')
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('runs the object-config programmatic example and reuses supplied metadata', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'playground-programmatic-'))
  try {
    const metadata = await generateExample(directory)
    expect(metadata.controllers.map(controller => controller.name)).toEqual(['GenerationController'])
    for (const framework of ['express', 'koa', 'hapi']) {
      expect(JSON.parse(readFileSync(join(directory, framework, 'swagger.json'), 'utf8')).openapi).toBe('3.1.0')
      expect(readFileSync(join(directory, framework, 'routes.ts'), 'utf8')).toContain('RegisterRoutes')
    }
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('loads only selected dependencies, reports genuine failures and permits explicit recovery', () => {
  const directory = mkdtempSync(join(tmpdir(), 'playground-dependencies-'))
  try {
    const script = `
      const assert = require('node:assert/strict'), Module = require('node:module'), path = require('node:path'), fs = require('node:fs');
      const base = path.dirname(require.resolve('@tsoa-next/cli/package.json'));
      const original = Module.prototype.require;
      let block = id => id === 'typescript' || id === 'yaml' || id === 'handlebars' || id.includes('metadataGeneration/metadataGenerator');
      Module.prototype.require = function(id) { if (block(id)) throw new Error('Selected dependency unavailable: ' + id); return original.call(this, id) };
      const runtime = require('tsoa-next'); assert.equal(typeof runtime.Route, 'function');
      const api = require(path.join(base, 'dist/api.js')); assert.deepEqual(api.validateCompilerOptions(), {});
      const spec = require(path.join(base, 'dist/module/generate-spec.js'));
      const metadata = { controllers: [], referenceTypeMap: {} };
      block = id => id === 'typescript' || id === 'yaml' || id.includes('metadataGeneration/metadataGenerator');
      for (const version of [2, 3, 3.1]) {
        const config = { entryFile: 'unused-missing.ts', outputDirectory: '.', specVersion: version, noImplicitAdditionalProperties: 'ignore' };
        const value = spec.buildSpec(config, undefined, undefined, metadata);
        assert.equal(version === 2 ? value.swagger : value.openapi, version === 2 ? '2.0' : version === 3 ? '3.0.0' : '3.1.0');
      }
      assert.throws(() => spec.buildSpec({ entryFile: 'required.ts' }), /metadataGenerator/);
      assert.equal(spec.serializeSpec({ swagger: '2.0', info: { title: 'demo' }, paths: {} }).includes('demo'), true);
      assert.throws(() => spec.serializeSpec({ swagger: '2.0', info: { title: 'demo' }, paths: {} }, true), /yaml/);
      assert.throws(() => api.validateCompilerOptions({ strict: true }), /typescript/);
      const routes = require(path.join(base, 'dist/module/generate-routes.js'));
      (async () => {
        block = id => id === 'yaml' || id.endsWith('/defaultRouteGenerator');
        class Custom { constructor(metadata, config) { assert.equal(metadata, supplied); assert.equal(config, routeConfig) } async GenerateCustomRoutes() {} }
        const supplied = metadata, routeConfig = { entryFile: 'unused.ts', routesDir: ${JSON.stringify(directory)}, bodyCoercion: true, noImplicitAdditionalProperties: 'ignore', routeGenerator: Custom };
        assert.equal(await routes.generateRoutes(routeConfig, undefined, undefined, metadata), metadata);
        const builtin = { ...routeConfig, routeGenerator: undefined };
        await assert.rejects(routes.generateRoutes(builtin, undefined, undefined, metadata), /defaultRouteGenerator/);
        block = () => false;
        assert.equal(api.validateCompilerOptions({ strict: true }).strict, true);
        assert.equal(spec.serializeSpec({ swagger: '2.0', info: { title: 'demo' }, paths: {} }, true).includes('demo'), true);
        assert.equal(await routes.generateRoutes(builtin, undefined, undefined, metadata), metadata);
        const required = await spec.generateSpec({ entryFile: ${JSON.stringify(join(root, 'examples/generation/generationController.ts'))}, outputDirectory: ${JSON.stringify(directory)}, specVersion: 3.1, noImplicitAdditionalProperties: 'ignore' }, { experimentalDecorators: true });
        assert.equal(required.controllers[0].name, 'GenerationController');
      })().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => { Module.prototype.require = original });
    `
    const result = spawnSync(process.execPath, ['-e', script], { cwd: root, encoding: 'utf8', timeout: 40_000 })
    expect(result.status, result.stderr).toBe(0)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})


test('selects only required output integrations and recovers after their real failure', ({}, testInfo) => {
  test.setTimeout(90_000)
  const directory = mkdtempSync(join(tmpdir(), 'playground-selected-output-'))
  try {
    const file = join(directory, 'tsoa.json')
    const value = config(directory, testInfo.project.name)
    writeFileSync(file, JSON.stringify({ ...value, routes: { ...value.routes, middlewareTemplate: join(directory, 'missing.hbs') } }))
    expect(run(['spec', '-c', file]).status).toBe(0)
    const failed = run(['routes', '-c', file])
    expect(failed.status).not.toBe(0)
    expect(failed.stderr + failed.stdout).toContain('missing.hbs')
    writeFileSync(file, JSON.stringify({ ...value, spec: { ...value.spec, specVersion: 99 } }))
    expect(run(['routes', '-c', file]).status).toBe(0)
    expect(run(['spec-and-routes', '-c', file]).status).not.toBe(0)
    writeFileSync(file, JSON.stringify(value))
    expect(run(['spec-and-routes', '-c', file]).status).toBe(0)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('executes ignore/remove/reject additional-property policies through generated routes', async ({ request }, testInfo) => {
  test.setTimeout(90_000)
  // Generated route imports resolve through the installed packages above this disposable directory.
  const directory = mkdtempSync(join(root, '.playground-policies-'))
  try {
    async function assertPolicy(policy: 'ignore' | 'silently-remove-extras' | 'throw-on-extras') {
      const output = join(directory, policy)
      const file = join(directory, 'tsoa.json')
      writeFileSync(file, JSON.stringify({ ...config(output, testInfo.project.name), noImplicitAdditionalProperties: policy }))
      const generated = run(['spec-and-routes', '-c', file])
      expect(generated.status, generated.stderr).toBe(0)
      const RegisterRoutes = compileGeneratedRoutes(join(output, 'routes.ts'), directory)
      const { baseURL, stop } = await startGeneratedRoutes(testInfo.project.name, RegisterRoutes)
      try {
        const response = await request.post(`${baseURL}/generation-example`, { data: { label: 'sample', extra: 'retained only by ignore' } })
        expect(response.status()).toBe(policy === 'throw-on-extras' ? 400 : 200)
        if (policy !== 'throw-on-extras') {
          expect(await response.json()).toEqual(policy === 'ignore' ? { label: 'sample', extra: 'retained only by ignore' } : { label: 'sample' })
        }
      } finally { await stop() }
    }
    await assertPolicy('ignore')
    await assertPolicy('silently-remove-extras')
    await assertPolicy('throw-on-extras')
  } finally { rmSync(directory, { recursive: true, force: true }) }
})


test('runs the standalone custom generator with its own writes and live routes', async ({ request }, testInfo) => {
  const directory = mkdtempSync(join(root, '.playground-standalone-'))
  try {
    const file = join(directory, 'tsoa.json')
    const value = config(directory, testInfo.project.name)
    writeFileSync(file, JSON.stringify({ ...value, routes: { ...value.routes, routeGenerator: join(root, 'examples/generation/standaloneGenerator.cjs') } }))
    const generated = run(['spec-and-routes', '-c', file])
    expect(generated.status, generated.stderr).toBe(0)
    // Change-aware commands reject custom writes rather than pretending to control them.
    const checked = run(['check', directory])
    expect(checked.status).not.toBe(0)
    expect(checked.stderr + checked.stdout).toContain('custom generators control their own file writes')
    const RegisterRoutes = compileGeneratedRoutes(join(directory, 'routes.ts'), directory)
    const { baseURL, stop } = await startGeneratedRoutes(testInfo.project.name, RegisterRoutes)
    try {
      const response = await request.get(`${baseURL}/custom-generation`)
      expect(response.status()).toBe(200)
      expect(await response.json()).toEqual({ controllers: ['GenerationController'] })
    } finally { await stop() }
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
