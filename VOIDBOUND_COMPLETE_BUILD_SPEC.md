# VOIDBOUND — Complete Build & Submission Specification

> **Project:** VOIDBOUND  
> **Tagline:** Chart the unknown. Steal from the universe. Escape the void.  
> **Hackathon:** Chain Jam Vol. 1  
> **Build target:** A polished, standalone, provably-fair cosmic treasure-map casino game built on Chain Casino SDK.  
> **Document status:** Full product + game-design + technical + mathematical + submission specification.  
> **Last verified against official Chain Jam page:** September 26, 2026.

---

## 0. Executive Summary

VOIDBOUND is a short-session cosmic exploration casino game.

The player places a wager and launches a spacecraft into an unexplored star sector. A connected map contains planets, ancient relics, pulsars, asteroid fields, wormholes, ruins, dead worlds, and a black hole.

The player chooses where to travel. Each discovered event can increase the expedition's potential payout or create a risk decision. At any appropriate point the player can cash out. The signature mechanic is the **Black Hole**: the player may escape with accumulated cargo or enter progressively deeper gravitational stages for larger possible multipliers and a rising probability of losing the entire expedition.

The game is intentionally not a reskin of roulette, blackjack, dice, limbo, crash, Plinko, or another existing casino game. The intended novelty is the combination of:

- spatial route selection;
- exploration and discovery;
- accumulating treasure;
- player-selected risk levels;
- wormhole route changes;
- a multi-stage black-hole risk sequence;
- immediate cash-out decisions;
- provably fair Chain VRF outcomes.

The visual goal is a premium cinematic sci-fi game rather than a generic Web3 dashboard.

---

# 1. Official Chain Jam Requirements

The official Chain Jam page currently states that submissions close **September 27, 2026 at 23:59 UTC**. The page lists a **$1,000 prize pool** split among the top three: $500 / $350 / $150. It also states that any submission can potentially be integrated into chain.wtf and, if integrated, receives **25% of the revenue it generates for as long as it runs**. The exact revenue definition is governed by the event terms; the FAQ describes it generally as bets minus wins.

Source: https://jam.chain.wtf/

## 1.1 Eligibility gates

All of these must pass:

- Implement the Chain casino SDK exactly.
- Include the required contract.
- Include the required bridge.
- Include the required manifest.
- Run correctly in the Chain local simulator.
- Load near-instantly.
- Use theoretical RTP between **93% and 98%**.
- Declare RTP that matches the actual paytable/math.
- Be recognizably a casino game:
  - wager;
  - outcome;
  - payout.
- Hosted page must run standalone outside the chain.wtf iframe.
- Concept must be novel.
- Must not be a classic casino game.
- Must not be an existing original/copy/clone.
- Include the Jam widget.
- Submit the Jam form.
- Provide source access for review.

The official page describes eligibility as binary: missing a gate can make the game ineligible.

## 1.2 Not accepted

Do NOT turn VOIDBOUND into:

- blackjack;
- roulette;
- baccarat;
- Plinko;
- ordinary dice;
- limbo;
- crash;
- a crash clone;
- a Mines clone;
- a copy of an existing casino game;
- a theme-only reskin of an existing game.

The space theme is not enough. The **mechanic** must remain distinctive.

## 1.3 Judging criteria

The official page says the Chain team scores eligible games on:

### Novelty
Is there a similar game on the market?

### Fun
Would somebody still want to play after many sessions?

### Simplicity
Can a new player understand it quickly without a manual?

### Visual & sound
Does it feel like a real game?

The page explicitly says AI is allowed for code and assets, but warns against low-quality "AI slop". Use AI as a production tool, then manually curate the final experience.

---

# 2. Event Timeline

According to the current official page:

- **Submissions close:** September 27, 2026, 23:59 UTC
- **Judging:** September 28 – October 7
- **Winners announced:** October 8
- Prize payments are listed for October 8.

Do not rely on this document instead of the live official page. Re-check the official page immediately before submission.

Official page:
https://jam.chain.wtf/

---

# 3. VOIDBOUND Product Vision

## One-sentence pitch

> **VOIDBOUND is a provably-fair space treasure expedition where every jump deeper into the unknown turns your growing cargo into a higher-stakes decision.**

## Player fantasy

The player should feel:

> "I found something valuable. Do I leave with it, or risk the treasure by going deeper?"

This is the central emotional loop.

## Desired session length

Target:

- 20–90 seconds for a normal expedition.
- 10–20 seconds for a quick loss.
- 60–120 seconds for a deep Black Hole run.

