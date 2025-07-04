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

export enum PositionDirection {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface PositionConfig {
  id: string;
  symbol: Symbol;
  entryPrice: number;
  positionDirection: PositionDirection;
  quantity: number;
  stopLossPrices: {
    price: number;
    side: OrderSide;
    quantity: number;
  }[];
}

export interface SymbolPriceConfig {
  symbol: Symbol;
  basePrice: number;
  volatility?: number;
  drift?: number;
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
  eventBatchSize: Number(process.env.EVENT_BATCH_SIZE) || 1,
  symbolPrices: [
    {
      symbol: Symbol.BTC_USD,
      basePrice: 104000,
      volatility: Number(process.env.GBM_VOLATILITY),
      drift: Number(process.env.GBM_DRIFT),
    },
    // {
    //   symbol: Symbol.ETH_USD,
    //   basePrice: 3000,
    //   volatility: 0.04,
    //   drift: 0.0001,
    // }
  ] as SymbolPriceConfig[],
  positions: [
    {
      id: 'btc-long-1',
      symbol: Symbol.BTC_USD,
      entryPrice: 104000,
      positionDirection: PositionDirection.LONG,
      quantity: 1.5,
      stopLossPrices: [
        { price: 104050, side: OrderSide.BUY, quantity: 1.0 },
        { price: 104100, side: OrderSide.BUY, quantity: 0.5 },
      ]
    },
    // {
    //   id: 'eth-short-1',
    //   symbol: Symbol.ETH_USD,
    //   entryPrice: 3000,
    //   positionDirection: PositionDirection.SHORT,
    //   quantity: 10.0,
    //   stopLossPrices: [
    //     { price: 3300, side: OrderSide.BUY, quantity: 10.0 },
    //     { price: 3150, side: OrderSide.BUY, quantity: 5.0 }
    //   ]
    // }
  ] as PositionConfig[]
} as const;

const totalProbability = CONFIG.eventProbabilities.priceUpdate +
  CONFIG.eventProbabilities.tradeExecution +
  CONFIG.eventProbabilities.stopLossOrder;

console.log(totalProbability);
if (Math.abs(totalProbability - 1) > 0.001) {
  throw new Error(`Event probabilities must sum to 1, got ${totalProbability}`);
} 