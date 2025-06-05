import { BaseConsumer } from './BaseConsumer';
import { PriceUpdate, EVENT_NAMES } from '../../types/events';
import { priceUpdateSchema, stopLossOrderSchema } from '../../schemas/avro';
import { StopLossManager } from '../StopLossManager';
import { Symbol } from '../../config/index';

export class PriceUpdateConsumer extends BaseConsumer<PriceUpdate> {
  private stopLossManager: StopLossManager;

  constructor() {
    super(priceUpdateSchema);
    this.stopLossManager = new StopLossManager();
  }

  protected getEventType(): string {
    return EVENT_NAMES.PRICE_UPDATE;
  }

  protected handleEventData(update: PriceUpdate): void {
    console.log('Price update:', {
      symbol: update.symbol,
      price: update.price,
      timestamp: new Date(update.timestamp).toISOString()
    });

    // Check for stop-loss triggers
    const triggeredOrders = this.stopLossManager.checkPrice(update.symbol as Symbol, update.price);

    // Emit stop-loss events for each triggered order
    triggeredOrders.forEach(order => {
      const stopLossEvent = {
        symbol: order.symbol,
        triggerPrice: order.price,
        quantity: order.quantity,
        side: order.side,
        orderId: `sl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action: 'CREATE',
        timestamp: Date.now()
      };
      const buffer = stopLossOrderSchema.toBuffer(stopLossEvent);
      this.emit(EVENT_NAMES.EVENT, { type: EVENT_NAMES.STOP_LOSS_ORDER, buffer });
    });
  }
} 