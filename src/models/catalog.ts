import type { MoneyAmount } from './shared'

export type MarketCode = 'us' | 'eu'

export interface CatalogItemView {
  sku: string
  title: string
  market: MarketCode
  warehouse: string
  merchandisingLabel: string
  availableUnits: number
  unitPrice: MoneyAmount
}

export interface FeaturedCatalogEnvelope {
  audience: string
  generatedAt: Date
  items: CatalogItemView[]
}

