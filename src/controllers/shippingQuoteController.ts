import { Controller, Get, Path, Queries, Route, Tags } from 'tsoa-next'
import { CarrierCode, ShippingQuoteRequestQuery, ShippingQuoteView } from '../models/shipping'
import { PlaygroundScenarioService } from '../services/playgroundScenarioService'

/**
 * Use case: demonstrate aggregated query parsing and path binding for delivery
 * calculations, directly mirroring the upstream parameter fixture patterns with a
 * fulfillment-specific domain.
 */
@Route('shipping')
@Tags('shipping')
export class ShippingQuoteController extends Controller {
  private readonly scenarioService = new PlaygroundScenarioService()

  /**
   * Calculates a delivery quote from grouped query string fields.
   *
   * @minimum parcels 1
   */
  @Get('quote')
  public getShippingQuote(@Queries() request: ShippingQuoteRequestQuery): ShippingQuoteView {
    return this.scenarioService.getShippingQuote(request)
  }

  /**
   * Calculates the same quote while allowing the client to force a specific carrier lane.
   *
   * @minimum parcels 1
   */
  @Get('carriers/{carrierCode}/quote')
  public getCarrierShippingQuote(
    @Path() carrierCode: CarrierCode,
    @Queries() request: ShippingQuoteRequestQuery,
  ): ShippingQuoteView {
    return this.scenarioService.getShippingQuote(request, carrierCode)
  }
}
