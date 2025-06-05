import { EventEmitter } from 'node:events';
import { CONFIG, SymbolConfig, OrderSide } from '../config/index';
import { PriceUpdate, TradeExecution, StopLossOrder, EVENT_NAMES, EventPayload } from '../types/events';
import { priceUpdateSchema, tradeExecutionSchema, stopLossOrderSchema } from '../schemas/avro';
import { PriceStateManager } from './PriceState';

export class EventGenerator extends EventEmitter {
  private priceState: PriceStateManager;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.priceState = new PriceStateManager();
  }

  private generateRandomPrice(symbol: SymbolConfig): PriceUpdate {
    const price = this.priceState.getNextPrice(symbol.symbol);
    return {
      symbol: symbol.symbol,
      price,
      timestamp: Date.now()
    };
  }

  private generateRandomTrade(symbolConf: SymbolConfig): TradeExecution {
    const price = this.priceState.getCurrentPrice(symbolConf.symbol);
    return {
      symbol: symbolConf.symbol,
      price,
      quantity: Math.random() * 10,
      side: Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL,
      timestamp: Date.now()
    };
  }

  private generateRandomStopLossOrder(symbolConf: SymbolConfig): StopLossOrder {
    const price = this.priceState.getCurrentPrice(symbolConf.symbol);
    return {
      symbol: symbolConf.symbol,
      triggerPrice: price * (Math.random() > 0.5 ?
        (1 - CONFIG.priceSettings.stopLossTriggerPercentage / 100) :
        (1 + CONFIG.priceSettings.stopLossTriggerPercentage / 100)),
      quantity: Math.random() * 5,
      side: Math.random() > 0.5 ? OrderSide.BUY : OrderSide.SELL,
      orderId: `sl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
  }

  private serializeEvent<T>(event: T, schema: typeof priceUpdateSchema): Buffer {
    return schema.toBuffer(event);
  }

  public start(): void {
    if (this.intervalId) {
      console.log('Event generator is already running');
      return;
    }

    this.intervalId = setInterval(() => {
      CONFIG.symbols.forEach(symbolConfig => {
        const batchPromises = [];
        for (let i = 0; i < CONFIG.eventBatchSize; i++) {
          batchPromises.push(
            (async () => {
              const random = Math.random();
              if (random < CONFIG.eventProbabilities.priceUpdate) {
                const event = this.generateRandomPrice(symbolConfig);
                const buffer = this.serializeEvent(event, priceUpdateSchema);
                this.emit(EVENT_NAMES.EVENT, { type: EVENT_NAMES.PRICE_UPDATE, buffer } as EventPayload);
              } else if (random < CONFIG.eventProbabilities.priceUpdate + CONFIG.eventProbabilities.tradeExecution) {
                const event = this.generateRandomTrade(symbolConfig);
                const buffer = this.serializeEvent(event, tradeExecutionSchema);
                this.emit(EVENT_NAMES.EVENT, { type: EVENT_NAMES.TRADE_EXECUTION, buffer } as EventPayload);
              } else {
                const event = this.generateRandomStopLossOrder(symbolConfig);
                const buffer = this.serializeEvent(event, stopLossOrderSchema);
                this.emit(EVENT_NAMES.EVENT, { type: EVENT_NAMES.STOP_LOSS_ORDER, buffer } as EventPayload);
              }
            })()
          );
        }
        Promise.all(batchPromises);
      });
    }, CONFIG.intervalTime);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
} 