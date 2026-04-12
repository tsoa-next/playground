import { MiddlewareTraceView } from '../../models/middlewareShowcase'

export class MiddlewareShowcaseBase {
  protected constructor(private readonly framework: string, private readonly middlewareEvents: string[]) {}

  protected buildTrace(): MiddlewareTraceView {
    const events = this.middlewareEvents.slice()
    this.middlewareEvents.length = 0

    return {
      events,
      framework: this.framework,
    }
  }
}

