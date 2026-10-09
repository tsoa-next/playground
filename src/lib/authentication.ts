import { HttpError } from './httpError'

export interface PlaygroundUser { name: string; scheme: string }
interface AuthRequest { headers: Record<string, string | string[] | undefined> }

/** Demo credentials only: replace this function with real credential verification in an application. */
async function authenticate(request: AuthRequest, scheme: string, scopes: string[] = []): Promise<PlaygroundUser> {
  if (scheme === 'api_key' && request.headers['x-api-key'] === 'playground-key') {
    return { name: 'Ada', scheme }
  }
  if (scheme === 'bearer' && request.headers.authorization === 'Bearer playground-token') {
    const granted = String(request.headers['x-scopes'] ?? '').split(' ')
    if (scopes.every(scope => granted.includes(scope))) { return { name: 'Ada', scheme } }
    throw new HttpError(403, 'Required scope is missing')
  }
  throw new HttpError(401, 'Demo credentials are missing or invalid')
}

export { authenticate as expressAuthentication, authenticate as koaAuthentication, authenticate as hapiAuthentication }
