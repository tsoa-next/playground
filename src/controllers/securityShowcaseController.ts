import { Controller, Get, NoSecurity, Request, Route, Security, Tags } from 'tsoa-next'
import { PlaygroundUser } from '../lib/authentication'

interface AuthenticatedRequest { user?: PlaygroundUser }

/** Root security, per-method alternatives, combined credentials and scopes. */
@Route('security')
@Tags('security')
export class SecurityShowcaseController extends Controller {
  @Get('root')
  public root(@Request() request: AuthenticatedRequest): { user: PlaygroundUser | undefined } { return { user: request.user } }

  @NoSecurity()
  @Get('public')
  public public(): { public: boolean } { return { public: true } }

  @Security('api_key')
  @Security('bearer', ['read'])
  @Get('either')
  public either(): { authorized: boolean } { return { authorized: true } }

  @Security({ api_key: [], bearer: ['read'] })
  @Get('both')
  public both(): { authorized: boolean } { return { authorized: true } }

  @Security('bearer', ['write'])
  @Get('scoped')
  public scoped(): { authorized: boolean } { return { authorized: true } }
}
