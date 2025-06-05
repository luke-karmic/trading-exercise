import { BaseConsumer } from './BaseConsumer';
import { PriceUpdate, EVENT_NAMES } from '../../types/events';
import { priceUpdateSchema, stopLossOrderSchema } from '../../schemas/avro';
import { StopLossManager } from '../StopLossManager';
import { Symbol } from '../../config/index';

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

export class PriceUpdateConsumer extends BaseConsumer<PriceUpdate> {
  private stopLossManager: StopLossManager;

  constructor() {
    super(priceUpdateSchema);
    this.stopLossManager = new StopLossManager();
  }

  protected getEventType(): string {
    return EVENT_NAMES.PRICE_UPDATE;
  }

  protected async handleEventData(update: PriceUpdate): Promise<void> {
    const index = Date.now() % 1000; // To Demonstrate parallel processing
    console.log(`${GREEN}[PriceUpdateConsumer] Processing price update for ${update.symbol} (Index: ${index}):${RESET}`, {
      price: update.price,
      timestamp: new Date(update.timestamp).toISOString()
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const triggeredOrders = await this.stopLossManager.checkPrice(update.symbol as Symbol, update.price);

    if (triggeredOrders.length > 0) {
      console.log(`[PriceUpdateConsumer] Found ${triggeredOrders.length} triggered stop-loss orders for ${update.symbol} (Index: ${index})`);
    }

    for (const order of triggeredOrders) {
      console.log(`[PriceUpdateConsumer] Emitting stop-loss event for ${order.symbol} at ${order.price} (Index: ${index})`);

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
    }
  }
} 