import "./style.css";
import { createVoidboundAdapter } from "./chain/adapter.js";
import { connectGameToHost } from "./chain/guest.js";
import { DEFAULT_SNAPSHOT } from "./chain/types.js";
import {
  BETS,
  NODE_DEFS,
  resolveNodeEvent,
  getBlackHoleStage,
  calculateRtp
} from "./game/engine.js";

const chainAdapter = createVoidboundAdapter();

// ─── CHAIN GUEST SDK ──────────────────────────────────────────────────────────
// Connect to Chain host (or demo fallback when running standalone)
let hostSnapshot = { ...DEFAULT_SNAPSHOT };
let hostApi = null;

const guestConnection = connectGameToHost({
  setState(snapshot) {
    if (!snapshot) return;
    hostSnapshot = snapshot;
    // Update balance from smart vault if connected
    const vaultBalance = snapshot?.balances?.smartVaultBalance;
    if (vaultBalance && snapshot?.wallet?.address) {
      const decimals = snapshot?.token?.decimals ?? 6;
      const onchainBalance = Number(vaultBalance) / Math.pow(10, decimals);
      if (onchainBalance > 0) {
        state.balance = onchainBalance;
        update();
      }
    }
    // Update wallet button
    const walletAddr = snapshot?.wallet?.address;
    const connectBtn = document.querySelector("#connect");
    if (connectBtn && walletAddr) {
      connectBtn.textContent = `${walletAddr.slice(0, 6)}…${walletAddr.slice(-4)}`;
      connectBtn.classList.remove("ghost");
    }
  }
});

guestConnection.promise.then((api) => {
  hostApi = api;
});

const mapNodes = [
  { id: "start", x: 10, y: 58, type: "start", icon: "🚀", label: "Launch" },
  { id: "a", x: 25, y: 42, type: "planet", icon: "🪐", label: "Kepler-9" },
  { id: "b", x: 27, y: 73, type: "asteroid", icon: "☄️", label: "Vesta Drift" },
  { id: "c", x: 43, y: 28, type: "relic", icon: "💎", label: "Relic I" },
  { id: "d", x: 45, y: 55, type: "wormhole", icon: "🌀", label: "Fold Gate" },
  { id: "e", x: 43, y: 82, type: "pulsar", icon: "⭐", label: "Pulsar" },
  { id: "f", x: 62, y: 38, type: "ruins", icon: "👽", label: "Ancients" },
  { id: "g", x: 63, y: 68, type: "blackhole", icon: "🌌", label: "Event Horizon" },
  { id: "h", x: 79, y: 26, type: "planet", icon: "🪐", label: "Europa-X" },
  { id: "i", x: 81, y: 54, type: "relic", icon: "💎", label: "Vault II" },
  { id: "j", x: 81, y: 80, type: "dead", icon: "🌑", label: "Dead Star" },
  { id: "k", x: 94, y: 51, type: "relic", icon: "💎", label: "THE FIRST STAR" }
];

const edges = [
  ["start", "a"], ["start", "b"], ["a", "c"], ["a", "d"], ["b", "d"], ["b", "e"],
  ["c", "f"], ["d", "f"], ["d", "e"], ["e", "g"], ["f", "g"], ["f", "h"],
  ["g", "i"], ["g", "j"], ["h", "i"], ["i", "k"], ["j", "k"]
];

let state = {
  balance: 1000,
  bet: 10,
  cargo: 1,
  current: "start",
  started: false,
  revealed: new Set(["start"]),
  history: [],
  overlay: null,
  blackDepth: 0,
  gameSeed: 0xfeedface >>> 0,
  trip: 0,
  chainSession: null
};

const app = document.querySelector("#app");
app.innerHTML = `
  <div class="voidbound-shell">
    <header class="voidbound-topbar">
      <div class="voidbound-brand">
        <span class="voidbound-mark">✦</span>
        <div>
          <h1>VOIDBOUND</h1>
          <p>Chart the unknown</p>
        </div>
      </div>
      <div class="voidbound-actions">
        <div class="voidbound-wallet"><span>Bankroll</span> <strong id="balance">1000</strong></div>
        <button id="connect" class="chip ghost">Connect wallet</button>
      </div>
    </header>

    <main class="voidbound-main">
      <section class="game-panel">
        <div class="hud">
          <div class="stat"><small>Cargo Value</small><strong id="cargo">1.00×</strong></div>
          <div class="center-status"><div class="status" id="status">READY TO LAUNCH</div></div>
          <div class="stat right"><small>Current Wager</small><strong id="wager">10 U</strong></div>
        </div>

        <div class="map-wrap" id="map">
          <canvas id="stars"></canvas>
          <div class="map-ui">
            <div class="map-title">SECTOR Ω-7 / UNCHARTED SPACE</div>
            <div class="map-sub">Select a connected destination</div>
          </div>
        </div>
      </section>

      <aside class="sidebar">
        <div class="panel">
          <h3>EXPEDITION WAGER</h3>
          <div class="bet-row">
            ${BETS.map((bet) => `<button class="bet ${bet === 10 ? "active" : ""}" data-bet="${bet}">${bet} U</button>`).join("")}
          </div>
          <button class="btn primary primary-wide" id="launch">LAUNCH EXPEDITION</button>
        </div>

        <div class="panel">
          <h3>EXPEDITION STATUS</h3>
          <div class="metric"><span>Multiplier</span><strong id="mult">1.00×</strong></div>
          <div class="metric"><span>Potential payout</span><strong id="potential">10.00 U</strong></div>
          <div class="metric"><span>Declared RTP</span><strong>${calculateRtp() * 100}%</strong></div>
          <div class="progress"><span id="progress" style="width:0%"></span></div>
          <div class="metric"><span>Route discoveries</span><strong id="discoveries">1</strong></div>
          <button class="btn danger primary-wide" id="cashout" disabled>CASH OUT</button>
        </div>

        <div class="panel">
          <h3>STAR CHART</h3>
          <div class="legend">
            <span><i class="dot gold"></i>Treasure</span>
            <span><i class="dot purple"></i>Black hole</span>
            <span><i class="dot"></i>Unknown</span>
            <span><i class="dot red"></i>Danger</span>
          </div>
        </div>

        <div class="panel">
          <h3>FLIGHT LOG</h3>
          <div class="log" id="log"><p><b>VOIDBOUND:</b> Awaiting launch authorization.</p></div>
        </div>
      </aside>
    </main>

  </div>
  <div class="toast" id="toast"></div>
`;

