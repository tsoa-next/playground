import { IocContainer, IocContainerFactory, ServiceIdentifier } from 'tsoa-next'
import { FeatureShowcaseController } from '../controllers/featureShowcaseController'
import { RequestGreetingService } from '../services/requestGreetingService'

interface ScopedRequest { headers: Record<string, string | string[] | undefined> }

/** A tiny request-scoped container; no DI framework is required by tsoa. */
export const iocContainer: IocContainerFactory<ScopedRequest> = request => ({
  get<T>(controller: ServiceIdentifier<T>): T {
    if (controller === FeatureShowcaseController) {
      return new FeatureShowcaseController(new RequestGreetingService(String(request.headers['x-request-id'] ?? 'demo'))) as T
    }
    if (typeof controller !== 'function') { throw new TypeError('The demo container requires a controller constructor') }
    return new (controller as new () => T)()
  },
} satisfies IocContainer)