The game should be understandable within approximately 10 seconds.

---

# 4. Core Gameplay Loop

```text
CONNECT WALLET
      |
      v
SELECT WAGER
      |
      v
LAUNCH EXPEDITION
      |
      v
GENERATE / LOAD COSMIC MAP
      |
      v
CHOOSE CONNECTED DESTINATION
      |
      v
CHAIN VRF RESOLVES EVENT
      |
      +-----------------------------+
      |                             |
      v                             v
TREASURE / EVENT              RISK EVENT
      |                             |
      v                             v
INCREASE CARGO                 PLAYER CHOICE
      |                             |
      +--------------+--------------+
                     |
                     v
              CONTINUE / CASH OUT
                     |
                     v
              BLACK HOLE?
                 /      \
               YES       NO
                |         |
                v         v
          DEEP RISK     FINAL RELIC
                |         |
                +----+----+
                     |
                     v
                SETTLEMENT
                     |
                     v
             WALLET PAYOUT
```

---

# 5. Game Screen

The primary screen should contain:

## Left / main map

A cinematic starfield with:

- connected route lines;
- planets;
- relics;
- wormholes;
- asteroid fields;
- ruins;
- pulsars;
- black hole;
- player ship.

## Top

- VOIDBOUND logo;
- wallet state;
- balance;
- optional navigation;
- current expedition status.

## Right panel

- current cargo multiplier;
- current wager;
- potential payout;
- cash-out button;
- expedition log.

## Bottom / event modal

When a node is selected:

- event title;
- short explanation;
- visual;
- current cargo;
- available choices.

---

# 6. Map Design

The first production map can use 10–12 nodes.

Example:

```text
                              💎 FINAL RELIC
                                   |
                    🪐-------------+
                   /                 \
          💎 RELIC                 🌑 DEAD WORLD
         /     \                      |
🚀 START       🌀 WORMHOLE ---------+
    \             |
     \            ⭐ PULSAR
      \
       ☄️ ASTEROID ---- 👽 RUINS
             \          /
              \        /
                🌌 BLACK HOLE
```

The final implementation should avoid a completely deterministic route every game.

There are two good approaches:

### Approach A — Fixed visual map, randomized event outcomes

Simplest and safest for the deadline.

The map layout stays fixed, but Chain VRF controls:

- treasure tier;
- event result;
- risk result;
- wormhole destination;
- black-hole survival.

### Approach B — Seeded procedural map

More novel but more complex.

Use a VRF-derived seed to select:

- node types;
- route variants;
- treasure tiers;
- special nodes.

For the first submission, prefer **Approach A** unless the Chain SDK makes procedural state easy.

---

# 7. Node Types

## 7.1 Planet

Low-risk treasure.

Example:

> Planet Cache  
> A quiet world hides precursor crystals.

Illustrative factor:

- success probability: 80%
- success multiplier: 1.20×

Expected factor:

`0.80 × 1.20 = 0.96`

---

## 7.2 Ancient Relic

Medium/high reward.

Possible outcomes:

- common relic;
- rare relic;
- epic relic.

Do not make the final math dependent on uncontrolled UI randomness.

Every outcome must be derived from the Chain VRF value.

---

## 7.3 Pulsar

A compact, exciting reward node.

Example:

- 64% chance of 1.50×
- 36% chance of 0×

Expected factor:

`0.64 × 1.50 = 0.96`

---

## 7.4 Asteroid Field

The player chooses risk.

### SAFE

- 80% success
- 1.20× success factor
- 20% loss

Expected:

`0.80 × 1.20 = 0.96`

### RISKY

- 48% success
- 2.00× success factor
- 52% loss

Expected:

`0.48 × 2.00 = 0.96`

### UNKNOWN

- 24% success
- 4.00× success factor
- 76% loss

Expected:

`0.24 × 4.00 = 0.96`

This gives the player a meaningful choice while preserving the same theoretical expected factor for each individual gamble.

---

# 8. Wormhole

The wormhole should alter the player's route.

Possible behavior:

```text
CURRENT NODE
     |
     v
  WORMHOLE
     |
     +-----> DESTINATION A
     |
     +-----> DESTINATION B
     |
     +-----> DESTINATION C
```

The destination should be selected using Chain VRF.

Important:

The frontend must not secretly decide the result.

The contract/SDK flow must consume the verified random word.

---

# 9. Ancient Ruins

A mystery event.

Use a controlled reward table.

Example:

| VRF bucket | Result | Factor |
|---:|---|---:|
| 0–69 | Empty | 0× |
| 70–89 | Artifact | 1.60× |
| 90–98 | Rare artifact | 4.00× |
| 99 | Cosmic artifact | 24.00× |

This example is **not automatically a 96% RTP table**. Calculate the exact expected value before using it.

General formula:

```text
RTP = Σ(probability_i × payout_i)
```

Do not copy example values into the production contract without recalculating.

---

# 10. Dead World

A low-interaction node.

Purpose:

- pacing;
- route variety;
- visual atmosphere.

It can either:

1. produce no change and allow the player to continue; or
2. contain a small controlled risk/reward event.

If it produces no financial outcome, document that it is a traversal event rather than a payout event.

---

# 11. Black Hole — Signature Mechanic

This is the feature that should make VOIDBOUND memorable.

When the player reaches the Black Hole:

```text
                EVENT HORIZON

          Current Cargo: 2.40×

              ESCAPE
                |
                +----------------
                                 |
                              BLACK HOLE
                                 |
                         ENTER OUTER DISK
                                 |
                         ENTER INNER ORBIT
                                 |
                         PHOTON RING
                                 |
                         EVENT HORIZON
                                 |
                           SINGULARITY
```

At every stage:

### ESCAPE

The player takes the current cash-out value.

### ENTER

The player accepts another VRF gamble.

---

# 12. Black Hole Mathematics

The cleanest production model is to make each Black Hole stage a binary gamble whose expected continuation factor is exactly 0.96.

For example:

| Stage | Survival | Success factor | Expected factor |
|---|---:|---:|---:|
| Outer Disk | 80% | 1.20× | 0.96 |
| Inner Orbit | 60% | 1.60× | 0.96 |
| Photon Ring | 40% | 2.40× | 0.96 |
| Event Horizon | 24% | 4.00× | 0.96 |
| Singularity | 12% | 8.00× | 0.96 |

Formula:

`Expected factor = survival probability × success factor`

Example:

`0.40 × 2.40 = 0.96`

This is intentionally simple enough to audit.

## Critical rule

The actual contract must use integer/fixed-point arithmetic appropriate to the Chain SDK.

Do not use JavaScript floating-point calculations as the source of truth.

The contract must be the authoritative settlement layer.

---

# 13. RTP Strategy

Target declared RTP:

## **96.00%**

This is inside the required 93–98% range.

The conceptual model is:

```text
Expected payout = wager × 0.96
```

for each independent risk resolution.

However, the complete expedition is a decision tree.

Therefore the final RTP verification must model:

- route selection;
- every node;
- every player choice;
- cash-out opportunities;
- Black Hole decisions;
- all final payouts;
- all losing states.

Do not claim 96% merely because individual events have 96% expected value.

---

# 14. RTP Verification

Build a Monte Carlo simulator.

Minimum target:

**10,000,000 simulated expeditions**

Better:

**50,000,000+**

Run:

```text
for each simulated expedition:

    wager = 1

    choose a defined strategy

    generate random outcome

    follow the exact contract state machine

    record payout

RTP = total payout / total wager
```

Test multiple strategies:

### Strategy 1

Cash out after first successful treasure.

### Strategy 2

Always continue until final relic.

### Strategy 3

Always choose SAFE.

### Strategy 4

Always choose RISKY.

### Strategy 5

Always choose UNKNOWN.

### Strategy 6

Enter every Black Hole stage.

### Strategy 7

Escape immediately from Black Hole.

If the game claims a single RTP, the declared mathematical model and paytable must be consistent with the actual rules.

Document the interpretation clearly.

---

# 15. Important RTP Design Principle

Do NOT make the game:

```text
random reward
+
random reward
+
random reward
+
random reward
```

without calculating the complete expected value.

Because multiplicative rewards compound.

If:

```text
E(A) = 0.96
E(B) = 0.96
```

then two forced independent continuation stages have:

```text
0.96 × 0.96 = 0.9216
```

or 92.16%.

That can fall below the required 93% floor.

Therefore the final state machine must be analyzed as a whole.

---

# 16. Recommended Production Math Architecture

Use a **single-step settlement model** wherever possible.

Instead of having the contract blindly multiply the current cargo many times, consider representing the current expedition state as:

```text
wager
+
route state
+
risk state
+
locked payout multiplier
```

Then each VRF resolution selects the next state.

The contract always knows:

```text
current_state
random_word
player_action
next_state
payout_if_terminal
```