const mapEl = document.querySelector("#map");
const canvas = document.querySelector("#stars");
const ctx = canvas.getContext("2d");

// ─── STARFIELD ──────────────────────────────────────────────────────────────

const STAR_COUNT = 220;
const NEBULA_COUNT = 6;

const stars = [];
const nebulae = [];

function initStars(w, h) {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.7 + 0.15,
      twinkleSpeed: Math.random() * 0.012 + 0.003,
      twinklePhase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.08,
      color: Math.random() < 0.15
        ? `rgba(191,145,255,`
        : Math.random() < 0.3
          ? `rgba(103,228,255,`
          : `rgba(220,235,255,`
    });
  }
}

function initNebulae(w, h) {
  nebulae.length = 0;
  const configs = [
    { cx: 0.18, cy: 0.22, rx: 0.22, ry: 0.18, r: 32, g: 80, b: 180, a: 0.045 },
    { cx: 0.72, cy: 0.65, rx: 0.28, ry: 0.20, r: 90, g: 30, b: 160, a: 0.040 },
    { cx: 0.50, cy: 0.45, rx: 0.18, ry: 0.14, r: 50, g: 60, b: 200, a: 0.025 },
    { cx: 0.85, cy: 0.20, rx: 0.14, ry: 0.12, r: 103, g: 228, b: 255, a: 0.028 },
    { cx: 0.30, cy: 0.80, rx: 0.16, ry: 0.10, r: 200, g: 80, b: 255, a: 0.022 },
    { cx: 0.60, cy: 0.10, rx: 0.20, ry: 0.10, r: 30, g: 100, b: 220, a: 0.030 },
  ];
  for (const c of configs) {
    nebulae.push({ ...c, phase: Math.random() * Math.PI * 2, speed: 0.0003 + Math.random() * 0.0003 });
  }
}

// animated edge phase
let edgePhase = 0;

