import { EVENT_NAMES } from '../types/events';
import { PriceUpdateConsumer } from './consumers/PriceUpdateConsumer';
import { TradeExecutionConsumer } from './consumers/TradeExecutionConsumer';
import { StopLossOrderConsumer } from './consumers/StopLossOrderConsumer';

/**
 * DDD: Domain Driven Design
 * This class represents a decoupled component for handling events from the event bus.
 * Using AVRO schema to deserialize the events (realistic queue)
 */
export class EventConsumer {
  private priceUpdateConsumer: PriceUpdateConsumer;
  private tradeExecutionConsumer: TradeExecutionConsumer;
  private stopLossOrderConsumer: StopLossOrderConsumer;

  constructor() {
    this.priceUpdateConsumer = new PriceUpdateConsumer();
    this.tradeExecutionConsumer = new TradeExecutionConsumer();
    this.stopLossOrderConsumer = new StopLossOrderConsumer();

    [this.priceUpdateConsumer, this.tradeExecutionConsumer, this.stopLossOrderConsumer].forEach(consumer => {
      consumer.on(EVENT_NAMES.EVENT, (event) => {
        this.handleEvent(event.type, event.buffer);
      });
    });
  }

  public handleEvent(type: string, buffer: Buffer): void {
    switch (type) {
      case EVENT_NAMES.PRICE_UPDATE:
        this.priceUpdateConsumer.handleEvent(type, buffer);
        break;
      case EVENT_NAMES.TRADE_EXECUTION:
        this.tradeExecutionConsumer.handleEvent(type, buffer);
        break;
      case EVENT_NAMES.STOP_LOSS_ORDER:
        this.stopLossOrderConsumer.handleEvent(type, buffer);
        break;
      default:
        console.warn(`Unknown event type: ${type}`);
    }
  }
} 