This makes the game easier to audit.

---

# 17. Randomness

The official Chain Jam page says outcomes must use Chain's decentralized VRF.

Do NOT:

- use `Math.random()`;
- use browser randomness for settlement;
- use timestamps;
- generate the final outcome on a backend;
- trust frontend calculations.

The official page says the local simulator includes a real VRF node and that production outcomes use Chain's decentralized VRF.

The intended flow is:

```text
Player action
      |
      v
Casino SDK
      |
      v
Contract
      |
      v
Chain VRF request
      |
      v
Verified random word
      |
      v
Contract settlement
      |
      v
Payout
      |
      v
Frontend animation
```

The frontend should only animate the already-determined result.

---

# 18. Chain SDK Integration

The official Chain Jam page instructs builders to:

1. install `@chain/casino-sdk`;
2. fork the Coinflip example;
3. use the supplied contract;
4. use the supplied frontend;
5. use the supplied manifest;
6. develop against the local simulator.

Do not invent an SDK API from memory.

Start from the official Coinflip example and adapt its exact:

- package versions;
- contract interface;
- bridge;
- manifest;
- simulator commands;
- VRF request/settlement flow.

Official Chain Jam page:

https://jam.chain.wtf/

## Integration rule

The Chain starter/example is the source of truth for API syntax.

VOIDBOUND's custom game logic sits on top of that architecture.

---

# 19. Recommended Repository Structure

```text
voidbound/
│
├── README.md
├── package.json
├── .gitignore
├── .env.example
│
├── app/
│   ├── index.html
│   ├── src/
│   │   ├── main.ts
│   │   ├── game/
│   │   │   ├── state.ts
│   │   │   ├── map.ts
│   │   │   ├── events.ts
│   │   │   ├── blackhole.ts
│   │   │   └── settlement.ts
│   │   ├── chain/
│   │   │   ├── casino.ts
│   │   │   ├── wallet.ts
│   │   │   └── adapter.ts
│   │   ├── ui/
│   │   │   ├── Map.ts
│   │   │   ├── HUD.ts
│   │   │   ├── EventModal.ts
│   │   │   ├── BlackHole.ts
│   │   │   └── FlightLog.ts
│   │   ├── audio/
│   │   └── styles/
│   └── public/
│       ├── og-image.png
│       └── assets/
│
├── contract/
│   └── [Chain starter structure]
│
├── manifest/
│   └── [Chain starter manifest]
│
├── scripts/
│   ├── rtp-simulation.ts
│   ├── validate-paytable.ts
│   └── build-submission.ts
│
└── tests/
    ├── game-state.test.ts
    ├── paytable.test.ts
    └── rtp.test.ts
```

The exact contract/manifest folder names should follow the official Chain starter.

---

# 20. Frontend Architecture

## State

```ts
type ExpeditionState = {
  active: boolean;
  wager: bigint;
  currentNode: string;
  cargoMultiplier: FixedPoint;
  discoveredNodes: string[];
  status: "idle" | "pending" | "resolved" | "lost" | "cashed_out";
  blackHoleDepth: number;
  pendingRequestId?: string;
};
```

Use the numeric type expected by the SDK/contract.

Do not use JavaScript floating point for money or authoritative multiplier calculations.

---

# 21. UI State Machine

```text
IDLE
 |
 | Launch
 v
WAGER_PENDING
 |
 | transaction confirmed
 v
MAP_ACTIVE
 |
 | select node
 v
OUTCOME_PENDING
 |
 | VRF result
 v
EVENT_RESULT
 |
 +------> TREASURE
 |
 +------> RISK
 |
 +------> WORMHOLE
 |
 +------> BLACK_HOLE
 |
 v
MAP_ACTIVE

BLACK_HOLE
 |
 +--> ESCAPE --> CASHOUT
 |
 +--> DEEPER --> OUTCOME_PENDING

CASHOUT
 |
 v
SETTLED

LOSS
 |
 v
SETTLED
```

---

# 22. Never Let the UI Decide the Outcome

Bad:

```js
const won = Math.random() < 0.8;
```

Good:

```text
Player action
   ↓
SDK / contract
   ↓
VRF
   ↓
verified result
   ↓
frontend
```

The browser should be treated as untrusted.

---

# 23. Visual Design

## Theme

**Premium cinematic sci-fi.**

Palette:

- near-black space;
- electric cyan;
- ultraviolet;
- deep blue;
- gold for treasure;
- red/orange for danger.

## Typography

