# VOIDBOUND — Chain Jam Vol. 1

**Chart the unknown. Escape the void.**

VOIDBOUND is a space-treasure-map casino game built for Chain Jam Vol. 1. Navigate a branching cosmic star chart, collect cargo multipliers from relics, pulsars, and ancient ruins, then decide when to cash out — before the void takes everything.

---

## Gameplay

1. Select a wager (1 / 5 / 10 / 25 U).
2. Launch an expedition into Sector Ω-7.
3. Click connected nodes to travel the star chart.
4. Discover planets, relics, pulsars, wormholes, asteroid fields, ruins, and the black hole.
5. Each discovery grows your cargo multiplier.
6. Cash out at any time — or push deeper for higher multipliers at rising risk.

### Node types

| Node | Risk | Reward |
|---|---|---|
| 🪐 Planet | 20% loss | 1.2× |
| 💎 Relic | 40% loss | 1.6× |
| ⭐ Pulsar | 36% loss | 1.5× |
| ☄️ Asteroid | Choice: Safe / Risky / Unknown | 1.2× / 2.0× / 4.0× |
| 🌀 Wormhole | None | Teleport to random neighbour |
| 👽 Ancient Ruins | Bucket roll | 0× / 1.6× / 4.0× / 24.0× |
| 🌑 Dead World | None | Pass-through |
| 🌌 Black Hole | Escalating | 5-stage dive, up to 8× |

### The Black Hole

The signature mechanic. Five stages of escalating risk:

| Stage | Survival | Multiplier |
|---|---|---|
| Outer Disk | 80% | 1.2× |
| Inner Orbit | 60% | 1.6× |
| Photon Ring | 40% | 2.4× |
| Event Horizon | 24% | 4.0× |
| Singularity | 12% | 8.0× |

Escape at any stage to lock in your cargo, or descend to the singularity for a legendary payout.

---

## Features

- **Animated star map** — 220 twinkling stars, 6 drifting nebula clouds, parallax drift
- **Live edge animations** — reachable routes glow with pulsing energy and a traveling light dot
- **Node pulse rings** — connected nodes pulse outward to guide navigation
- **Black hole orbital rings** — dual counter-rotating dashed rings on the BH node
- **Ship warp trails** — expanding rings spawn on departure
- **Screen flash effects** — cyan flash on wins, red flash on loss
- **Value bump animations** — cargo and balance numbers scale on change
- **14-sound synthesized audio engine** — every node type, event, and action has its own layered Web Audio sound, built from scratch with no audio files
- **Ambient space drone** — fades in on launch, fades out on cashout or loss
- **Chain guest SDK** — `connectGameToHost()` wired for iframe host integration
- **Provably fair RNG** — LCG seeded per-expedition (Chain VRF for production)
- **Declared RTP: 96%**

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Run tests & RTP simulation

```bash
npm test        # engine unit tests
npm run rtp     # Monte Carlo RTP simulation
```

---

## Chain integration

The game ships with a full in-repo SDK bridge:

| File | Purpose |
|---|---|
| `src/chain/guest.js` | `connectGameToHost()` — guest iframe bridge, posts `guest:ready`, handles `host:update` snapshots |
| `src/chain/host.js` | `connectHostToGame()` — host-side bridge for embedding |
| `src/chain/adapter.js` | Local deterministic simulator (LCG-based) for dev/testing |
| `src/chain/types.js` | `SessionPhase`, `DEFAULT_SNAPSHOT` type definitions |
| `public/game.manifest.json` | Chain Jam manifest — `openSession`, `submitAction`, `resize` capabilities |

`main.js` uses `connectGameToHost()` at startup. When embedded inside a Chain host iframe, the wallet address and smart vault balance are pulled from the host snapshot automatically.

The Jam widget is included in `index.html`:

```html
<script async src="https://jam.chain.wtf/widget.js"></script>
```

### Pre-submission checklist

- [ ] Replace `createVoidboundAdapter()` with the official `@chain/casino-sdk` contract + VRF flow
- [ ] Wire `openSession` / `submitAction` through `hostApi` returned by `connectGameToHost()`
- [ ] Run final Monte Carlo against on-chain math, confirm RTP 93–98%
- [ ] Replace placeholder asset URLs in `public/game.manifest.json`
- [ ] Host standalone demo

### Suggested architecture

```
VOIDBOUND UI
    │
    ▼
connectGameToHost() ← guest.js
    │
    ▼
Chain Casino SDK
    ├── Contract (wager → VRF request → resolve → payout)
    ├── Chain VRF
    └── Bridge / manifest
    │
    ▼
Player wallet
```

---

## Project structure

```
voidbound/
├── index.html                  # App shell, fonts, Jam widget
├── public/
│   └── game.manifest.json      # Chain Jam manifest
├── src/
│   ├── main.js                 # Game loop, rendering, audio, SDK wiring
│   ├── style.css               # All visual design & animations
│   ├── chain/
│   │   ├── adapter.js          # Local simulator
│   │   ├── guest.js            # Chain guest SDK bridge
│   │   ├── host.js             # Chain host SDK bridge
│   │   └── types.js            # SessionPhase, DEFAULT_SNAPSHOT
│   └── game/
│       ├── engine.js           # Node defs, probability tables, RTP math
│       ├── engine.test.js      # Unit tests
│       └── rtp.js              # Monte Carlo simulator
└── scripts/
    └── rtp_sim.py              # Python RTP simulation
```

---

Reference: [https://jam.chain.wtf/](https://jam.chain.wtf/)
