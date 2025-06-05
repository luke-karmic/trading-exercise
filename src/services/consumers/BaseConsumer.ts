import { EventEmitter } from 'events';
import avsc from 'avsc';

export abstract class BaseConsumer<T> extends EventEmitter {
  protected schema: avsc.Type;

  constructor(schema: avsc.Type) {
    super();
    this.schema = schema;
  }

  public handleEvent(type: string, buffer: Buffer): void {
    if (type !== this.getEventType()) return;

    const event = this.schema.fromBuffer(buffer) as T;
    this.handleEventData(event);
  }

  protected abstract getEventType(): string;
  protected abstract handleEventData(event: T): void;
} 