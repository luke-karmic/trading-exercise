import { OrderSide } from '../config/index';

export type PriceUpdate = {
  symbol: string;
  price: number;
  timestamp: number;
};

export type TradeExecution = {
  symbol: string;
  price: number;
  quantity: number;
  side: OrderSide;
  timestamp: number;
};

export type StopLossOrder = {
  symbol: string;
  triggerPrice: number;
  quantity: number;
  side: OrderSide;
  orderId: string;
  timestamp: number;
};

export const EVENT_NAMES = {
  PRICE_UPDATE: 'priceUpdate',
  TRADE_EXECUTION: 'tradeExecution',
  STOP_LOSS_ORDER: 'stopLossOrder',
  EVENT: 'event'
} as const;

export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

export interface EventPayload {
  type: EventName;
  buffer: Buffer;
}

export interface StopLossOrderPayload {
  symbol: string;
  price: number;
  quantity: number;
  side: OrderSide;
  timestamp: number;
} 