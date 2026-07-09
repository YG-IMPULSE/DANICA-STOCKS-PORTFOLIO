export interface Holding {
  id: string
  user_id: string
  symbol: string
  name: string
  shares: number
  avg_buy_price: number
  created_at: string
}

export interface StockData {
  symbol: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
  high: number
  low: number
}
