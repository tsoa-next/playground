import type { Request, ResponseToolkit, RouteOptionsPreAllOptions } from '@hapi/hapi'
import { Get, Middlewares as GenericMiddlewares, Route, Tags } from 'tsoa-next'
import { MiddlewareTraceView } from '../../models/middlewareShowcase'
import { MiddlewareShowcaseBase } from '../support/middlewareShowcaseBase'

const middlewareEvents: string[] = []

function recordHapiMiddleware(name: string): RouteOptionsPreAllOptions {
  return async (_request: Request, _h: ResponseToolkit) => {
    middlewareEvents.push(name)
    return name
  }
}

function HapiMiddlewares(...middlewares: RouteOptionsPreAllOptions[]) {
  return GenericMiddlewares<RouteOptionsPreAllOptions>(...middlewares)
}

/**
 * Use case: demonstrate Hapi pre-handlers attached through `@Middlewares`
 * while reusing shared controller functionality from a base class.
 */
@GenericMiddlewares<RouteOptionsPreAllOptions>(recordHapiMiddleware('hapi:controller'))
@Route('middleware/hapi')
@Tags('middleware')
export class HapiMiddlewareShowcaseController extends MiddlewareShowcaseBase {
  public constructor() {
    super('hapi', middlewareEvents)
  }

  /**
   * Runs controller-level and method-level Hapi pre-handlers before returning the trace.
   */
  @HapiMiddlewares(recordHapiMiddleware('hapi:method:first'), recordHapiMiddleware('hapi:method:second'))
  @Get('trace')
  public getTrace(): MiddlewareTraceView {
    return this.buildTrace()
  }
}
