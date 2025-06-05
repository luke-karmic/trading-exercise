import { BaseConsumer } from './BaseConsumer';
import { StopLossOrder, EVENT_NAMES } from '../../types/events';
import { stopLossOrderSchema } from '../../schemas/avro';

export class StopLossOrderConsumer extends BaseConsumer<StopLossOrder> {
  constructor() {
    super(stopLossOrderSchema);
  }

  protected getEventType(): string {
    return EVENT_NAMES.STOP_LOSS_ORDER;
  }

  protected handleEventData(order: StopLossOrder): void {
    console.log('Stop-loss order triggered:', {
      symbol: order.symbol,
      price: order.triggerPrice,
      quantity: order.quantity,
      side: order.side,
      timestamp: new Date(order.timestamp).toISOString()
    });
  }
} 