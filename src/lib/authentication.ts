import { HttpError } from './httpError'

export interface PlaygroundUser { name: string; scheme: string }
interface AuthRequest { headers: Record<string, string | string[] | undefined> }

/** Demo credentials only: replace this function with real credential verification in an application. */
function authenticate(request: AuthRequest, scheme: string, scopes: string[] = []): Promise<PlaygroundUser> {
  return new Promise(resolve => {
    if (scheme === 'api_key' && request.headers['x-api-key'] === 'playground-key') {
      resolve({ name: 'Ada', scheme })
      return
    }
    if (scheme === 'bearer' && request.headers.authorization === 'Bearer playground-token') {
      const granted = new Set(String(request.headers['x-scopes'] ?? '').split(' '))
      if (scopes.every(scope => granted.has(scope))) {
        resolve({ name: 'Ada', scheme })
        return
      }
      throw new HttpError(403, 'Required scope is missing')
    }
    throw new HttpError(401, 'Demo credentials are missing or invalid')
  })
}

export { authenticate as expressAuthentication, authenticate as koaAuthentication, authenticate as hapiAuthentication }
