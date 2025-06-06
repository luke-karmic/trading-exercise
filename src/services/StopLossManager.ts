import { CONFIG, Symbol, OrderSide, PositionDirection } from '../config/index';
import { EventEmitter } from 'events';
import { EVENT_NAMES, StopLossOrderPayload } from '../types/events';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export interface StopLossOrder {
  positionId: string;
  symbol: Symbol;
  price: number;
  side: OrderSide;
  quantity: number;
  triggered: boolean;
  positionDirection: PositionDirection;
}

export class StopLossManager extends EventEmitter {
  private orders: Map<string, StopLossOrder[]>;

  constructor() {
    super();
    this.orders = new Map();
    this.initializeOrders();
  }

  private initializeOrders(): void {
    CONFIG.positions.forEach(position => {
      this.orders.set(
        position.id,
        position.stopLossPrices.map(order => ({
          positionId: position.id,
          symbol: position.symbol,
          price: order.price,
          side: order.side,
          quantity: order.quantity,
          triggered: false,
          positionDirection: position.positionDirection
        }))
      );
    });
  }

  public async checkPrice(symbol: Symbol, currentPrice: number): Promise<StopLossOrder[]> {
    console.log(`[StopLossManager] Checking prices for ${symbol} at ${currentPrice}`);
    const triggeredOrders: StopLossOrder[] = [];

    // Get all orders for this symbol in a single flat array
    const symbolOrders = Array.from(this.orders.values())
      .flat()
      .filter(order => order.symbol === symbol && !order.triggered);

    for (const order of symbolOrders) {
      const isTriggered = order.positionDirection === PositionDirection.LONG
        ? (order.side === OrderSide.SELL ? currentPrice <= order.price : currentPrice >= order.price)
        : (order.side === OrderSide.BUY ? currentPrice >= order.price : currentPrice <= order.price);

      if (isTriggered) {
        order.triggered = true;
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`${RED}[StopLossManager] Stop loss triggered for position ${order.positionId} at ${currentPrice} Qty: ${order.quantity}${RESET}`);
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
    return Array.from(this.orders.values())
      .flat()
      .filter(order => !order.triggered && order.symbol === symbol);
  }

  public getAllOrders(symbol: Symbol): StopLossOrder[] {
    return Array.from(this.orders.values())
      .flat()
      .filter(order => order.symbol === symbol);
  }
} 