import { PriceUpdate, TradeExecution, StopLossOrder, EVENT_NAMES } from '../types/events';
import { priceUpdateSchema, tradeExecutionSchema, stopLossOrderSchema } from '../schemas/avro';

/**
 * DDD: Domain Driven Design
 * This class represents a decoupled component for handling events from the event bus.
 * Using AVRO schema to deserialize the events (realistic queue)
 */
export class EventConsumer {
  constructor() { }

  public handleEvent(type: string, buffer: Buffer): void {
    switch (type) {
      case EVENT_NAMES.PRICE_UPDATE:
        const priceUpdate = priceUpdateSchema.fromBuffer(buffer);
        this.handlePriceUpdate(priceUpdate);
        break;
      case EVENT_NAMES.TRADE_EXECUTION:
        const tradeExecution = tradeExecutionSchema.fromBuffer(buffer);
        this.handleTradeExecution(tradeExecution);
        break;
      case EVENT_NAMES.STOP_LOSS_ORDER:
        const stopLossOrder = stopLossOrderSchema.fromBuffer(buffer);
        this.handleStopLossOrder(stopLossOrder);
        break;
      default:
        console.warn(`Unknown event type: ${type}`);
    }
  }

  private handlePriceUpdate(update: PriceUpdate): void {
    console.log('Price update:', {
      symbol: update.symbol,
      price: update.price,
      timestamp: new Date(update.timestamp).toISOString()
    });
  }

  private handleTradeExecution(trade: TradeExecution): void {
    console.log('Trade execution:', {
      symbol: trade.symbol,
      price: trade.price,
      quantity: trade.quantity,
      side: trade.side,
      timestamp: new Date(trade.timestamp).toISOString()
    });
  }

  private handleStopLossOrder(order: StopLossOrder): void {
    console.log('Stop-loss order triggered:', {
      symbol: order.symbol,
      price: order.triggerPrice,
      quantity: order.quantity,
      side: order.side,
      timestamp: new Date(order.timestamp).toISOString()
    });
  }
} 