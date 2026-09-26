import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveNodeEvent,
  getBlackHoleStage,
  simulateExpedition,
  calculateRtp
} from './engine.js';
import { createVoidboundAdapter } from '../chain/adapter.js';

test('planet treasure resolves to a valid positive multiplier', () => {
  const result = resolveNodeEvent('planet', 'treasure', 0.1);
  assert.equal(result.kind, 'treasure');
  assert.ok(result.multiplier >= 1.0);
  assert.ok(Number.isFinite(result.multiplier));
});

test('risky asteroid resolves to a valid win or loss with expected multiplier structure', () => {
  const win = resolveNodeEvent('asteroid', 'risky', 0.2);
  const lose = resolveNodeEvent('asteroid', 'risky', 0.95);
  assert.equal(win.kind, 'risk');
  assert.equal(lose.kind, 'risk');
  assert.ok(win.multiplier >= 1.0 || win.multiplier === 0);
  assert.ok(lose.multiplier === 0 || lose.multiplier >= 1.0);
});

test('black hole stage selection always returns a valid stage and ordered risk profile', () => {
  const stage1 = getBlackHoleStage(0);
  const stage5 = getBlackHoleStage(4);
  assert.equal(stage1.name, 'Outer Disk');
  assert.equal(stage5.name, 'Singularity');
  assert.ok(stage1.survival > 0 && stage1.survival < 1);
  assert.ok(stage5.multiplier > stage1.multiplier);
});

test('simulated expeditions produce a valid RTP range for the default strategy', () => {
  const result = simulateExpedition({ runs: 1000, strategy: 'cashout-first', wager: 10 });
  assert.ok(result.rtp >= 0.90 && result.rtp <= 1.10);
  assert.ok(result.totalWager > 0);
  assert.ok(Array.isArray(result.path));
});

test('computed RTP is inside the jam target window when using the current paytable model', () => {
  const rtp = calculateRtp();
  assert.ok(rtp >= 0.93 && rtp <= 0.98);
});

test('chain adapter creates and settles a session with a valid payout', () => {
  const adapter = createVoidboundAdapter(12345);
  const session = adapter.contract.launch({ wager: 10, player: 'tester' });

  assert.ok(session.gameId.startsWith('voidbound-'));
  assert.equal(typeof session.requestId, 'string');

  const outcome = adapter.contract.resolveNode({ gameId: session.gameId, nodeType: 'planet', choice: 'safe' });
  const settle = adapter.contract.cashOut({ gameId: session.gameId });

  assert.ok(outcome.multiplier >= 1);
  assert.ok(settle.payout >= 10);
  assert.equal(settle.status, 'settled');
});
