import { CatalogItemView, FeaturedCatalogEnvelope, MarketCode } from '../models/catalog'
import { CreateOrderDraftRequest, DraftPricingView, OrderDraftReceipt } from '../models/orders'
import { CarrierCode, ShippingQuoteRequestQuery, ShippingQuoteView } from '../models/shipping'
import { SupportedCurrencyCode } from '../models/shared'
import { HttpError } from '../lib/httpError'

const FEATURED_ITEMS: CatalogItemView[] = [
  {
    availableUnits: 42,
    market: 'us',
    merchandisingLabel: 'new-arrival',
    sku: 'SKU-ALPHA-1',
    title: 'Transit Backpack',
    unitPrice: { amount: 128, currency: 'USD' },
    warehouse: 'north-hub',
  },
  {
    availableUnits: 17,
    market: 'us',
    merchandisingLabel: 'team-favorite',
    sku: 'SKU-BRAVO-2',
    title: 'Desk Charger',
    unitPrice: { amount: 64, currency: 'USD' },
    warehouse: 'west-hub',
  },
]

const draftStore = new Map<string, OrderDraftReceipt>()

function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}

function assertDraftExists(draft: OrderDraftReceipt | undefined, draftId: string): OrderDraftReceipt {
  if (!draft) {
    throw new HttpError(404, `No draft found for '${draftId}'.`)
  }

  return draft
}

export class PlaygroundScenarioService {
  /**
   * Returns a fixed starter set so route generation and tests can assert stable examples.
   */
  public listFeaturedCatalog(audience: string): FeaturedCatalogEnvelope {
    return {
      audience,
      generatedAt: new Date('2026-04-11T15:00:00.000Z'),
      items: FEATURED_ITEMS,
    }
  }

  /**
   * Resolves a single catalog item using the same path + header pattern exercised in upstream fixtures.
   */
  public getCatalogItem(sku: string, market: MarketCode, warehouse?: string): CatalogItemView {
    const item = FEATURED_ITEMS.find(candidate => candidate.sku === sku)

    if (!item) {
      throw new HttpError(404, `No catalog item exists for '${sku}'.`)
    }

    return {
      ...item,
      market,
      warehouse: warehouse ?? item.warehouse,
    }
  }

  /**
   * Computes a deterministic quote so all framework variants can assert the same API contract.
   */
  public getShippingQuote(request: ShippingQuoteRequestQuery, carrierCode: CarrierCode = 'postal-priority'): ShippingQuoteView {
    const carrierMultiplier = carrierCode === 'city-bike' ? 0.9 : 1
    const expeditedSurcharge = request.expedited ? 14 : 0
    const baseAmount = (request.parcels * 8 + expeditedSurcharge) * carrierMultiplier

    return {
      carrierCode,
      currency: request.market === 'eu' ? 'EUR' : 'USD',
      destinationLabel: `${request.destinationCountryCode}-${request.destinationPostalCode}`,
      estimatedBusinessDays: request.expedited ? 2 : 5,
      quoteId: `${carrierCode}-${request.destinationPostalCode}-${request.parcels}`,
      quotedAmount: roundCurrency(baseAmount),
      serviceLevel: request.expedited ? 'expedited' : 'standard',
    }
  }

  public createOrderDraft(request: CreateOrderDraftRequest): OrderDraftReceipt {
    const subtotalAmount = roundCurrency(request.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0))
    const draftId = `draft-${draftStore.size + 1}`

    const draft: OrderDraftReceipt = {
      customerId: request.customerId,
      draftId,
      lineCount: request.lines.length,
      notes: request.notes,
      shippingPostalCode: request.shippingPostalCode,
      status: 'draft',
      subtotal: {
        amount: subtotalAmount,
        currency: request.requestedCurrency,
      },
    }

    draftStore.set(draftId, draft)

    return draft
  }

  public getOrderDraft(draftId: string): OrderDraftReceipt {
    return assertDraftExists(draftStore.get(draftId), draftId)
  }

  public priceOrderDraft(request: CreateOrderDraftRequest, currency: SupportedCurrencyCode): DraftPricingView {
    const subtotalAmount = roundCurrency(request.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0))
    const taxAmount = roundCurrency(subtotalAmount * (currency === 'EUR' ? 0.19 : 0.0825))
    const grandTotal = roundCurrency(subtotalAmount + taxAmount)

    return {
      currency,
      grandTotal: {
        amount: grandTotal,
        currency,
      },
      subtotal: {
        amount: subtotalAmount,
        currency,
      },
      tax: {
        amount: taxAmount,
        currency,
      },
    }
  }
}
