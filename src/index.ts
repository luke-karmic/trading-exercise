import { config } from 'dotenv';
import { EventGenerator } from './services/EventGenerator';
import { EventConsumer } from './services/EventConsumer';

config();

const generator = new EventGenerator();
const consumer = new EventConsumer();

generator.on('event', ({ type, buffer }) => {
  consumer.handleEvent(type, buffer); // Decoupled consumer of events (DDD)
});

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  generator.stop();
  process.exit(0);
});

generator.start(); // Start the simulation