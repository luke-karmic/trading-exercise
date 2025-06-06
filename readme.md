# Trading System Simulator

A TypeScript-based trading system simulator that demonstrates event-driven architecture and domain-driven design principles. The system simulates price movements, trade executions, and stop-loss order management.

NOTE: Did not add tests, ESLINT, or prettier / perfections. I spent most of the time to display good architectural design.

Added Batching and parallel processing, keep interval set low (~50) in order to ensure events aren't syncronous. as there is a fake Promise (50ms) to simulate processing time.

The terminal will show RED and terminate the app once a stop loss is hit, or you can comment that line out to continue: `src/services/StopLossManager.ts:63`

You can set positions at the `/src/config/index.ts#L66`. The log will show a RED line when a part of the position is closed.

## Architecture

The system follows a clean, event-driven architecture with the following components:
I used Event Emitter, and DDD to decouple all components to give the idea of a queue, also with Binary Avro format / event-driven design.
See below the config, you can add manual stop losses into the array as well as set the assets, and base price there.

It also uses GBM (Geometric Brownian motion), which is a modelling formula for real world asset prices uses stochastics, so price movements are actually realistic! You can alter the volatility and other formula to tweak this for hitting SL's easier / harder.

### Core Components

- **PriceStateManager**: Manages price state using Geometric Brownian Motion (GBM) for realistic price simulations
- **EventGenerator**: Generates various trading events (price updates, trades, stop-loss orders)
- **EventConsumer**: Processes events through specialized consumers
- **StopLossManager**: Manages stop-loss orders and their triggers

### Event Types

1. **Price Updates**: Real-time price movements for trading symbols
2. **Trade Executions**: Simulated trades with price, quantity, and side
3. **Stop-Loss Orders**: Orders that trigger when price reaches predefined levels

### Consumer Architecture

The system uses a generic-based consumer pattern:
- `BaseConsumer<T>`: Abstract base class for all event consumers
- Specialized consumers for each event type:
  - `PriceUpdateConsumer`
  - `TradeExecutionConsumer`
  - `StopLossOrderConsumer`

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Simulation Settings
INTERVAL_TIME=1000                    # Time between events in milliseconds
PRICE_UPDATE_PROBABILITY=1.0          # Probability of price update events
TRADE_EXECUTION_PROBABILITY=0         # Probability of trade execution events
STOP_LOSS_ORDER_PROBABILITY=0         # Probability of stop-loss order events

# Price Movement Settings
PRICE_VARIATION_PERCENTAGE=0.5        # Maximum price variation percentage
STOP_LOSS_TRIGGER_PERCENTAGE=5        # Percentage for stop-loss triggers
GBM_VOLATILITY=0.02                   # Volatility for Geometric Brownian Motion
GBM_DRIFT=0.0001                      # Drift for Geometric Brownian Motion
```

### Symbol Configuration

Symbols and their stop-loss orders are configured in `src/config/index.ts`:

```typescript
export const CONFIG = {
  symbols: [
    {
      symbol: Symbol.BTC_USD,
      basePrice: 104000,
      volatility: Number(process.env.GBM_VOLATILITY),
      drift: Number(process.env.GBM_DRIFT),
      stopLossPrices: [
        { price: 104195, side: OrderSide.BUY, quantity: 1.0 }
      ]
    }
  ]
};
```

## Event Flow

1. **Price Generation**:
   - `PriceStateManager` generates new prices using GBM
   - Emits price update events

2. **Stop-Loss Processing**:
   - `PriceUpdateConsumer` receives price updates
   - Checks for stop-loss triggers
   - Emits stop-loss order events when triggered

3. **Event Consumption**:
   - Specialized consumers process their respective events
   - Events are logged and can trigger further actions

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start the simulation:
   ```bash
   npm start
   ```

4. For development with auto-reload:
   ```bash
   npm run dev
   ```

## Development

### Project Structure

```
src/
├── config/         # Configuration and constants
├── services/       # Core services
│   └── consumers/  # Event consumers
├── schemas/        # AVRO schemas
└── types/          # TypeScript types
```

### Adding New Event Types

1. Define the event type in `src/types/events.ts`
2. Create an AVRO schema in `src/schemas/avro.ts`
3. Create a new consumer extending `BaseConsumer<T>`
4. Add the event type to `EVENT_NAMES`

## Best Practices

- Keep event handlers focused and single-purpose
- Use TypeScript generics for type safety
- Follow the event-driven architecture pattern
- Maintain separation of concerns between components
- Use proper error handling and logging

## License

MIT