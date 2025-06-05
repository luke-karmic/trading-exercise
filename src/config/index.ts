import { config } from 'dotenv';

config();

export enum Symbol {
  BTC_USD = 'BTC/USD',
  ETH_USD = 'ETH/USD'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export interface SymbolConfig {
  symbol: Symbol;
  basePrice: number;
  volatility?: number;
  drift?: number;
  stopLossPrices: {
    price: number;
    side: OrderSide;
    quantity: number;
  }[];
}

export const CONFIG = {
  intervalTime: Number(process.env.INTERVAL_TIME) || 1000,
  eventProbabilities: {
    priceUpdate: Number(process.env.PRICE_UPDATE_PROBABILITY) || 1.0,
    tradeExecution: Number(process.env.TRADE_EXECUTION_PROBABILITY) || 0,
    stopLossOrder: Number(process.env.STOP_LOSS_ORDER_PROBABILITY) || 0
  },
  priceSettings: {
    variationPercentage: Number(process.env.PRICE_VARIATION_PERCENTAGE) || 0.5,
    stopLossTriggerPercentage: Number(process.env.STOP_LOSS_TRIGGER_PERCENTAGE) || 5,
  },
  symbols: [
    {
      symbol: Symbol.BTC_USD,
      basePrice: 104000,
      volatility: Number(process.env.GBM_VOLATILITY),
      drift: Number(process.env.GBM_DRIFT),
      stopLossPrices: [
        { price: 104195, side: OrderSide.BUY, quantity: 1.0 },
        // { price: 55000, side: OrderSide.SELL, quantity: 0.5 },
        // { price: 40000, side: OrderSide.BUY, quantity: 2.0 },
        // { price: 60000, side: OrderSide.SELL, quantity: 1.0 }
      ]
    }
    // {
    //   symbol: Symbol.ETH_USD,
    //   basePrice: 3000,
    //   volatility: 0.04,
    //   drift: 0.0001,
    //   stopLossPrices: [
    //     { price: 2700, side: OrderSide.BUY, quantity: 10.0 },
    //     { price: 3300, side: OrderSide.SELL, quantity: 5.0 }
    //   ]
    // }
  ] as SymbolConfig[]
} as const;

const totalProbability = CONFIG.eventProbabilities.priceUpdate +
  CONFIG.eventProbabilities.tradeExecution +
  CONFIG.eventProbabilities.stopLossOrder;

console.log(totalProbability);
if (Math.abs(totalProbability - 1) > 0.001) {
  throw new Error(`Event probabilities must sum to 1, got ${totalProbability}`);
} 