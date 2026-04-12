import { Controller, Example, Get, Header, Path, Query, Route, SuccessResponse, Tags } from 'tsoa-next'
import { CatalogItemView, FeaturedCatalogEnvelope, MarketCode } from '../models/catalog'
import { PlaygroundScenarioService } from '../services/playgroundScenarioService'

/**
 * Use case: demonstrate read-focused catalog discovery calls based on the upstream
 * `getController` and `parameterController` fixtures, but with storefront language
 * that explains why a client would call each endpoint.
 */
@Route('catalog')
@Tags('catalog')
export class CatalogLookupController extends Controller {
  private readonly scenarioService = new PlaygroundScenarioService()

  /**
   * Returns a curated merchandising strip for a known audience segment.
   */
  @Get('featured')
  @SuccessResponse('200', 'Featured catalog cards loaded')
  @Example<FeaturedCatalogEnvelope>({
    audience: 'retail',
    generatedAt: new Date('2026-04-11T15:00:00.000Z'),
    items: [
      {
        availableUnits: 42,
        market: 'us',
        merchandisingLabel: 'new-arrival',
        sku: 'SKU-ALPHA-1',
        title: 'Transit Backpack',
        unitPrice: { amount: 128, currency: 'USD' },
        warehouse: 'north-hub',
      },
    ],
  })
  public getFeaturedCatalog(@Query() audience: string = 'retail'): FeaturedCatalogEnvelope {
    return this.scenarioService.listFeaturedCatalog(audience)
  }

  /**
   * Resolves one SKU while allowing the caller to pin market context and warehouse context.
   */
  @Get('{sku}')
  public getCatalogItem(
    @Path() sku: string,
    @Header('x-market') market: MarketCode = 'us',
    @Query() warehouse?: string,
  ): CatalogItemView {
    return this.scenarioService.getCatalogItem(sku, market, warehouse)
  }
}
