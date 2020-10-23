export interface Trade {
  amount: number;
  close_profit_abs: number;
  close_timestamp: number;
  is_open: boolean;
  open_timestamp: number;
  pair: string;
  sell_order_status: string;
  sell_reason: string;
  trade_id: string;
  id: string;
}

export type Trades = Trade[];

export interface ParsedTrade {
  amount: number;
  closeProfitAbs: number;
  closeTimestamp: number;
  isOpen: boolean;
  openTimestamp: number;
  pair: string;
  sellOrderStatus: string;
  sellReason: string;
  tradeId: string;
  id: string;
  feeOpenCost: number;
}

export type ParsedTrades = ParsedTrade[];

export interface Profit {
  closed_trade_count: number;
  losing_trades: number;
  profit_closed_coin: number;
  profit_closed_fiat: number;
  profit_closed_percent: number;
  winning_trades: number;
}

interface Currency {
  free: number;
  used: number;
}

export interface Balance {
  currencies: Currency[];
  total: number;
  value: number;
}
