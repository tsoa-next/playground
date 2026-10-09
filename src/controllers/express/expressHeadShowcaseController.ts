import { Controller, Head, NoSecurity, Route, Tags } from 'tsoa-next'

@NoSecurity()
@Route('features')
@Tags('Features')
export class ExpressHeadShowcaseController extends Controller {
  @Head('verbs')
  public head(): void { this.setHeader('x-demo-head', 'present') }
}
