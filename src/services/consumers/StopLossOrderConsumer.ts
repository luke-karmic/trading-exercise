import { BaseConsumer } from './BaseConsumer';
import { StopLossOrder, EVENT_NAMES } from '../../types/events';
import { stopLossOrderSchema } from '../../schemas/avro';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export class StopLossOrderConsumer extends BaseConsumer<StopLossOrder> {
  constructor() {
    super(stopLossOrderSchema);
  }

  protected getEventType(): string {
    return EVENT_NAMES.STOP_LOSS_ORDER;
  }

  protected async handleEventData(order: StopLossOrder): Promise<void> {
    console.log(`${RED}Stop-loss order triggered:${RESET}`, {
      symbol: order.symbol,
      price: order.triggerPrice,
      quantity: order.quantity,
      side: order.side,
      timestamp: new Date(order.timestamp).toISOString()
    });
  }
} 