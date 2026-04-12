import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { Get, Middlewares as GenericMiddlewares, Route, Tags } from 'tsoa-next'
import { MiddlewareTraceView } from '../../models/middlewareShowcase'
import { MiddlewareShowcaseBase } from '../support/middlewareShowcaseBase'

const middlewareEvents: string[] = []

function recordExpressMiddleware(name: string): RequestHandler {
  return (_request: Request, _response: Response, next: NextFunction) => {
    middlewareEvents.push(name)
    next()
  }
}

function ExpressMiddlewares(...middlewares: RequestHandler[]) {
  return GenericMiddlewares<RequestHandler>(...middlewares)
}

/**
 * Use case: demonstrate Express request handlers attached through `@Middlewares`
 * while reusing shared controller functionality from a base class.
 */
@GenericMiddlewares<RequestHandler>(recordExpressMiddleware('express:controller'))
@Route('middleware/express')
@Tags('middleware')
export class ExpressMiddlewareShowcaseController extends MiddlewareShowcaseBase {
  public constructor() {
    super('express', middlewareEvents)
  }

  /**
   * Runs controller-level and method-level Express middleware before returning the trace.
   */
  @ExpressMiddlewares(
    recordExpressMiddleware('express:method:first'),
    recordExpressMiddleware('express:method:second'),
  )
  @Get('trace')
  public getTrace(): MiddlewareTraceView {
    return this.buildTrace()
  }
}