function drawStarfield(w, h, time) {
  ctx.clearRect(0, 0, w, h);

  // nebula clouds
  for (const n of nebulae) {
    const nx = n.cx * w + Math.sin(time * n.speed + n.phase) * w * 0.025;
    const ny = n.cy * h + Math.cos(time * n.speed * 0.7 + n.phase) * h * 0.018;
    const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(n.rx * w, n.ry * h));
    grd.addColorStop(0, `rgba(${n.r},${n.g},${n.b},${n.a * 1.6})`);
    grd.addColorStop(0.4, `rgba(${n.r},${n.g},${n.b},${n.a})`);
    grd.addColorStop(1, `rgba(${n.r},${n.g},${n.b},0)`);
    ctx.beginPath();
    ctx.ellipse(nx, ny, n.rx * w, n.ry * h, 0, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  }

  // twinkling stars
  for (const s of stars) {
    s.twinklePhase += s.twinkleSpeed;
    s.x += s.drift;
    if (s.x > w + 2) s.x = -2;
    if (s.x < -2)    s.x = w + 2;
    const a = s.alpha * (0.55 + 0.45 * Math.sin(s.twinklePhase));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = s.color + a + ")";
    ctx.fill();

    // bright stars get a cross-flare
    if (s.r > 1.3 && a > 0.55) {
      ctx.strokeStyle = s.color + (a * 0.4) + ")";
      ctx.lineWidth = 0.5;
      const fl = s.r * 3;
      ctx.beginPath();
      ctx.moveTo(s.x - fl, s.y);
      ctx.lineTo(s.x + fl, s.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - fl);
      ctx.lineTo(s.x, s.y + fl);
      ctx.stroke();
    }
  }

  // animated edges
  edgePhase = time * 0.0008;
  for (const [sourceId, targetId] of edges) {
    const source = mapNodes.find((n) => n.id === sourceId);
    const target = mapNodes.find((n) => n.id === targetId);
    const start = nodePos(source, w, h);
    const end   = nodePos(target, w, h);

    const isActive = state.started && (
      (state.current === sourceId && getNeighbours(sourceId).includes(targetId)) ||
      (state.current === targetId && getNeighbours(targetId).includes(sourceId))
    );

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (isActive) {
      // glowing animated energy flow on reachable edges
      const grad = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
      const pulse = 0.3 + 0.25 * Math.sin(edgePhase * 3 + len * 0.01);
      grad.addColorStop(0,   `rgba(103,228,255,0)`);
      grad.addColorStop(0.3, `rgba(103,228,255,${pulse})`);
      grad.addColorStop(0.7, `rgba(103,228,255,${pulse})`);
      grad.addColorStop(1,   `rgba(103,228,255,0)`);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // traveling dot along the edge
      const t = ((edgePhase * 0.5) % 1 + 1) % 1;
      const dotX = start.x + dx * t;
      const dotY = start.y + dy * t;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(103,228,255,.9)";
      ctx.fill();
    } else {
      // subtle base edge
      const baseAlpha = 0.08 + 0.04 * Math.sin(edgePhase + len * 0.007);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(120,180,230,${baseAlpha})`;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }
}

let animRunning = false;
let animFrame;

function startAnimation() {
  if (animRunning) return;
  animRunning = true;

  function frame(time) {
    const bounds = mapEl.getBoundingClientRect();
    drawStarfield(bounds.width, bounds.height, time);
    animFrame = requestAnimationFrame(frame);
  }
  animFrame = requestAnimationFrame(frame);
}

function stopAnimation() {
  animRunning = false;
  cancelAnimationFrame(animFrame);
}

// ─── CANVAS RESIZE ──────────────────────────────────────────────────────────

function resizeCanvas() {
  const bounds = mapEl.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width  = bounds.width  * ratio;
  canvas.height = bounds.height * ratio;
  canvas.style.width  = bounds.width  + "px";
  canvas.style.height = bounds.height + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  initStars(bounds.width, bounds.height);
  initNebulae(bounds.width, bounds.height);
  if (!animRunning) startAnimation();
}

function nodePos(node, w, h) {
  const bounds = mapEl.getBoundingClientRect();
  const bw = w ?? bounds.width;
  const bh = h ?? bounds.height;
  return { x: (bw * node.x) / 100, y: (bh * node.y) / 100 };
}

// legacy alias used in a few places
function pos(node) { return nodePos(node); }

// ─── NODE RENDERING ──────────────────────────────────────────────────────────

function getNeighbours(id) {
  return edges
    .filter(([s, t]) => s === id || t === id)
    .map(([s, t]) => (s === id ? t : s));
}

function renderNodes() {
  mapEl.querySelectorAll(".node,.ship,.warp-ring").forEach((el) => el.remove());

  const reachable = state.started ? getNeighbours(state.current) : [];

  mapNodes.forEach((node) => {
    if (node.id === "start" || state.started) {
      const el = document.createElement("button");
      const isCurrent   = node.id === state.current;
      const isReachable = state.started && reachable.includes(node.id);
      const isBlackhole = node.type === "blackhole";
      const isDisabled  = state.started && !isCurrent && !isReachable;

      el.className = [
        "node",
        isCurrent   ? "current"   : "",
        isBlackhole ? "blackhole" : "",
        isDisabled  ? "disabled"  : "",
        isReachable ? "reachable" : ""
      ].filter(Boolean).join(" ");

      el.style.left = `${node.x}%`;
      el.style.top  = `${node.y}%`;
      el.innerHTML  = `${node.icon}<span class="node-label">${node.label}</span>`;
      el.onclick = () => visit(node);
      mapEl.appendChild(el);
    }
  });

  const currentNode = mapNodes.find((n) => n.id === state.current) ?? mapNodes[0];
  const ship = document.createElement("div");
  ship.className = "ship";
  ship.style.left = `${currentNode.x}%`;
  ship.style.top  = `${currentNode.y}%`;
  ship.textContent = "🚀";
  mapEl.appendChild(ship);
}

// ─── WARP TRAIL ──────────────────────────────────────────────────────────────

function spawnWarpRings(fromNode) {
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const ring = document.createElement("div");
      ring.className = "warp-ring";
      ring.style.left = `${fromNode.x}%`;
      ring.style.top  = `${fromNode.y}%`;
      ring.style.animationDelay = "0s";
      mapEl.appendChild(ring);
      setTimeout(() => ring.remove(), 700);
    }, i * 120);
  }
}

// ─── SCREEN FLASH ────────────────────────────────────────────────────────────

function flashMap(type) {
  mapEl.classList.remove("flash-win", "flash-lose");
  // force reflow to restart animation
  void mapEl.offsetWidth;
  mapEl.classList.add(type === "win" ? "flash-win" : "flash-lose");
  setTimeout(() => mapEl.classList.remove("flash-win", "flash-lose"), 800);
}

// ─── VALUE BUMP ANIMATION ─────────────────────────────────────────────────────

function bumpEl(id, cls) {
  const el = document.querySelector(id);
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 600);
}

// ─── LOG ─────────────────────────────────────────────────────────────────────

function log(message) {
  const logBox = document.querySelector("#log");
  const entry = document.createElement("p");
  entry.innerHTML = message;
  logBox.prepend(entry);
  state.history.unshift(message);
  while (logBox.children.length > 12) logBox.lastElementChild.remove();
}

// ─── AUDIO ENGINE ─────────────────────────────────────────────────────────────

let audioCtx = null;
let masterGain = null;
let ambientDroneNode = null;
let ambientDroneGain = null;

function ensureAudio() {
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.72;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Low-level tone builder — returns oscillator so caller can chain
function buildTone({ frequency = 220, duration = 0.18, gain = 0.04, type = "sine", sweep = 0, sweepCurve = "exp", delay = 0, dest = null }) {
  const ctx = ensureAudio();
  if (!ctx) return null;
  const osc = ctx.createOscillator();
  const gn  = ctx.createGain();
  const out = dest ?? masterGain;
  const t0  = ctx.currentTime + delay;

  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, frequency), t0);
  if (sweep !== 0) {
    const target = Math.max(20, frequency + sweep);
    if (sweepCurve === "exp") {
      osc.frequency.exponentialRampToValueAtTime(target, t0 + duration);
    } else {
      osc.frequency.linearRampToValueAtTime(target, t0 + duration);
    }
  }
  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.03, duration * 0.15));
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.connect(gn);
  gn.connect(out);
  osc.start(t0);
  osc.stop(t0 + duration + 0.01);
  return osc;
}

// Noise burst (for explosions / rumble)
function buildNoise({ duration = 0.3, gain = 0.03, freq = 800, q = 1, delay = 0 }) {
  const ctx = ensureAudio();
  if (!ctx) return;
  const bufLen = ctx.sampleRate * (duration + 0.05);
  const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

  const src    = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gn     = ctx.createGain();
  const t0     = ctx.currentTime + delay;

  src.buffer = buf;
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;

  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  src.connect(filter);
  filter.connect(gn);
  gn.connect(masterGain);
  src.start(t0);
  src.stop(t0 + duration + 0.05);
}

// Reverb-ish shimmer layer (multiple detuned sines)
function buildShimmer({ baseFreq = 440, count = 5, spreadHz = 40, duration = 0.6, gain = 0.012, delay = 0 }) {
  for (let i = 0; i < count; i++) {
    const f = baseFreq + (Math.random() - 0.5) * spreadHz;
    buildTone({ frequency: f, duration, gain, type: "sine", delay: delay + i * 0.04 });
  }
}

// ─── AMBIENT SPACE DRONE ──────────────────────────────────────────────────────

function startAmbientDrone() {
  const ctx = ensureAudio();
  if (!ctx || ambientDroneNode) return;

  ambientDroneGain = ctx.createGain();
  ambientDroneGain.gain.value = 0;
  ambientDroneGain.connect(masterGain);

  // Sub bass drone
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 38;
  sub.connect(ambientDroneGain);
  sub.start();

  // Mid harmonic
  const mid = ctx.createOscillator();
  mid.type = "triangle";
  mid.frequency.value = 76;
  mid.connect(ambientDroneGain);
  mid.start();

  // Slow LFO wobble on the mid
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.12;
  lfoGain.gain.value = 3;
  lfo.connect(lfoGain);
  lfoGain.connect(mid.frequency);
  lfo.start();

  ambientDroneNode = sub; // reference to stop later

  // Fade in gently
  ambientDroneGain.gain.setValueAtTime(0, ctx.currentTime);
  ambientDroneGain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 2.5);
}

function stopAmbientDrone() {
  if (!ambientDroneGain || !audioCtx) return;
  ambientDroneGain.gain.setValueAtTime(ambientDroneGain.gain.value, audioCtx.currentTime);
  ambientDroneGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
  setTimeout(() => { ambientDroneNode = null; }, 2000);
}

// ─── SOUND EFFECT LIBRARY ─────────────────────────────────────────────────────

function playSfx(type) {
  ensureAudio();

  // ── LAUNCH ── ascending rocket burn with reverb shimmer
  if (type === "launch") {
    buildNoise({ duration: 0.55, gain: 0.025, freq: 220, q: 0.6 });
    buildTone({ frequency: 80,  duration: 0.35, gain: 0.05, type: "sawtooth", sweep: 160 });
    buildTone({ frequency: 140, duration: 0.30, gain: 0.04, type: "sawtooth", sweep: 220, delay: 0.08 });
    buildTone({ frequency: 220, duration: 0.28, gain: 0.035,type: "triangle", sweep: 280, delay: 0.18 });
    buildTone({ frequency: 330, duration: 0.26, gain: 0.03, type: "triangle", sweep: 360, delay: 0.28 });
    buildShimmer({ baseFreq: 880, count: 4, spreadHz: 60, duration: 0.9, gain: 0.008, delay: 0.3 });
    startAmbientDrone();
  }

  // ── NAVIGATE / MOVE ── soft whoosh
  if (type === "navigate") {
    buildTone({ frequency: 320, duration: 0.14, gain: 0.025, type: "sine", sweep: 120 });
    buildNoise({ duration: 0.12, gain: 0.012, freq: 1200, q: 2 });
  }

  // ── SUCCESS (treasure collect) ── bright ascending chord
  if (type === "success") {
    buildTone({ frequency: 330, duration: 0.20, gain: 0.04,  type: "triangle", sweep: 220 });
    buildTone({ frequency: 415, duration: 0.22, gain: 0.035, type: "triangle", sweep: 260, delay: 0.08 });
    buildTone({ frequency: 523, duration: 0.26, gain: 0.035, type: "triangle", sweep: 300, delay: 0.16 });
    buildShimmer({ baseFreq: 660, count: 4, spreadHz: 30, duration: 0.55, gain: 0.009, delay: 0.22 });
  }

  // ── PLANET ── soft warm bell
  if (type === "planet") {
    buildTone({ frequency: 261, duration: 0.5,  gain: 0.05, type: "triangle", sweep: 40 });
    buildTone({ frequency: 392, duration: 0.45, gain: 0.03, type: "sine",     sweep: 20, delay: 0.05 });
    buildTone({ frequency: 523, duration: 0.35, gain: 0.02, type: "sine",     sweep: 10, delay: 0.12 });
  }

  // ── RELIC ── crystalline high shimmer + deep resonance
  if (type === "relic") {
    buildTone({ frequency: 55,  duration: 0.55, gain: 0.04, type: "sine",     sweep: 10 });
    buildTone({ frequency: 880, duration: 0.40, gain: 0.035,type: "triangle", sweep: 120 });
    buildShimmer({ baseFreq: 1320, count: 6, spreadHz: 80, duration: 0.7, gain: 0.010, delay: 0.05 });
    buildTone({ frequency: 1760, duration: 0.3, gain: 0.018, type: "sine", sweep: -200, delay: 0.15 });
  }

  // ── PULSAR ── rhythmic pulse burst
  if (type === "pulsar") {
    for (let i = 0; i < 4; i++) {
      buildTone({ frequency: 440 + i * 55, duration: 0.14, gain: 0.04, type: "square", sweep: 80, delay: i * 0.10 });
      buildNoise({ duration: 0.06, gain: 0.012, freq: 2000, q: 3, delay: i * 0.10 + 0.04 });
    }
  }

  // ── ASTEROID / DANGER WARNING ── tense metallic scrape
  if (type === "asteroid") {
    buildTone({ frequency: 160, duration: 0.3, gain: 0.045, type: "sawtooth", sweep: -60 });
    buildNoise({ duration: 0.25, gain: 0.025, freq: 400, q: 0.8 });
    buildTone({ frequency: 220, duration: 0.2, gain: 0.03, type: "square", sweep: 40, delay: 0.1 });
  }

  // ── WORMHOLE ── ethereal portal sweep with reverse echo
  if (type === "wormhole") {
    buildTone({ frequency: 110, duration: 0.5, gain: 0.05, type: "sine", sweep: 880, sweepCurve: "exp" });
    buildTone({ frequency: 880, duration: 0.5, gain: 0.04, type: "sine", sweep: -770, sweepCurve: "exp", delay: 0.05 });
    buildShimmer({ baseFreq: 440, count: 8, spreadHz: 120, duration: 1.0, gain: 0.010, delay: 0.1 });
    buildNoise({ duration: 0.45, gain: 0.015, freq: 600, q: 0.5, delay: 0.05 });
    buildTone({ frequency: 220, duration: 0.6, gain: 0.025, type: "triangle", sweep: 660, sweepCurve: "exp", delay: 0.2 });
  }

  // ── RUINS ── mysterious ancient chime
  if (type === "ruins") {
    // Low resonant hum
    buildTone({ frequency: 65,  duration: 0.8, gain: 0.04, type: "sine", sweep: 8 });
    // Alien scale tones
    const ruinsScale = [277, 311, 370, 415, 554];
    ruinsScale.forEach((f, i) => {
      buildTone({ frequency: f, duration: 0.4, gain: 0.025, type: "triangle", sweep: 15, delay: i * 0.07 });
    });
    buildShimmer({ baseFreq: 830, count: 5, spreadHz: 60, duration: 0.7, gain: 0.008, delay: 0.3 });
  }

  // ── RUINS DISCOVERY ── triumphant ancient fanfare
  if (type === "ruins-discover") {
    const fanfare = [261, 330, 392, 523, 659, 784];
    fanfare.forEach((f, i) => {
      buildTone({ frequency: f, duration: 0.35, gain: 0.04, type: "triangle", sweep: 30, delay: i * 0.06 });
      buildTone({ frequency: f * 2, duration: 0.25, gain: 0.015, type: "sine", delay: i * 0.06 + 0.02 });
    });
    buildShimmer({ baseFreq: 1047, count: 6, spreadHz: 80, duration: 0.9, gain: 0.010, delay: 0.3 });
  }

  // ── DEAD WORLD ── hollow void echo
  if (type === "dead") {
    buildTone({ frequency: 98, duration: 0.7, gain: 0.035, type: "sine", sweep: -20 });
    buildNoise({ duration: 0.4, gain: 0.008, freq: 180, q: 0.4 });
    buildTone({ frequency: 147, duration: 0.5, gain: 0.018, type: "triangle", sweep: -30, delay: 0.1 });
  }

  // ── BLACK HOLE ENTRY ── deep gravitational rumble
  if (type === "blackhole") {
    buildNoise({ duration: 1.2, gain: 0.035, freq: 60, q: 0.3 });
    buildTone({ frequency: 28,  duration: 1.0, gain: 0.06, type: "sine",     sweep: -8 });
    buildTone({ frequency: 44,  duration: 0.9, gain: 0.04, type: "triangle", sweep: -12, delay: 0.1 });
    buildTone({ frequency: 80,  duration: 0.7, gain: 0.025,type: "sawtooth", sweep: -40, delay: 0.2 });
    // Distorted harmonic overtones
    buildTone({ frequency: 120, duration: 0.5, gain: 0.018, type: "square", sweep: -60, delay: 0.3 });
  }

  // ── BLACK HOLE DEPTH ── increasing gravitational distortion per stage
  if (type === "blackhole-depth") {
    const depth = state.blackDepth;
    const baseF = 35 - depth * 4;
    buildNoise({ duration: 0.8 + depth * 0.2, gain: 0.03 + depth * 0.005, freq: 80 - depth * 8, q: 0.3 });
    buildTone({ frequency: Math.max(18, baseF), duration: 0.8, gain: 0.055, type: "sine", sweep: -10 });
    buildTone({ frequency: Math.max(30, baseF * 1.5), duration: 0.7, gain: 0.035, type: "triangle", sweep: -15, delay: 0.1 });
    if (depth >= 3) {
      // Event horizon crackle
      for (let i = 0; i < 3; i++) {
        buildNoise({ duration: 0.06, gain: 0.028, freq: 300 + i * 100, q: 1.5, delay: i * 0.15 });
      }
    }
  }

  // ── DANGER / LOSS ── explosion with screen shake energy
  if (type === "danger") {
    buildNoise({ duration: 0.7, gain: 0.055, freq: 120, q: 0.3 });
    buildTone({ frequency: 160, duration: 0.35, gain: 0.06, type: "square",   sweep: -120 });
    buildTone({ frequency: 90,  duration: 0.40, gain: 0.055,type: "sawtooth", sweep: -70,  delay: 0.10 });
    buildTone({ frequency: 55,  duration: 0.50, gain: 0.045,type: "sawtooth", sweep: -30,  delay: 0.22 });
    buildNoise({ duration: 0.5, gain: 0.025, freq: 300, q: 0.5, delay: 0.08 });
    // Rumble tail
    buildTone({ frequency: 30, duration: 0.8, gain: 0.03, type: "sine", sweep: -10, delay: 0.3 });
    stopAmbientDrone();
  }

  // ── CASHOUT ── triumphant ascending coin fanfare
  if (type === "cashout") {
    // Coin shimmer hits
    [0, 0.07, 0.14, 0.22, 0.32, 0.44].forEach((delay, i) => {
      const f = 392 + i * 130;
      buildTone({ frequency: f,     duration: 0.22, gain: 0.04,  type: "triangle", sweep: 100 + i * 30, delay });
      buildTone({ frequency: f * 2, duration: 0.14, gain: 0.018, type: "sine",     sweep: 60,           delay: delay + 0.03 });
    });
    buildShimmer({ baseFreq: 1318, count: 8, spreadHz: 100, duration: 1.2, gain: 0.011, delay: 0.4 });
    // Final resolution chord
    [523, 659, 784, 1047].forEach((f, i) => {
      buildTone({ frequency: f, duration: 0.7, gain: 0.025, type: "sine", delay: 0.55 + i * 0.04 });
    });
    stopAmbientDrone();
  }

  // ── BET SELECT ── soft UI click
  if (type === "bet") {
    buildTone({ frequency: 480, duration: 0.06, gain: 0.025, type: "triangle", sweep: 60 });
  }

  // ── WALLET CONNECT ── digital handshake
  if (type === "connect") {
    buildTone({ frequency: 440, duration: 0.10, gain: 0.03, type: "triangle", sweep: 120 });
    buildTone({ frequency: 660, duration: 0.12, gain: 0.03, type: "triangle", sweep: 140, delay: 0.09 });
    buildTone({ frequency: 880, duration: 0.14, gain: 0.025,type: "sine",     sweep: 160, delay: 0.19 });
  }
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  window.setTimeout(() => el.classList.remove("show"), 1800);
}

// ─── UPDATE UI ────────────────────────────────────────────────────────────────

function update() {
  document.querySelector("#balance").textContent =
    state.balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
  document.querySelector("#cargo").textContent     = `${state.cargo.toFixed(2)}×`;
  document.querySelector("#wager").textContent     = `${state.bet} U`;
  document.querySelector("#mult").textContent      = `${state.cargo.toFixed(2)}×`;
  document.querySelector("#potential").textContent = `${(state.bet * state.cargo).toFixed(2)} U`;
  document.querySelector("#discoveries").textContent = String(state.revealed.size);
  document.querySelector("#cashout").disabled      = !state.started;

  const statusEl = document.querySelector("#status");
  statusEl.textContent = state.started ? "EXPEDITION ACTIVE" : "READY TO LAUNCH";
  statusEl.className   = "status" + (state.started ? " active" : "");

  document.querySelector("#progress").style.width = `${Math.min(100, state.revealed.size * 9)}%`;
}

// ─── RNG ─────────────────────────────────────────────────────────────────────

function randomUnit() {
  state.gameSeed = (state.gameSeed * 1664525 + 1013904223) >>> 0;
  return state.gameSeed / 4294967296;
}

// ─── GAME ACTIONS ─────────────────────────────────────────────────────────────

function begin() {
  if (state.started) return;
  if (state.balance < state.bet) { toast("Insufficient bank."); return; }

  const session = chainAdapter.contract.launch({ wager: state.bet, player: "demo-wallet" });
  state.chainSession = session;
  state.balance    -= state.bet;
  state.started     = true;
  state.current     = "start";
  state.cargo       = 1;
  state.revealed    = new Set(["start"]);
  state.blackDepth  = 0;
  state.trip       += 1;
  state.gameSeed    = (Date.now() ^ (state.trip * 0x9e3779b9)) >>> 0;

  log(`<b>LAUNCH:</b> ${state.bet} U committed. Chain session ${session.gameId.slice(0, 8)} active.`);
  playSfx("launch");
  update();
  renderNodes();
}

function closeOverlay() {
  document.querySelector("#event")?.remove();
  state.overlay = null;
  update();
  renderNodes();
}

function addButton(parent, label, modifier, action) {
  const btn = document.createElement("button");
  btn.className = `btn ${modifier}`.trim();
  btn.textContent = label;
  btn.onclick = action;
  parent.appendChild(btn);
}

function applyResult(node, result) {
  if (result.multiplier > 0) {
    state.cargo *= result.multiplier;
    log(`<b>${NODE_DEFS[node.type]?.name?.toUpperCase() ?? node.label}:</b> Cargo increased to ${state.cargo.toFixed(2)}×.`);
    // Node-specific success SFX
    if (node.type === "planet")  playSfx("planet");
    else if (node.type === "relic")  playSfx("relic");
    else if (node.type === "pulsar") playSfx("pulsar");
    else playSfx("success");
    flashMap("win");
    bumpEl("#cargo", "cargo-bump");
    bumpEl("#mult",  "cargo-bump");
  } else {
    log(`<b>DANGER:</b> the ${NODE_DEFS[node.type]?.name ?? node.label.toLowerCase()} claimed the expedition.`);
    playSfx("danger");
    flashMap("lose");
    lose();
    return;
  }
  closeOverlay();
}

function showTreasure(node) {
  if (state.chainSession) {
    const res = chainAdapter.contract.resolveNode({ gameId: state.chainSession.gameId, nodeType: node.type, choice: "safe" });
    state.chainSession.lastNodeResult = res;
    log(`<b>CHAIN:</b> ${node.type} resolved: ${res.multiplier.toFixed(2)}×.`);
  }
  const outcome = resolveNodeEvent(node.type, "treasure", randomUnit());
  applyResult(node, outcome);
}

function showRisk(node, level) {
  if (state.chainSession) {
    const res = chainAdapter.contract.resolveNode({ gameId: state.chainSession.gameId, nodeType: node.type, choice: level });
    state.chainSession.lastNodeResult = res;
    log(`<b>CHAIN:</b> ${node.type} route ${level} → ${res.multiplier.toFixed(2)}×.`);
  }
  const outcome = resolveNodeEvent(node.type, level, randomUnit());
  if (outcome.multiplier > 0) {
    state.cargo *= outcome.multiplier;
    log(`<b>${NODE_DEFS[node.type]?.name?.toUpperCase() ?? node.label}:</b> route survived. Cargo: ${state.cargo.toFixed(2)}×.`);
    playSfx("asteroid");
    setTimeout(() => playSfx("success"), 280);
    flashMap("win");
    bumpEl("#cargo", "cargo-bump");
    bumpEl("#mult",  "cargo-bump");
    closeOverlay();
    return;
  }
  log(`<b>DANGER:</b> ${NODE_DEFS[node.type]?.name ?? "The route"} consumed the expedition.`);
  playSfx("danger");
  flashMap("lose");
  lose();
}

function showWormhole(node) {
  const next = getNeighbours(node.id).filter((id) => id !== "start");
  const targetId = next[Math.floor(randomUnit() * next.length)];
  const target   = mapNodes.find((n) => n.id === targetId);
  log(`<b>WORMHOLE:</b> spacetime folded → ${target.label}.`);
  playSfx("wormhole");
  closeOverlay();
  spawnWarpRings(node);
  state.current = target.id;
  state.revealed.add(target.id);
  setTimeout(() => { renderNodes(); update(); }, 200);
}

function showRuinsOutcome(node) {
  const outcome = resolveNodeEvent(node.type, "treasure", randomUnit());
  if (outcome.multiplier > 0) {
    state.cargo *= outcome.multiplier;
    log(`<b>ANCIENT RUINS:</b> ${outcome.result} discovered. Cargo: ${state.cargo.toFixed(2)}×.`);
    playSfx("ruins-discover");
    flashMap("win");
    bumpEl("#cargo", "cargo-bump");
    closeOverlay();
    return;
  }
  log("<b>ANCIENT RUINS:</b> nothing remains but dust and static.");
  playSfx("dead");
  closeOverlay();
}

function showBlackHole() {
  const stage = getBlackHoleStage(state.blackDepth);
  const overlay = document.createElement("div");
  overlay.className = "event-overlay";
  overlay.id = "event";
  overlay.innerHTML = `
    <div class="event-card">
      <div class="event-icon">🕳️</div>
      <h2>${stage.name}</h2>
      <p>The gravitational field deepens. Escape with your cargo, or descend further into the singular void.</p>
      <div class="event-value">${stage.multiplier.toFixed(2)}× TARGET</div>
      <div class="actions" id="eventActions"></div>
    </div>
  `;
  mapEl.appendChild(overlay);
  const actions = overlay.querySelector("#eventActions");
  addButton(actions, "ESCAPE NOW", "", () => cashout());
  addButton(actions, state.blackDepth >= 4 ? "ENTER SINGULARITY" : "GO DEEPER", "primary", () => {
    const roll = randomUnit();
    if (roll >= stage.survival) {
      state.blackDepth += 1;
      state.cargo *= stage.multiplier;
      log(`<b>BLACK HOLE:</b> survived ${stage.name}. Cargo: ${state.cargo.toFixed(2)}×.`);
      playSfx("blackhole-depth");
      flashMap("win");
      bumpEl("#cargo", "cargo-bump");
      if (state.blackDepth >= 5) { cashout(); return; }
      overlay.remove();
      showBlackHole();
      return;
    }
    lose();
  });
}

function visit(node) {
  if (!state.started || node.id === state.current) return;
  if (!getNeighbours(state.current).includes(node.id)) {
    toast("That route is outside your current sector.");
    return;
  }

  const prevNode = mapNodes.find((n) => n.id === state.current);
  spawnWarpRings(prevNode);
  playSfx("navigate");

  state.current = node.id;
  state.revealed.add(node.id);
  renderNodes();
  update();

  if (node.type === "start") return;

  const eventOverlay = document.createElement("div");
  eventOverlay.className = "event-overlay";
  eventOverlay.id = "event";

  const def = NODE_DEFS[node.type] ?? { icon: "✦", name: "Unknown Event", description: "The unknown yields to the void." };
  eventOverlay.innerHTML = `
    <div class="event-card">
      <div class="event-icon">${def.icon}</div>
      <h2>${def.name}</h2>
      <p>${def.description}</p>
      <div class="event-value">${state.cargo.toFixed(2)}× CARGO</div>
      <div class="actions" id="eventActions"></div>
    </div>
  `;
  mapEl.appendChild(eventOverlay);
  const actions = eventOverlay.querySelector("#eventActions");

  if (node.type === "planet" || node.type === "pulsar" || node.type === "relic") {
    playSfx(node.type);
    addButton(actions, "COLLECT & CONTINUE", "primary", () => showTreasure(node));
    return;
  }
  if (node.type === "dead") {
    playSfx("dead");
    addButton(actions, "CONTINUE", "primary", () => closeOverlay());
    return;
  }
  if (node.type === "wormhole") {
    playSfx("wormhole");
    addButton(actions, "ENTER WORMHOLE", "primary", () => showWormhole(node));
    return;
  }
  if (node.type === "asteroid") {
    playSfx("asteroid");
    addButton(actions, "SAFE",    "",        () => showRisk(node, "safe"));
    addButton(actions, "RISKY",   "primary", () => showRisk(node, "risky"));
    addButton(actions, "UNKNOWN", "danger",  () => showRisk(node, "unknown"));
    return;
  }
  if (node.type === "ruins") {
    playSfx("ruins");
    addButton(actions, "OPEN THE SITE", "primary", () => showRuinsOutcome(node));
    return;
  }
  if (node.type === "blackhole") {
    playSfx("blackhole");
    addButton(actions, "ESCAPE WITH CARGO", "",        () => cashout());
    addButton(actions, "ENTER HORIZON",     "primary", () => {
      state.blackDepth += 1;
      eventOverlay.remove();
      showBlackHole();
    });
  }
}

function lose() {
  document.querySelector("#event")?.remove();
  state.started    = false;
  state.cargo      = 1;
  state.blackDepth = 0;
  log("<b>SHIP LOST:</b> expedition payout 0 U.");
  toast("The void claimed the expedition.");
  playSfx("danger");
  update();
  renderNodes();
}

function cashout() {
  if (!state.started) return;
  const chainPayout = state.chainSession
    ? chainAdapter.contract.cashOut({ gameId: state.chainSession.gameId })
    : { payout: state.bet * state.cargo };
  const payout = chainPayout?.payout ?? state.bet * state.cargo;
  state.balance    += payout;
  state.started     = false;
  state.cargo       = 1;
  state.blackDepth  = 0;
  state.chainSession = null;
  log(`<b>CASH OUT:</b> ${payout.toFixed(2)} U returned to bank.`);
  toast(`Expedition secured: ${payout.toFixed(2)} U`);
  playSfx("cashout");
  flashMap("win");
  bumpEl("#balance", "balance-bump");
  document.querySelector("#event")?.remove();
  update();
  renderNodes();
}

// ─── CONTROLS ─────────────────────────────────────────────────────────────────

const betButtons = document.querySelectorAll(".bet");
for (const btn of betButtons) {
  btn.addEventListener("click", () => {
    if (state.started) return;
    for (const el of betButtons) el.classList.remove("active");
    btn.classList.add("active");
    state.bet = Number(btn.dataset.bet);
    playSfx("bet");
    update();
  });
}

document.querySelector("#cashout").addEventListener("click", cashout);
document.querySelector("#launch").addEventListener("click", begin);

const connectButton = document.querySelector("#connect");
if (connectButton) {
  connectButton.addEventListener("click", () => {
    playSfx("connect");
    toast("Demo wallet connected — replace adapter with Chain wallet flow.");
    connectButton.textContent = "WALLET CONNECTED";
  });
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
renderNodes();
update();
