export const SessionPhase = {
  NONE: 0,
  WAITING_RANDOMNESS: 1,
  WAITING_PLAYER_ACTION: 2,
  SETTLED: 3,
  FORFEITED: 4,
  CANCELLED: 5
};

export const DEFAULT_SNAPSHOT = {
  apiVersion: 1,
  integration: {
    chainId: 8453,
    slug: 'voidbound',
    gameAddress: '0x0000000000000000000000000000000000000000',
    manifest: {
      schemaVersion: 1,
      gameId: 'VoidboundGame',
      apiVersion: 1,
      defaultLocale: 'en',
      locales: {
        en: {
          name: 'VOIDBOUND',
          description: 'Cosmic expedition casino game.'
        }
      }
    }
  },
  wallet: {
    address: undefined,
    smartVaultAddress: undefined,
    status: 'ready'
  },
  token: {
    symbol: 'USDC',
    decimals: 6,
    iconUrl: ''
  },
  balances: {
    smartVaultBalance: '0'
  },
  casino: {
    availableLiquidity: '0',
    maxBetRiskBps: 1000,
    maxAllowedReservedProfit: '0',
    maxBetAmount: '0'
  },
  sessions: {
    items: []
  },
  ui: {
    locale: 'en',
    theme: 'dark',
    viewport: {
      availableHeight: 800
    }
  }
};
