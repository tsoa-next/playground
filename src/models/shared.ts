export type SupportedCurrencyCode = 'USD' | 'EUR'

export interface MoneyAmount {
  currency: SupportedCurrencyCode
  amount: number
}