Use:

- futuristic display font for headings;
- highly readable sans-serif for controls.

Possible:

- Orbitron;
- Space Grotesk.

Do not overuse futuristic fonts.

---

# 24. Visual Hierarchy

The player must immediately understand:

```text
WHERE AM I?
     ↓
WHAT CAN I WIN?
     ↓
WHAT CAN I RISK?
     ↓
WHAT SHOULD I DO?
```

Avoid:

- giant wallet information;
- excessive Web3 jargon;
- token logos everywhere;
- complicated charts;
- multiple competing panels.

The game should feel like a game first.

---

# 25. Black Hole Presentation

This should be the most polished screen.

Normal:

```text
🌌
```

Approach:

```text
stars bend
      ↓
screen vignette
      ↓
music lowers
      ↓
gravitational distortion
```

Inner orbit:

```text
UI subtly shakes
```

Event horizon:

```text
most stars disappear
```

Singularity:

```text
brief black screen
        ↓
RESULT
```

If the player escapes:

```text
BLACK HOLE ESCAPED
Cargo secured: 8.40×
```

---

# 26. Sound Design

Minimum:

- launch sound;
- node-selection sound;
- treasure sound;
- wormhole sound;
- danger sound;
- black-hole ambience;
- cash-out sound;
- loss sound.

Use subtle ambient music.

Do not make every click loud.

---

# 27. Treasure System

Use treasure primarily as a visual representation of payout state.

Example:

| Tier | Artifact | Visual |
|---|---|---|
| Common | Alien Crystal | green |
| Rare | Quantum Core | blue |
| Epic | Dyson Fragment | purple |
| Legendary | Singularity Shard | gold |
| Cosmic | The First Star | white/gold |

Important:

The rarity names do not independently determine mathematical RTP.

The contract's exact paytable does.

---

# 28. Player Experience

First-time player:

```text
1. Choose 10 U
2. Press Launch
3. Click a glowing node
4. See result
5. Understand cargo multiplier
6. Decide continue/cash out
```

No manual should be required.

A small "How to Play" overlay can explain:

> Explore → Find treasure → Risk deeper → Cash out.

---

# 29. Wallet Experience

The wallet flow should be as simple as possible.

Show:

```text
WALLET
0x3aF...7B9C

BALANCE
125.40
```

Avoid forcing the player through unnecessary forms.

All real-money settlement should use the Chain SDK's supported wallet/payment flow.

---

# 30. Jam Widget

The official page requires the Jam widget.

Add exactly the official script:

```html
<script async src="https://jam.chain.wtf/widget.js"></script>
```

The page says the widget proves the entry and tracks plays.

No widget = no submission.

---

# 31. Standalone Hosting

The hosted page must work outside the Chain iframe.

Good options:

- Vercel;
- Netlify;
- another static host;
- your own server.

The official page says the game is a static build and must be playable directly from its URL.

Test:

```text
https://your-domain.com
```

in a completely separate browser tab.

Do not test only inside an iframe.

---

# 32. og:image

Create a:

```text
1200 × 630
```

social preview image.

Suggested composition:

```text
VOIDBOUND
      |
spaceship
      |
black hole
      |
cosmic map
      |
"CHART THE UNKNOWN"
```

The official page says the gallery uses `og:image` when available.

---

# 33. Performance

Target:

- initial page load < 2 seconds on a reasonable connection;
- no huge 4K textures;
- compressed images;
- lazy-load optional audio;
- avoid giant JavaScript libraries;
- avoid 3D engine unless necessary.

A 2D/2.5D interface is enough.

---

# 34. Security Requirements

Never trust:

- frontend wager;
- frontend payout;
- frontend multiplier;
- frontend random result;
- frontend wallet balance.

The contract/SDK should enforce:

- wager validity;
- allowed state transitions;
- VRF result;
- payout calculation;
- settlement;
- replay protection;
- request state.

Do not add a backend as an authority for game outcomes.

---

# 35. Contract Design

Conceptually:

```text
launch(wager)
    |
    +--> validate wager
    +--> lock game state
    +--> request VRF
```

Then:

```text
fulfillRandomness(requestId, randomWord)
    |
    +--> verify pending game
    +--> resolve requested action
    +--> update state
    +--> calculate payout
    +--> settle
```

Cashout:

```text
cashOut(gameId)
    |
    +--> verify player
    +--> verify state
    +--> calculate locked payout
    +--> settle
```

Never allow:

```text
frontend -> arbitrary payout
```

---

