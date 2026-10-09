import { Body, Controller, Get, Post, Route } from 'tsoa-next'
interface ExampleBody { label: string }
@Route('generation-example')
export class GenerationController extends Controller {
  @Get()
  public status(): { source: string } { return { source: 'default template' } }
  @Post()
  public echo(@Body() body: ExampleBody): ExampleBody { return body }
}
