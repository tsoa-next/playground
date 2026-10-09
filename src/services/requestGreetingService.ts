export class RequestGreetingService {
  public constructor(public readonly requestId: string) {}
  public greeting(name: string): string { return `Hello ${name}` }
}
