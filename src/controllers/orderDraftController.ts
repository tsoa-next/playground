import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse, Tags } from 'tsoa-next'
import { CreateOrderDraftRequest, DraftPricingView, OrderDraftReceipt } from '../models/orders'
import { SupportedCurrencyCode } from '../models/shared'
import { PlaygroundScenarioService } from '../services/playgroundScenarioService'

/**
 * Use case: demonstrate write-heavy draft order flows inspired by the upstream
 * `postController` fixture, with explicit names that map to staging an order,
 * retrieving it later, and recalculating totals in a requested currency.
 */
@Route('order-drafts')
@Tags('orders')
export class OrderDraftController extends Controller {
  private readonly scenarioService = new PlaygroundScenarioService()

  /**
   * Stages a draft order so a client can review the payload before final submission.
   */
  @Post()
  @SuccessResponse('201', 'Draft order staged')
  public createOrderDraft(@Body() request: CreateOrderDraftRequest): OrderDraftReceipt {
    this.setStatus(201)
    return this.scenarioService.createOrderDraft(request)
  }

  /**
   * Retrieves a staged draft order by its identifier.
   */
  @Get('{draftId}')
  public getOrderDraft(@Path() draftId: string): OrderDraftReceipt {
    return this.scenarioService.getOrderDraft(draftId)
  }

  /**
   * Reprices a draft payload using a caller-selected output currency.
   */
  @Post('pricing')
  public priceOrderDraft(
    @Body() request: CreateOrderDraftRequest,
    @Query() currency: SupportedCurrencyCode = 'USD',
  ): DraftPricingView {
    return this.scenarioService.priceOrderDraft(request, currency)
  }
}
