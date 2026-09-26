import { calculateRtp, simulateExpedition } from './engine.js';

const strategies = ['cashout-first', 'safe-choice', 'risky-choice', 'deep-blackhole'];
const runs = 100000;

const summary = strategies.map((strategy) => {
  const result = simulateExpedition({ runs, wager: 10, strategy });
  return { strategy, rtp: result.rtp, totalWager: result.totalWager, totalPayout: result.totalPayout };
});

console.log('VOIDBOUND RTP SIMULATION');
console.log('Declared RTP target: 96.00%');
console.log('Expected model: 0.96');
console.log('');
for (const item of summary) {
  console.log(`${item.strategy}: RTP=${(item.rtp * 100).toFixed(2)}% totalWager=${item.totalWager} totalPayout=${item.totalPayout.toFixed(2)}`);
}
console.log('');
console.log(`Declared RTP: ${(calculateRtp() * 100).toFixed(2)}%`);
