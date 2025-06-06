import { CONFIG, Symbol, PositionDirection } from '../config/index';
import { EventEmitter } from 'events';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

interface Position {
  id: string;
  symbol: Symbol;
  entryPrice: number;
  positionDirection: PositionDirection;
  totalQuantity: number;
  remainingQuantity: number;
}

export class PositionManager extends EventEmitter {
  private positions: Map<string, Position>;

  constructor() {
    super();
    this.positions = new Map();
    this.initializePositions();
  }

  private initializePositions(): void {
    CONFIG.positions.forEach(position => {
      this.positions.set(position.id, {
        id: position.id,
        symbol: position.symbol,
        entryPrice: position.entryPrice,
        positionDirection: position.positionDirection,
        totalQuantity: position.quantity,
        remainingQuantity: position.quantity
      });
    });
  }

  public handleStopLoss(positionId: string, quantity: number): void {
    const position = this.positions.get(positionId);
    if (!position) {
      console.log(`[PositionManager] No position found with id ${positionId}`);
      return;
    }

    position.remainingQuantity -= quantity;
    // console.log(`${RED}[PositionManager] Position ${positionId} reduced by ${quantity} units${RESET}`);
    // console.log(`${RED}[PositionManager] Remaining quantity: ${position.remainingQuantity}/${position.totalQuantity}${RESET}`);

    if (position.remainingQuantity <= 0) {
      console.log(`${RED}[PositionManager] Position ${positionId} fully closed${RESET}`);
      process.exit(0);
    }
  }
} 