import * as avro from 'avsc';
import { EventEmitter } from 'events';

const priceUpdateSchema = avro.Type.forSchema({
  type: 'record',
  name: 'PriceUpdate',
  fields: [
    { name: 'symbol', type: 'string' },
    { name: 'price', type: 'double' },
    { name: 'timestamp', type: 'long' }
  ]
});

const tradeExecutionSchema = avro.Type.forSchema({
  type: 'record',
  name: 'TradeExecution',
  fields: [
    { name: 'symbol', type: 'string' },
    { name: 'price', type: 'double' },
    { name: 'quantity', type: 'double' },
    { name: 'side', type: { type: 'enum', name: 'Side', symbols: ['BUY', 'SELL'] } },
    { name: 'timestamp', type: 'long' }
  ]
});

const stopLossOrderSchema = avro.Type.forSchema({
  type: 'record',
  name: 'StopLossOrder',
  fields: [
    { name: 'symbol', type: 'string' },
    { name: 'triggerPrice', type: 'double' },
    { name: 'quantity', type: 'double' },
    { name: 'side', type: { type: 'enum', name: 'Side', symbols: ['BUY', 'SELL'] } },
    { name: 'orderId', type: 'string' },
    { name: 'action', type: { type: 'enum', name: 'Action', symbols: ['CREATE', 'CANCEL'] } },
    { name: 'timestamp', type: 'long' }
  ]
});

// Event types
type PriceUpdate = {
  symbol: string;
  price: number;
  timestamp: number;
};

type TradeExecution = {
  symbol: string;
  price: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
};

type StopLossOrder = {
  symbol: string;
  triggerPrice: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  orderId: string;
  action: 'CREATE' | 'CANCEL';
  timestamp: number;
};

class EventGenerator extends EventEmitter {
  private symbols: string[] = ['BTC/USD'];
  private running: boolean = false;

  constructor() {
    super();
  }

  private generateRandomPrice(symbol: string): PriceUpdate {
    const basePrice = symbol === 'BTC/USD' ? 50000 :
      symbol === 'ETH/USD' ? 3000 : 100;
    const price = basePrice + (Math.random() - 0.5) * basePrice * 0.01; // ±0.5% variation
    return {
      symbol,
      price,
      timestamp: Date.now()
    };
  }

  private generateRandomTrade(symbol: string): TradeExecution {
    const price = this.generateRandomPrice(symbol).price;
    return {
      symbol,
      price,
      quantity: Math.random() * 10,
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      timestamp: Date.now()
    };
  }

  private generateRandomStopLossOrder(symbol: string): StopLossOrder {
    const price = this.generateRandomPrice(symbol).price;
    return {
      symbol,
      triggerPrice: price * (Math.random() > 0.5 ? 0.95 : 1.05), // 5% below or above current price
      quantity: Math.random() * 5,
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      orderId: `sl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action: Math.random() > 0.7 ? 'CANCEL' : 'CREATE', // 30% chance of cancel
      timestamp: Date.now()
    };
  }

  public start() {
    if (this.running) return;
    this.running = true;

    setInterval(() => {
      const symbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
      const eventType = Math.random();

      if (eventType < 0.6) { // 60% chance of price update
        const event = this.generateRandomPrice(symbol);
        this.emit('priceUpdate', event);
      } else if (eventType < 0.8) { // 20% chance of trade execution
        const event = this.generateRandomTrade(symbol);
        this.emit('tradeExecution', event);
      } else { // 20% chance of stop loss order
        const event = this.generateRandomStopLossOrder(symbol);
        this.emit('stopLossOrder', event);
      }
    }, 1000);
  }

  public stop() {
    this.running = false;
  }
}

// Create and start the event generator
const eventGenerator = new EventGenerator();

// Set up event listeners
eventGenerator.on('priceUpdate', (event: PriceUpdate) => {
  console.log('Price Update:', event);
});

eventGenerator.on('tradeExecution', (event: TradeExecution) => {
  console.log('Trade Execution:', event);
});

eventGenerator.on('stopLossOrder', (event: StopLossOrder) => {
  console.log('Stop Loss Order:', event);
});

eventGenerator.start();