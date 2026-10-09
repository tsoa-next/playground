import { Body, BodyProp, Consumes, Controller, Delete, Deprecated, Example, Extension, Get, Hidden, Inject, NoSecurity, OperationId, Options, Patch, Post, Produces, Put, Query, Request, RequestProp, Res, Response, Route, SuccessResponse, Tags, TsoaResponse } from 'tsoa-next'
import { RequestGreetingService } from '../services/requestGreetingService'

interface GreetingInput { name: string }
interface GreetingView { greeting: string; requestId: string }
interface BoundRequest { playgroundRequestId: string }

/** Request bindings, injected services and response controls, shared by every framework. */
@NoSecurity()
@Route('features')
@Tags('features')
export class FeatureShowcaseController extends Controller {
  public constructor(@Inject() private readonly greetings: RequestGreetingService) { super() }

  @Post('greeting')
  @OperationId('createGreeting')
  @Example<GreetingView>({ greeting: 'Hello Ada', requestId: 'demo' })
  public greeting(@Body() body: GreetingInput): GreetingView {
    return { greeting: this.greetings.greeting(body.name), requestId: this.greetings.requestId }
  }

  @Post('body-property')
  public bodyProperty(@BodyProp('name') name: string): { name: string } { return { name } }

  @Get('request')
  public request(@Request() request: BoundRequest, @RequestProp('playgroundRequestId') requestId: string): { sameRequestId: boolean; requestId: string } {
    return { sameRequestId: request.playgroundRequestId === requestId, requestId: this.greetings.requestId }
  }

  @Get('response')
  @Response<{ message: string }>(409, 'Conflict')
  public response(@Res() rejected: TsoaResponse<409, { message: string }, { 'x-demo-response': string }>, @Query() conflict = false): { message: string } {
    if (conflict) { return rejected(409, { message: 'Please choose another name' }, { 'x-demo-response': 'conflict' }) }
    this.setHeader('x-demo-response', 'success')
    return { message: 'accepted' }
  }

  @Post('media')
  @Consumes('application/vnd.playground+json')
  @Produces('text/plain')
  public media(@Body() body: GreetingInput): string {
    this.setHeader('Content-Type', 'text/plain')
    return this.greetings.greeting(body.name)
  }

  @Put('verbs')
  public put(@Body() body: GreetingInput): GreetingInput { return body }
  @Patch('verbs')
  public patch(@BodyProp('name') name: string): GreetingInput { return { name } }
  @Delete('verbs')
  @SuccessResponse(204)
  public remove(): void { this.setStatus(204) }
  @Options('verbs')
  public options(): { methods: string[] } { return { methods: ['PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] } }

  @Deprecated()
  @Extension('x-playground', 'legacy')
  @Get('legacy')
  public legacy(): { deprecated: boolean } { return { deprecated: true } }
  @Hidden()
  @Get('hidden')
  public hidden(): { hidden: boolean } { return { hidden: true } }
}
