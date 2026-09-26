/**
 * VOIDBOUND — Chain Casino SDK Guest Bridge
 *
 * Uses the real @chain/casino-sdk pattern via penpal postMessage RPC.
 * Mirrors the TypeScript source from casino-sdk/src/guest.ts for plain JS use.
 *
 * When running inside the Chain.wtf host iframe:
 *   - connectGameToHost() handshakes via penpal
 *   - hostApi gives access to openSession, submitAction, revealOutcome
 *   - setState callbacks receive live HostSnapshotV1 pushes (wallet, balance, sessions)
 *
 * When running standalone (Vercel demo, direct browser):
 *   - penpal handshake never resolves (no parent host)
 *   - game falls back to demo adapter (local simulator)
 */

import { WindowMessenger, connect } from 'penpal';

/**
 * Get the allowed parent origins for the penpal messenger.
 * Mirrors the SDK's getAllowedParentOrigins().
 */
function getAllowedParentOrigins() {
  if (typeof document === 'undefined' || !document.referrer) {
    return ['*'];
  }
  try {
    return [new URL(document.referrer).origin];
  } catch {
    return ['*'];
  }
}

/**
 * Connect the game iframe to the Chain.wtf host application.
 *
 * @param {object} methods - Guest API implementation
 * @param {function} methods.setState - Called with HostSnapshotV1 on every host push
 * @returns {import('penpal').Connection} penpal Connection with .promise resolving to HostApiV1
 */
export function connectGameToHost(methods = {}) {
  const setState = typeof methods.setState === 'function'
    ? methods.setState
    : async () => {};

  return connect({
    messenger: new WindowMessenger({
      remoteWindow: window.parent,
      allowedOrigins: getAllowedParentOrigins(),
    }),
    methods: {
      async setState(snapshot) {
        return setState(snapshot ?? null);
      },
    },
  });
}
