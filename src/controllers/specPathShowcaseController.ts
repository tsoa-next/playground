import { Readable } from 'node:stream'
import {
  Controller,
  Get,
  Post,
  Route,
  SpecCacheHandler,
  SpecPath,
  SpecRequestContext,
  Tags,
} from 'tsoa-next'
import { SpecPathShowcaseStateView, SpecPathShowcaseStatusView } from '../models/specPathShowcase'

const specPathState: SpecPathShowcaseStateView = {
  customCacheGets: 0,
  customCacheSets: 0,
  customStreamCalls: 0,
  customStringCalls: 0,
}

const cachedStreamPayloads = new Map<string, string>()

function resetSpecPathState(): void {
  specPathState.customCacheGets = 0
  specPathState.customCacheSets = 0
  specPathState.customStreamCalls = 0
  specPathState.customStringCalls = 0
  cachedStreamPayloads.clear()
}

function allowSpecPathWhenHeaderPresent(context: SpecRequestContext): boolean {
  const headers = (context.request as { headers?: Record<string, string | string[] | undefined> } | undefined)?.headers
  return headers?.['x-allow-spec'] === 'true'
}

async function customStringHandler(context: SpecRequestContext): Promise<string> {
  specPathState.customStringCalls += 1
  const spec = await context.getSpecObject()
  return `custom:${spec.info.title}`
}

async function customStreamHandler(): Promise<Readable> {
  specPathState.customStreamCalls += 1
  return Readable.from([Buffer.from('streamed custom spec')], { objectMode: false })
}

const streamCacheHandler: SpecCacheHandler = {
  get(context) {
    specPathState.customCacheGets += 1
    const cached = cachedStreamPayloads.get(context.cacheKey)
    return cached ? Readable.from([Buffer.from(cached)], { objectMode: false }) : undefined
  },
  set(context, value) {
    specPathState.customCacheSets += 1
    cachedStreamPayloads.set(context.cacheKey, value)
  },
}

/**
 * Use case: demonstrate the `@SpecPath(...)` decorator family, including built-in
 * JSON/YAML/UI targets and custom handler caching behavior, so consumers can see
 * how tsoa-next can publish generated specs directly from a controller definition.
 */
@Route('specPath')
@Tags('spec')
@SpecPath()
@SpecPath('yaml', { target: 'yaml' })
@SpecPath('customString', { target: customStringHandler, cache: 'memory' })
@SpecPath('customStream', { target: customStreamHandler, cache: 'none' })
@SpecPath('customCachedStream', { target: customStreamHandler, cache: streamCacheHandler })
@SpecPath('swaggerUi', { target: 'swagger' })
@SpecPath('redocUi', { target: 'redoc' })
@SpecPath('rapidocUi', { target: 'rapidoc' })
@SpecPath('gated', { gate: allowSpecPathWhenHeaderPresent })
@SpecPath('disabled', { gate: false })
export class SpecPathShowcaseController extends Controller {
  /**
   * Summarizes the available SpecPath targets and the current custom-handler state.
   */
  @Get()
  public getSpecPathStatus(): SpecPathShowcaseStatusView {
    return {
      availableDocsTargets: ['swaggerUi', 'redocUi', 'rapidocUi'],
      availableSpecTargets: ['spec', 'yaml', 'customString', 'customStream', 'customCachedStream'],
      conditionalSpecTargets: ['gated'],
      disabledSpecTargets: ['disabled'],
      state: { ...specPathState },
    }
  }

  /**
   * Returns the current custom SpecPath handler/cache counters.
   */
  @Get('state')
  public getSpecPathState(): SpecPathShowcaseStateView {
    return { ...specPathState }
  }

  /**
   * Resets the custom SpecPath handler/cache counters so repeatability is easy in tests.
   */
  @Post('state/reset')
  public resetState(): SpecPathShowcaseStateView {
    resetSpecPathState()
    return { ...specPathState }
  }
}