# 36. Contract Math

Use integer/fixed-point arithmetic.

For example:

```text
MULTIPLIER_SCALE = 1_000_000
```

Then:

```text
1.20× = 1_200_000
1.60× = 1_600_000
4.00× = 4_000_000
```

Expected value:

```text
EV = probability × multiplier
```

Use exact integer representations whenever possible.

---

# 37. Example Risk Table

This is a design reference:

| Risk | Success probability | Success multiplier | Expected factor |
|---|---:|---:|---:|
| Safe | 80% | 1.20× | 0.96 |
| Risky | 48% | 2.00× | 0.96 |
| Unknown | 24% | 4.00× | 0.96 |

The contract should encode probabilities as integer ranges.

Example concept:

```text
randomWord % 10000

0–7999      SAFE success
8000–9999   SAFE loss
```

Do this inside the contract logic after receiving the verified random word.

---

# 38. Black Hole Example

| Stage | Success | Reward factor |
|---|---:|---:|
| Outer Disk | 80% | 1.20× |
| Inner Orbit | 60% | 1.60× |
| Photon Ring | 40% | 2.40× |
| Event Horizon | 24% | 4.00× |
| Singularity | 12% | 8.00× |

Every row:

```text
probability × multiplier = 0.96
```

Again, the entire game tree still requires final Monte Carlo verification.

---

# 39. Important Issue With Multipliers

Do not accidentally do:

```text
cargo = cargo × 1.20
cargo = cargo × 1.60
cargo = cargo × 2.40
```

and assume RTP is still 96%.

Multipliers compound.

The final contract must define whether each node:

1. multiplies a locked current value;
2. changes a state multiplier;
3. creates a terminal payout;
4. or represents a new independent wager.

Choose one model and mathematically verify it.

---

# 40. Recommended Final Settlement Model

For simplicity, use:

```text
current locked value
```

and define every risk action as:

```text
SUCCESS:
new locked value = current locked value × factor

FAILURE:
new locked value = 0
```

Cashout:

```text
payout = current locked value
```

But the RTP implications must be simulated across all possible paths.

A safer alternative for strict auditability is to define a state table in which each state has a mathematically specified terminal payout distribution.

---

# 41. Testing

## Unit tests

Test:

- every node type;
- every state transition;
- every Black Hole stage;
- cashout;
- loss;
- invalid action;
- duplicate action;
- invalid request;
- pending VRF;
- payout calculation.

## Boundary tests

Test:

- minimum wager;
- maximum wager;
- zero wager;
- wager > balance;
- maximum multiplier;
- final node;
- Black Hole final stage.

## Randomness tests

Use known VRF values:

```text
random = 0
random = 1
random = max
random = boundary - 1
random = boundary
```

Verify bucket assignment.

---

# 42. RTP Test

Create a dedicated command:

```bash
npm run rtp
```

Output:

```text
VOIDBOUND RTP SIMULATION

Games:        10,000,000
Total wager:  10,000,000
Total payout:  9,6xx,xxx.xx

Observed RTP: 95.xx%
Target RTP:   96.00%

STATUS: PASS
```

Use enough trials to make the result statistically meaningful.

Do not confuse observed Monte Carlo RTP with theoretical RTP.

The declared RTP should come from the exact mathematical paytable.

---

# 43. Submission Checklist

## Product

- [ ] Game has unique mechanic.
- [ ] Game is recognizably a casino game.
- [ ] Wager exists.
- [ ] Outcome exists.
- [ ] Payout exists.
- [ ] Cashout exists.
- [ ] Black Hole is functional.
- [ ] Game can be completed.
- [ ] No placeholder screens.
- [ ] No dead buttons.
- [ ] No broken animations.

## Chain

- [ ] `@chain/casino-sdk` installed.
- [ ] Official Coinflip starter/fork used as integration base.
- [ ] Contract implemented.
- [ ] Bridge implemented.
- [ ] Manifest implemented.
- [ ] Chain VRF used.
- [ ] Local simulator works.
- [ ] Production build works.
- [ ] Settlement is on-chain.
- [ ] No frontend randomness determines payouts.

## RTP

- [ ] Mathematical paytable documented.
- [ ] Theoretical RTP calculated.
- [ ] RTP is 93–98%.
- [ ] Declared RTP matches actual implementation.
- [ ] Monte Carlo simulation completed.
- [ ] All major player strategies tested.

## Frontend

