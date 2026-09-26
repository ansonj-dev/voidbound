const CHANNEL = 'voidbound-chain-host-bridge';

export function connectGameToHost(methods = {}) {
  const setState = typeof methods.setState === 'function' ? methods.setState : async () => {};

  const handleMessage = (event) => {
    const message = event.data;
    if (!message || message.channel !== CHANNEL || message.target !== 'guest') return;
    if (message.type === 'host:update') {
      setState(message.snapshot ?? null);
    }
  };

  window.addEventListener('message', handleMessage);
  window.parent.postMessage({ channel: CHANNEL, type: 'guest:ready', target: 'host' }, '*');

  const hostApi = {
    openSession: async ({ wager, gameData }) => ({
      sessionKey: `demo:${Date.now()}`,
      transactionHash: `0x${'0'.repeat(64)}`,
      wager,
      gameData
    }),
    submitAction: async ({ sessionId, actionData }) => ({
      transactionHash: `0x${'0'.repeat(64)}`,
      sessionId,
      actionData
    }),
    cancelStuckRandomness: async ({ sessionId }) => ({
      transactionHash: `0x${'0'.repeat(64)}`,
      sessionId
    }),
    revealOutcome: async ({ sessionId }) => ({ sessionId })
  };

  return {
    promise: Promise.resolve(hostApi),
    destroy: () => {
      window.removeEventListener('message', handleMessage);
    }
  };
}
