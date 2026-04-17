import type { SupportedCurrencyCode } from './shared'

export type CarrierCode = 'postal-priority' | 'city-bike'
export type ServiceLevelCode = 'standard' | 'expedited'

export interface ShippingQuoteRequestQuery {
  destinationCountryCode: string
  destinationPostalCode: string

  /**
   * @minimum 1
   */
  parcels: number
  expedited: boolean
  market: 'us' | 'eu'
}

export interface ShippingQuoteView {
  quoteId: string
  carrierCode: CarrierCode
  serviceLevel: ServiceLevelCode
  destinationLabel: string
  currency: SupportedCurrencyCode
  estimatedBusinessDays: number
  quotedAmount: number
}