- [ ] Standalone URL works.
- [ ] Responsive design.
- [ ] Fast initial load.
- [ ] Wallet flow works.
- [ ] Wager UI works.
- [ ] Map works.
- [ ] Event modal works.
- [ ] Cashout works.
- [ ] Error handling works.
- [ ] Loading states work.

## Jam

- [ ] Jam widget installed.
- [ ] Widget loads.
- [ ] Game URL is public.
- [ ] Game works outside iframe.
- [ ] `og:image` created.
- [ ] Source access provided.
- [ ] Pitch written.
- [ ] Declared RTP entered.
- [ ] Discord entered.
- [ ] X entered.
- [ ] Telegram entered.
- [ ] Submission checked.

---

# 44. README Pitch

Use this as the project description:

> **VOIDBOUND** is a provably-fair cosmic treasure expedition built for Chain Jam. Players wager before launching into an unexplored star sector, then navigate a branching cosmic map filled with relics, pulsars, asteroid fields, wormholes and ancient ruins. Every discovery changes the expedition's potential payout. The signature Black Hole mechanic forces the ultimate decision: escape with the treasure you've secured, or cross deeper into the event horizon for increasingly dangerous rewards. Chain VRF determines outcomes and the Chain Casino SDK handles wager and settlement.

---

# 45. Short Pitch

> **Explore the unknown. Find impossible treasure. Decide when to escape.**

---

# 46. 30-Second Demo Script

### 0–5 seconds

Show the galaxy.

> "This is VOIDBOUND."

### 5–10 seconds

Select:

```text
10 U
```

Press:

```text
LAUNCH EXPEDITION
```

### 10–17 seconds

Choose Planet.

Show:

```text
PLANET CACHE
+1.20×
```

### 17–22 seconds

Move to asteroid.

Show:

```text
SAFE
RISKY
UNKNOWN
```

Choose RISKY.

### 22–27 seconds

Reach Black Hole.

Show:

```text
2.40×

ESCAPE
OR
ENTER
```

### 27–30 seconds

Choose ENTER.

Black Hole animation.

End with:

```text
THE VOID DECIDES
```

Then show the on-chain result.

---

# 47. What Makes VOIDBOUND Different

The important distinction is not:

> "It's a space casino."

The distinction is:

> **The player's wager becomes an expedition state, and the player navigates a spatial risk/reward graph before deciding when to crystallize the expedition into a payout.**

The Black Hole adds a recognizable signature moment.

The map adds spatial decision-making.

The treasure system adds discovery.

The cashout adds tension.

VRF supplies the unpredictable outcome.

---

# 48. What NOT to Build

Because the deadline is extremely close, do not spend time on:

- social login;
- profile system;
- DAO;
- NFTs;
- token launch;
- leaderboard unless already trivial;
- achievements;
- complex backend;
- chat;
- AI assistant;
- procedural 3D galaxy;
- multiplayer;
- mobile app;
- database;
- analytics dashboard;
- custom blockchain;
- elaborate lore website.

These do not help the eligibility gates enough to justify their development cost.

---

# 49. Priority Order

If time is limited:

## P0 — Must have

1. Chain starter works.
2. Contract works.
3. VRF works.
4. Wager works.
5. Outcome works.
6. Payout works.
7. RTP verified.
8. Standalone URL works.
9. Jam widget works.

## P1 — Critical polish

10. Map.
11. Black Hole.
12. Treasure visuals.
13. Cashout UX.
14. Sound.
15. Mobile responsiveness.

## P2 — Nice to have

16. Procedural map.
17. Leaderboard.
18. Additional lore.
19. More artifact tiers.
20. Extra animation.

---

# 50. Development Sequence

## Phase 1 — Chain foundation

Start from the official Coinflip example.

Do not build VOIDBOUND from an empty repository.

Get:

```text
install
↓
local simulator
↓
coinflip example
↓
contract
↓
frontend
↓
manifest
```

working first.

---

## Phase 2 — Replace coinflip mechanics

Replace:

```text
heads/tails
```

with:

```text
player action
+
game state
+
VRF
+
state resolution
```

Keep the Chain plumbing intact.

---

## Phase 3 — Build one node

Implement:

```text
Planet
```

first.

Prove:

```text
wager
→ VRF
→ outcome
→ payout
```

works.

---

## Phase 4 — Add route selection

Add:

```text
Start
→ Planet
→ Relic
→ Black Hole
```

Only after that works should you add the remaining nodes.

---

## Phase 5 — Black Hole

Implement:

```text
Outer Disk
Inner Orbit
Photon Ring
Event Horizon
Singularity
```

