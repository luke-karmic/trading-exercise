import { BaseConsumer } from './BaseConsumer';
import { TradeExecution, EVENT_NAMES } from '../../types/events';
import { tradeExecutionSchema } from '../../schemas/avro';

export class TradeExecutionConsumer extends BaseConsumer<TradeExecution> {
  constructor() {
    super(tradeExecutionSchema);
  }

  protected getEventType(): string {
    return EVENT_NAMES.TRADE_EXECUTION;
  }

  protected async handleEventData(trade: TradeExecution): Promise<void> {
    console.log('Trade execution:', {
      symbol: trade.symbol,
      price: trade.price,
      quantity: trade.quantity,
      side: trade.side,
      timestamp: new Date(trade.timestamp).toISOString()
    });
  }
} 