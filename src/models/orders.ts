import type { MoneyAmount, SupportedCurrencyCode } from './shared'

export interface OrderLineInput {
  sku: string
  quantity: number
  unitPrice: number
}

export interface CreateOrderDraftRequest {
  customerId: string
  requestedCurrency: SupportedCurrencyCode
  shippingPostalCode: string
  notes?: string
  lines: OrderLineInput[]
}

export interface OrderDraftReceipt {
  draftId: string
  customerId: string
  shippingPostalCode: string
  status: 'draft'
  lineCount: number
  subtotal: MoneyAmount
  notes?: string
}

export interface DraftPricingView {
  currency: SupportedCurrencyCode
  subtotal: MoneyAmount
  tax: MoneyAmount
  grandTotal: MoneyAmount
}

