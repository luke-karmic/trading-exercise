import { EventEmitter } from 'events';
import avsc from 'avsc';

export abstract class BaseConsumer<T> extends EventEmitter {
  protected schema: avsc.Type;

  constructor(schema: avsc.Type) {
    super();
    this.schema = schema;
  }

<<<<<<< HEAD
  public handleEvent(type: string, buffer: Buffer): void {
    if (type !== this.getEventType()) return;

    const event = this.schema.fromBuffer(buffer) as T;
    this.handleEventData(event);
  }

  protected abstract getEventType(): string;
  protected abstract handleEventData(event: T): void;
=======
  public async handleEvent(type: string, buffer: Buffer): Promise<void> {
    if (type !== this.getEventType()) return;

    const startTime = Date.now();
    const event = this.schema.fromBuffer(buffer) as T;

    try {
      await this.handleEventData(event);
      const processingTime = Date.now() - startTime;
      console.log(`[${this.constructor.name}] Completed processing ${type} event in ${processingTime}ms`);
    } catch (error) {
      // console.error(`[${this.constructor.name}] Error processing ${type} event:`, error);
      throw error;
    }
  }

  protected abstract getEventType(): string;
  protected abstract handleEventData(event: T): Promise<void>;
>>>>>>> feature/sl-simulation
} 