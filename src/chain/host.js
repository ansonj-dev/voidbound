const CHANNEL = 'voidbound-chain-host-bridge';

export function connectHostToGame({ iframe, childOrigin = '*', methods = {} }) {
  const hostMethods = {
    openSession: methods.openSession ?? (async (input) => ({ sessionKey: `demo:${Date.now()}`, transactionHash: `0x${'0'.repeat(64)}`, ...input })),
    submitAction: methods.submitAction ?? (async (input) => ({ transactionHash: `0x${'0'.repeat(64)}`, ...input })),
    cancelStuckRandomness: methods.cancelStuckRandomness ?? (async (input) => ({ transactionHash: `0x${'0'.repeat(64)}`, ...input })),
    revealOutcome: methods.revealOutcome ?? (async () => {})
  };

  const handleMessage = (event) => {
    const message = event.data;
    if (!message || message.channel !== CHANNEL || message.target !== 'host') return;
    if (message.type === 'guest:ready') {
      // the guest is ready; the host can push a snapshot when desired
    }
  };

  window.addEventListener('message', handleMessage);

  return {
    promise: Promise.resolve({
      setState: async (snapshot) => {
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage({
          channel: CHANNEL,
          type: 'host:update',
          target: 'guest',
          snapshot
        }, childOrigin);
      }
    }),
    destroy: () => {
      window.removeEventListener('message', handleMessage);
    },
    methods: hostMethods
  };
}