with exact contract math.

---

## Phase 6 — RTP

Freeze the paytable.

Then:

```text
simulation
→ mathematical review
→ contract review
→ declared RTP
```

Do not keep changing game probabilities after the RTP is declared.

---

## Phase 7 — Visual polish

Add:

- starfield;
- ship;
- route animations;
- node animations;
- treasure effects;
- black-hole distortion;
- sound;
- responsive layout.

---

## Phase 8 — Submission

Test:

```text
local simulator
↓
production build
↓
standalone URL
↓
Jam widget
↓
source access
↓
submission
```

---

# 51. Current MVP vs Final Submission

The current prototype created for this project is a **front-end playable MVP/simulator**.

It contains:

- space map;
- wager UI;
- cosmic nodes;
- treasure events;
- risk events;
- wormholes;
- Black Hole sequence;
- cashout;
- sci-fi UI;
- Jam widget script;
- README;
- RTP planning scaffold.

It is **not yet safe to describe as the final Chain submission** until the actual Chain SDK, contract, bridge, manifest, VRF and final RTP math are integrated and verified.

The local simulator adapter in the MVP exists only to make the game playable while the official Chain integration is added.

---

# 52. Final Integration Rule

When integrating Chain, do not replace the Chain starter with a custom architecture just because the current prototype works.

Instead:

```text
CHAIN STARTER
     |
     +---- contract
     +---- bridge
     +---- manifest
     +---- simulator
     +---- VRF
     |
     v
VOIDBOUND GAME LOGIC
     |
     v
VOIDBOUND UI
```

This minimizes submission risk.

---

# 53. Final Quality Bar

Before submitting, open the game as if you are a judge who has never seen it.

Within the first 10 seconds, the judge should know:

```text
I have a ship.
I have a wager.
There is a map.
I can choose where to go.
I can find treasure.
I can lose it.
I can cash out.
There is a black hole.
```

Within 60 seconds, they should understand:

```text
This is not roulette.
This is not dice.
This is not crash.
This is a cosmic expedition game.
```

---

# 54. Final Definition of Done

VOIDBOUND is **100% complete for Chain Jam** only when all of the following are true:

```text
[✓] Original game mechanic
[✓] Casino wager
[✓] VRF outcome
[✓] On-chain settlement
[✓] Payout
[✓] Cashout
[✓] Cosmic map
[✓] Treasure system
[✓] Risk system
[✓] Black Hole system
[✓] Exact Chain SDK
[✓] Contract
[✓] Bridge
[✓] Manifest
[✓] Local simulator
[✓] 93–98% theoretical RTP
[✓] RTP independently verified
[✓] Jam widget
[✓] Standalone hosted game
[✓] Source access
[✓] Responsive UI
[✓] Sound
[✓] og:image
[✓] No broken states
[✓] Final submission checked
```

---

# 55. Official References

## Chain Jam

https://jam.chain.wtf/

This is the primary source for:

- rules;
- eligibility;
- SDK instructions;
- simulator;
- VRF information;
- judging;
- deadline;
- prizes;
- revenue share;
- submission.

## Important source claims

The official Chain Jam page currently states:

- $1,000 total prize pool;
- top three split $500 / $350 / $150;
- any integrated submission can earn 25% lifetime revenue;
- Chain provides decentralized VRF;
- the local simulator includes a VRF node;
- builders should install `@chain/casino-sdk`;
- builders should fork the Coinflip example;
- the Jam widget is required;
- the game must work standalone;
- declared RTP must be 93–98%;
- source access is required;
- novelty, fun, simplicity, and visual/sound quality are judged.

Always re-check the official page before submitting because hackathon information can change.

---

# 56. Final Build Philosophy

Do not try to win by making the biggest project.

Build the smallest game that feels like a **real game**.

The winning-quality target is:

```text
SIMPLE RULES
     +
STRONG VISUAL IDENTITY
     +
UNUSUAL MECHANIC
     +
REAL ON-CHAIN FAIRNESS
     +
PERFECT POLISH
```

VOIDBOUND should feel like:

> **A tiny sci-fi adventure that happens to be a casino game.**

Not:

> **A casino contract wrapped in a space-themed webpage.**

That distinction should guide every implementation decision.

---

## Current implementation reference

The first MVP ZIP was generated separately as:

`VOIDBOUND-chain-jam-mvp.zip`

Use it for the front-end concept/prototype, but replace its simulator randomness and settlement with the official Chain starter architecture before submission.

