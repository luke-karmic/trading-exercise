import { CONFIG, Symbol, OrderSide } from '../config/index';
import { EventEmitter } from 'events';
import { EVENT_NAMES, StopLossOrderPayload } from '../types/events';

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

  public checkPrice(symbol: Symbol, currentPrice: number): StopLossOrder[] {
    const symbolOrders = this.orders.get(symbol);
    if (!symbolOrders) return [];

    const triggeredOrders: StopLossOrder[] = [];

    symbolOrders.forEach(order => {
      console.log(`Checking price for order: ${order.symbol} ${order.price} ${order.side} ${order.quantity} ${order.triggered}`);

      if (order.triggered) return;

      const isTriggered = order.side === OrderSide.BUY
        ? currentPrice <= order.price
        : currentPrice >= order.price;
      if (isTriggered) {
        order.triggered = true;
        triggeredOrders.push(order);
        this.emit(EVENT_NAMES.STOP_LOSS_ORDER, {
          symbol,
          price: currentPrice,
          quantity: order.quantity,
          side: order.side,
          timestamp: Date.now()
        } as StopLossOrderPayload);
      }
    });

    return triggeredOrders;
  }

  public getActiveOrders(symbol: Symbol): StopLossOrder[] {
    return this.orders.get(symbol)?.filter(order => !order.triggered) || [];
  }

  public getAllOrders(symbol: Symbol): StopLossOrder[] {
    return this.orders.get(symbol) || [];
  }
} 