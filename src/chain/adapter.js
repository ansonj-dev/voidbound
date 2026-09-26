export function createVoidboundAdapter(initialSeed = Date.now() >>> 0) {
  let seed = initialSeed >>> 0;
  const games = new Map();

  const randomUnit = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const contract = {
    launch({ wager, player = 'demo-wallet' }) {
      const gameId = `voidbound-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      const game = {
        gameId,
        player,
        wager,
        status: 'active',
        cargo: 1,
        blackDepth: 0,
        route: ['start'],
        createdAt: Date.now()
      };
      games.set(gameId, game);
      return { gameId, requestId: `vrf-${gameId}`, random: randomUnit() };
    },

    resolveNode({ gameId, nodeType, choice = 'safe' }) {
      const game = games.get(gameId);
      if (!game) throw new Error('Unknown game');

      const roll = randomUnit();
      let multiplier = 1;
      if (nodeType === 'planet' || nodeType === 'pulsar') multiplier = 1.2;
      if (nodeType === 'relic') multiplier = 1.6;
      if (nodeType === 'asteroid') {
        const table = {
          safe: { survival: 0.8, multiplier: 1.2 },
          risky: { survival: 0.48, multiplier: 2.0 },
          unknown: { survival: 0.24, multiplier: 4.0 }
        };
        const selected = table[choice] ?? table.safe;
        const survived = roll < selected.survival;
        multiplier = survived ? selected.multiplier : 0;
      }

      game.cargo *= multiplier || 1;
      game.route.push(nodeType);
      return {
        gameId,
        nodeType,
        randomWord: roll,
        multiplier,
        settled: true,
        cargo: game.cargo
      };
    },

    cashOut({ gameId }) {
      const game = games.get(gameId);
      if (!game) throw new Error('Unknown game');

      const payout = game.wager * game.cargo;
      game.status = 'settled';
      return {
        gameId,
        payout,
        cargo: game.cargo,
        status: 'settled'
      };
    }
  };

  return {
    randomUnit,
    contract,
    getState: () => ({ seed, gameCount: games.size, games: [...games.values()] })
  };
}
