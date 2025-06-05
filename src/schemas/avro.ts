import avsc from 'avsc';
import { OrderSide } from '../config/index';

export const priceUpdateSchema = avsc.Type.forSchema({
  type: 'record',
  name: 'PriceUpdate',
  fields: [
    { name: 'symbol', type: 'string' },
    { name: 'price', type: 'double' },
    { name: 'timestamp', type: 'long' }
  ]
});

export const tradeExecutionSchema = avsc.Type.forSchema({
  type: 'record',
  name: 'TradeExecution',
  fields: [
    { name: 'symbol', type: 'string' },
    { name: 'price', type: 'double' },
    { name: 'quantity', type: 'double' },
    { name: 'side', type: { type: 'enum', name: 'Side', symbols: [OrderSide.BUY, OrderSide.SELL] } },
    { name: 'timestamp', type: 'long' }
  ]
});

export const stopLossOrderSchema = avsc.Type.forSchema({
  type: 'record',
  name: 'StopLossOrder',
  fields: [
    { name: 'symbol', type: 'string' },
    { name: 'triggerPrice', type: 'double' },
    { name: 'quantity', type: 'double' },
    { name: 'side', type: { type: 'enum', name: 'Side', symbols: [OrderSide.BUY, OrderSide.SELL] } },
    { name: 'orderId', type: 'string' },
    { name: 'timestamp', type: 'long' }
  ]
}); 