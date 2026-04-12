import type { Context, Middleware, Next } from 'koa'
import { Get, Middlewares as GenericMiddlewares, Route, Tags } from 'tsoa-next'
import { MiddlewareTraceView } from '../../models/middlewareShowcase'
import { MiddlewareShowcaseBase } from '../support/middlewareShowcaseBase'

const middlewareEvents: string[] = []

function recordKoaMiddleware(name: string): Middleware {
  return async (_context: Context, next: Next) => {
    middlewareEvents.push(name)
    await next()
  }
}

function KoaMiddlewares(...middlewares: Middleware[]) {
  return GenericMiddlewares<Middleware>(...middlewares)
}

/**
 * Use case: demonstrate Koa middleware composition attached through `@Middlewares`
 * while reusing shared controller functionality from a base class.
 */
@GenericMiddlewares<Middleware>(recordKoaMiddleware('koa:controller'))
@Route('middleware/koa')
@Tags('middleware')
export class KoaMiddlewareShowcaseController extends MiddlewareShowcaseBase {
  public constructor() {
    super('koa', middlewareEvents)
  }

  /**
   * Runs controller-level and method-level Koa middleware before returning the trace.
   */
  @KoaMiddlewares(recordKoaMiddleware('koa:method:first'), recordKoaMiddleware('koa:method:second'))
  @Get('trace')
  public getTrace(): MiddlewareTraceView {
    return this.buildTrace()
  }
}

