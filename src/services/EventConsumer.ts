import { EventEmitter } from 'events';
import { EVENT_NAMES } from '../types/events';
import { PriceUpdateConsumer } from './consumers/PriceUpdateConsumer';
import { TradeExecutionConsumer } from './consumers/TradeExecutionConsumer';
import { StopLossOrderConsumer } from './consumers/StopLossOrderConsumer';
import { PriceUpdate, TradeExecution, StopLossOrder } from '../types/events';

type EventTypes = PriceUpdate | TradeExecution | StopLossOrder;
type ConsumerTypes = PriceUpdateConsumer | TradeExecutionConsumer | StopLossOrderConsumer;

type ConsumerMap = {
  [EVENT_NAMES.PRICE_UPDATE]: PriceUpdateConsumer;
  [EVENT_NAMES.TRADE_EXECUTION]: TradeExecutionConsumer;
  [EVENT_NAMES.STOP_LOSS_ORDER]: StopLossOrderConsumer;
};

/**
 * DDD: Domain Driven Design
 * This class represents a decoupled component for handling events from the event bus.
 * Using AVRO schema to deserialize the events (realistic queue)
 */
export class EventConsumer extends EventEmitter {
  private consumers: Map<keyof ConsumerMap, ConsumerTypes>;

  constructor() {
    super();
    this.consumers = new Map([
      [EVENT_NAMES.PRICE_UPDATE, new PriceUpdateConsumer()],
      [EVENT_NAMES.TRADE_EXECUTION, new TradeExecutionConsumer()],
      [EVENT_NAMES.STOP_LOSS_ORDER, new StopLossOrderConsumer()]
    ] as [keyof ConsumerMap, ConsumerTypes][]);
  }

  public handleEvent(type: string, buffer: Buffer): void {
    const consumer = this.consumers.get(type as keyof ConsumerMap);
    if (consumer) {
      consumer.handleEvent(type, buffer);
    }
  }
} 