import { CONFIG, Symbol, OrderSide } from '../config/index';
import { EventEmitter } from 'events';
import { EVENT_NAMES, StopLossOrderPayload } from '../types/events';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export interface StopLossOrder {
  symbol: Symbol;
  price: number;
  side: OrderSide;
  quantity: number;
  triggered: boolean;
}

export class StopLossManager extends EventEmitter {
  private orders: Map<Symbol, StopLossOrder[]>;

  constructor() {
    super();
    this.orders = new Map();
    this.initializeOrders();
  }

  private initializeOrders(): void {
    CONFIG.symbols.forEach(symbolConfig => {
      this.orders.set(
        symbolConfig.symbol,
        symbolConfig.stopLossPrices.map(order => ({
          symbol: symbolConfig.symbol,
          price: order.price,
          side: order.side,
          quantity: order.quantity,
          triggered: false
        }))
      );
    });
  }

  public async checkPrice(symbol: Symbol, currentPrice: number): Promise<StopLossOrder[]> {
    console.log(`[StopLossManager] Checking prices for ${symbol} at ${currentPrice}`);
    const symbolOrders = this.orders.get(symbol);
    if (!symbolOrders) {
      console.log(`[StopLossManager] No orders found for ${symbol}`);
      return [];
    }

    const triggeredOrders: StopLossOrder[] = [];

    for (const order of symbolOrders) {
      if (order.triggered) {
        continue;
      }

      const isTriggered = order.side === OrderSide.BUY
        ? currentPrice <= order.price
        : currentPrice >= order.price;

      if (isTriggered) {
        order.triggered = true;
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`${RED}[StopLossManager] Order triggered for ${symbol} at ${currentPrice}${RESET}`);
        process.exit(0);
        triggeredOrders.push(order);

        const stopLossPayload: StopLossOrderPayload = {
          symbol,
          price: currentPrice,
          quantity: order.quantity,
          side: order.side,
          timestamp: Date.now()
        };

        this.emit(EVENT_NAMES.STOP_LOSS_ORDER, stopLossPayload);
      }
    }

    return triggeredOrders;
  }

  public getActiveOrders(symbol: Symbol): StopLossOrder[] {
    return this.orders.get(symbol)?.filter(order => !order.triggered) || [];
  }

  public getAllOrders(symbol: Symbol): StopLossOrder[] {
    return this.orders.get(symbol) || [];
  }
} 