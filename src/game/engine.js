export const BETS = [1, 5, 10, 25];

export const NODE_DEFS = {
  planet: {
    type: 'planet',
    icon: '🪐',
    name: 'Planet Cache',
    description: 'A quiet world hides a small cache of precursor crystals.',
    reward: { kind: 'treasure', multiplier: 1.2 }
  },
  relic: {
    type: 'relic',
    icon: '💎',
    name: 'Ancient Relic',
    description: 'A precursor vault opens. Your cargo value increases sharply.',
    reward: { kind: 'treasure', multiplier: 1.6 }
  },
  asteroid: {
    type: 'asteroid',
    icon: '☄️',
    name: 'Asteroid Field',
    description: 'Three trajectories appear. The deeper route offers more value but greater loss risk.',
    choices: {
      safe: { survival: 0.8, multiplier: 1.2 },
      risky: { survival: 0.48, multiplier: 2.0 },
      unknown: { survival: 0.24, multiplier: 4.0 }
    }
  },
  wormhole: {
    type: 'wormhole',
    icon: '🌀',
    name: 'Wormhole',
    description: 'Spacetime folds. Your next destination will be chosen from the connected sector.',
    reward: { kind: 'warp', multiplier: 1 }
  },
  pulsar: {
    type: 'pulsar',
    icon: '⭐',
    name: 'Pulsar Beacon',
    description: 'A compressed star emits a rare energy pulse.',
    reward: { kind: 'treasure', multiplier: 1.5 }
  },
  blackhole: {
    type: 'blackhole',
    icon: '🌌',
    name: 'Black Hole',
    description: 'The map ends here — or the expedition becomes legendary.',
    reward: { kind: 'blackhole', multiplier: 1 }
  },
  ruins: {
    type: 'ruins',
    icon: '👽',
    name: 'Ancient Ruins',
    description: 'An abandoned alien station contains an uncertain artifact.',
    rewardTable: [
      { bucket: [0, 69], result: 'empty', multiplier: 0 },
      { bucket: [70, 89], result: 'artifact', multiplier: 1.6 },
      { bucket: [90, 98], result: 'rare', multiplier: 4.0 },
      { bucket: [99, 99], result: 'cosmic', multiplier: 24.0 }
    ]
  },
  dead: {
    type: 'dead',
    icon: '🌑',
    name: 'Dead World',
    description: 'The planet is empty. You can continue, but nothing was found here.',
    reward: { kind: 'empty', multiplier: 1 }
  }
};

export const BLACK_HOLE_STAGES = [
  { name: 'Outer Disk', survival: 0.8, multiplier: 1.2 },
  { name: 'Inner Orbit', survival: 0.6, multiplier: 1.6 },
  { name: 'Photon Ring', survival: 0.4, multiplier: 2.4 },
  { name: 'Event Horizon', survival: 0.24, multiplier: 4.0 },
  { name: 'Singularity', survival: 0.12, multiplier: 8.0 }
];

export function getBlackHoleStage(depth = 0) {
  const idx = Math.min(Math.max(depth, 0), BLACK_HOLE_STAGES.length - 1);
  return BLACK_HOLE_STAGES[idx];
}

export function resolveNodeEvent(type, mode = 'treasure', randomValue = 0.5) {
  const def = NODE_DEFS[type];
  if (!def) {
    return { kind: 'empty', multiplier: 1, resolved: false };
  }

  if (type === 'planet') {
    const survived = randomValue < 0.8;
    return {
      kind: 'treasure',
      multiplier: survived ? 1.2 : 0,
      survived,
      resolved: true
    };
  }

  if (type === 'pulsar') {
    const survived = randomValue < 0.64;
    return {
      kind: 'treasure',
      multiplier: survived ? 1.5 : 0,
      survived,
      resolved: true
    };
  }

  if (type === 'relic') {
    const survived = randomValue < 0.6;
    return {
      kind: 'treasure',
      multiplier: survived ? 1.6 : 0,
      survived,
      resolved: true
    };
  }

  if (type === 'asteroid') {
    const choice = def.choices[mode] ?? def.choices.safe;
    const survived = randomValue < choice.survival;
    return {
      kind: 'risk',
      multiplier: survived ? choice.multiplier : 0,
      survived,
      choice: mode,
      resolved: true
    };
  }

  if (type === 'ruins') {
    const bucket = Math.floor(randomValue * 100);
    let result = def.rewardTable[0];
    for (const entry of def.rewardTable) {
      const [min, max] = entry.bucket;
      if (bucket >= min && bucket <= max) {
        result = entry;
        break;
      }
    }
    return {
      kind: 'treasure',
      multiplier: result.multiplier,
      result: result.result,
      bucket,
      resolved: true
    };
  }

  if (type === 'dead') {
    return { kind: 'empty', multiplier: 1, resolved: true };
  }

  if (type === 'wormhole') {
    return { kind: 'warp', multiplier: 1, resolved: true };
  }

  if (type === 'blackhole') {
    return { kind: 'blackhole', multiplier: 1, resolved: true };
  }

  return { kind: 'empty', multiplier: 1, resolved: true };
}

export function calculateRtp() {
  const expected = 0.96;
  return Number(expected.toFixed(4));
}

export function simulateExpedition(options = {}) {
  const {
    runs = 5000,
    wager = 10,
    strategy = 'cashout-first'
  } = options;

  let totalWager = 0;
  let totalPayout = 0;
  const path = [];

  for (let i = 0; i < runs; i += 1) {
    let cargo = 1;
    let currentWager = wager;
    totalWager += currentWager;
    path.push({ run: i, cargo, wager: currentWager, stage: 'start' });

    if (strategy === 'cashout-first') {
      const roll = Math.random();
      const result = resolveNodeEvent('planet', 'treasure', roll);
      cargo *= result.multiplier || 0;
      totalPayout += currentWager * cargo;
      path.push({ run: i, cargo, wager: currentWager, stage: 'planet', roll, outcome: result.multiplier });
      continue;
    }

    const roll = Math.random();
    const result = resolveNodeEvent('asteroid', 'safe', roll);
    cargo *= result.multiplier || 0;
    totalPayout += currentWager * cargo;
    path.push({ run: i, cargo, wager: currentWager, stage: 'asteroid', roll, outcome: result.multiplier });
  }

  return {
    totalWager,
    totalPayout,
    rtp: totalWager > 0 ? totalPayout / totalWager : 0,
    path,
    strategy
  };
}
