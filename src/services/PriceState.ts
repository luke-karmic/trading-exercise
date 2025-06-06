import { CONFIG, Symbol } from '../config/index';
import { EventEmitter } from 'events';
import { EVENT_NAMES } from '../types/events';
import { priceUpdateSchema } from '../schemas/avro';

interface PriceState {
  symbol: Symbol;
  price: number;
  lastUpdate: number;
  volatility: number;
  drift: number;
}

export class PriceStateManager extends EventEmitter {
  private state: Map<Symbol, PriceState> = new Map();
  private readonly defaultVolatility: number;
  private readonly defaultDrift: number;

  constructor() {
    super();
    this.defaultVolatility = Number(process.env.GBM_VOLATILITY) || 0.02;
    this.defaultDrift = Number(process.env.GBM_DRIFT) || 0.0001;

    CONFIG.symbolPrices.forEach(symbolConfig => {
      this.state.set(symbolConfig.symbol, {
        symbol: symbolConfig.symbol,
        price: symbolConfig.basePrice,
        lastUpdate: Date.now(),
        volatility: symbolConfig.volatility || this.defaultVolatility,
        drift: symbolConfig.drift || this.defaultDrift
      });
    });
  }

  private calculateGBM(currentPrice: number, timeDelta: number, volatility: number, drift: number): number {
    const t = timeDelta / (1000 * 60 * 60 * 24 * 365);
    const randomShock = this.generateNormalRandom();
    const adjustedVolatility = volatility * (1 + CONFIG.priceSettings.variationPercentage / 100);

    // GBM formula: S(t) = S(0) * exp((μ - 0.5σ²)t + σW(t))
    const exponent = (drift - 0.5 * Math.pow(adjustedVolatility, 2)) * t +
      adjustedVolatility * Math.sqrt(t) * randomShock;

    return currentPrice * Math.exp(exponent);
  }

  private generateNormalRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  public getNextPrice(symbol: Symbol): number {
    const currentState = this.state.get(symbol);
    if (!currentState) {
      throw new Error(`No price state found for symbol: ${symbol}`);
    }

    const now = Date.now();
    const timeDelta = now - currentState.lastUpdate;

    const nextPrice = this.calculateGBM(
      currentState.price,
      timeDelta,
      currentState.volatility,
      currentState.drift
    );

    this.state.set(symbol, {
      ...currentState,
      price: nextPrice,
      lastUpdate: now
    });

    const priceUpdate = {
      symbol,
      price: nextPrice,
      timestamp: now
    };
    const buffer = priceUpdateSchema.toBuffer(priceUpdate);
    this.emit(EVENT_NAMES.EVENT, { type: EVENT_NAMES.PRICE_UPDATE, buffer });

    return nextPrice;
  }

  public getCurrentPrice(symbol: Symbol): number {
    const state = this.state.get(symbol);
    if (!state) {
      throw new Error(`No price state found for symbol: ${symbol}`);
    }
    return state.price;
  }
} 