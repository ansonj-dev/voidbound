# VOIDBOUND — Chain Jam Vol. 1

**Chart the unknown. Escape the void.**

VOIDBOUND is a space-treasure-map casino game prototype for Chain Jam Vol. 1.

## Core loop

1. Select a wager.
2. Launch an expedition into an unexplored cosmic map.
3. Choose connected destinations.
4. Discover relics, planets, wormholes, asteroid fields and the black hole.
5. Grow the cargo multiplier.
6. Cash out, or risk the expedition by continuing.

The **Black Hole** is the signature mechanic: progressively deeper stages offer higher potential multipliers with rising loss probability.

## Verified local status

The current project has been validated locally with the project checks:

```bash
npm test
npm run rtp
npm run build
```

Fresh verification results:
- 6 tests passing
- RTP remains within the jam window
- Vite production build succeeds

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the Vite URL, typically http://localhost:5173/.

## Build

```bash
npm run build
npm run preview
```

## Chain integration status

This package is a **playable front-end MVP / simulator build**. The official Chain Jam page requires the final submission to implement the Chain Casino SDK exactly, including contract + bridge + manifest, local simulator compatibility, Chain VRF randomness, declared RTP, and the Jam widget.

The project already includes the required Jam widget script:

```html
<script async src="https://jam.chain.wtf/widget.js"></script>
```

The current `src/main.js` contains a local deterministic simulator adapter (`randomUnit`) so the game can be developed and tested without credentials. Before submission, replace that adapter and wager/payout flow with the exact `@chain/casino-sdk` contract/bridge/manifest structure from the official starter/coinflip example.

## RTP note

The UI/gameplay is intentionally separated from settlement. Do **not** declare the prototype's current local demo as the final RTP.

For the submission, define the complete state machine and paytable in the Chain contract, then run a large Monte Carlo simulation against the exact on-chain math. The final declared RTP must be between 93% and 98% and must match the actual paytable.

## Suggested final architecture

```text
VOIDBOUND UI
    |
    v
Chain Casino SDK
    |
    +--> Contract
    |      |
    |      +--> wager
    |      +--> request VRF
    |      +--> resolve node/event
    |      +--> calculate payout
    |
    +--> Chain VRF
    |
    +--> Bridge / manifest
    |
    v
Player wallet
```

## Important

The Chain Jam page says submissions are binary eligible: SDK compliance, local simulator, RTP 93–98%, casino wager/outcome/payout flow, standalone hosted demo, novelty, Jam widget and source access are all required.

Reference: https://jam.chain.wtf/
