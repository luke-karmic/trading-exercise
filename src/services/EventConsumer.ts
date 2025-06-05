<<<<<<< HEAD
=======
import { EventEmitter } from 'events';
>>>>>>> feature/sl-simulation
import { EVENT_NAMES } from '../types/events';
import { PriceUpdateConsumer } from './consumers/PriceUpdateConsumer';
import { TradeExecutionConsumer } from './consumers/TradeExecutionConsumer';
import { StopLossOrderConsumer } from './consumers/StopLossOrderConsumer';
<<<<<<< HEAD
=======
import { PriceUpdate, TradeExecution, StopLossOrder } from '../types/events';

type EventTypes = PriceUpdate | TradeExecution | StopLossOrder;
type ConsumerTypes = PriceUpdateConsumer | TradeExecutionConsumer | StopLossOrderConsumer;

type ConsumerMap = {
  [EVENT_NAMES.PRICE_UPDATE]: PriceUpdateConsumer;
  [EVENT_NAMES.TRADE_EXECUTION]: TradeExecutionConsumer;
  [EVENT_NAMES.STOP_LOSS_ORDER]: StopLossOrderConsumer;
};
>>>>>>> feature/sl-simulation

/**
 * DDD: Domain Driven Design
 * This class represents a decoupled component for handling events from the event bus.
 * Using AVRO schema to deserialize the events (realistic queue)
 */
<<<<<<< HEAD
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
=======
export class EventConsumer extends EventEmitter {
  private consumers: Map<keyof ConsumerMap, ConsumerTypes>;
  private processingEvents: Set<string> = new Set();
  private eventQueue: Array<{ type: string; buffer: Buffer; id: string }> = [];
  private isProcessing: boolean = false;

  constructor() {
    super();
    this.consumers = new Map([
      [EVENT_NAMES.PRICE_UPDATE, new PriceUpdateConsumer()],
      [EVENT_NAMES.TRADE_EXECUTION, new TradeExecutionConsumer()],
      [EVENT_NAMES.STOP_LOSS_ORDER, new StopLossOrderConsumer()]
    ] as [keyof ConsumerMap, ConsumerTypes][]);
  }

  public handleEvent(type: string, buffer: Buffer): void {
    const eventId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.eventQueue.push({ type, buffer, id: eventId });

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const batch = this.eventQueue.splice(0, this.eventQueue.length);

    const promises = batch.map(({ type, buffer, id }) => {
      const consumer = this.consumers.get(type as keyof ConsumerMap);
      if (!consumer) return Promise.resolve();

      this.processingEvents.add(id);
      return consumer.handleEvent(type, buffer)
        .finally(() => {
          this.processingEvents.delete(id);
        });
    });

    await Promise.all(promises);
    this.isProcessing = false;

    if (this.eventQueue.length > 0) {
      this.processQueue();
>>>>>>> feature/sl-simulation
    }
  }
} 