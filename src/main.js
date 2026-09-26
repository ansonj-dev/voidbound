import "./style.css";
import { createVoidboundAdapter } from "./chain/adapter.js";
import {
  BETS,
  NODE_DEFS,
  resolveNodeEvent,
  getBlackHoleStage,
  calculateRtp
} from "./game/engine.js";

const chainAdapter = createVoidboundAdapter();

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

function resizeCanvas() {
  const bounds = mapEl.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = bounds.width * ratio;
  canvas.height = bounds.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  drawMap();
}

function pos(node) {
  const bounds = mapEl.getBoundingClientRect();
  return { x: (bounds.width * node.x) / 100, y: (bounds.height * node.y) / 100 };
}

function drawMap() {
  const bounds = mapEl.getBoundingClientRect();
  ctx.clearRect(0, 0, bounds.width, bounds.height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(120,180,230,.12)";

  for (const [sourceId, targetId] of edges) {
    const source = mapNodes.find((node) => node.id === sourceId);
    const target = mapNodes.find((node) => node.id === targetId);
    const start = pos(source);
    const end = pos(target);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
}

function getNeighbours(id) {
  return edges
    .filter(([source, target]) => source === id || target === id)
    .map(([source, target]) => (source === id ? target : source));
}

function renderNodes() {
  mapEl.querySelectorAll(".node,.ship").forEach((element) => element.remove());

  mapNodes.forEach((node) => {
    if (node.id === "start" || state.started) {
      const el = document.createElement("button");
      el.className = `node ${node.id === state.current ? "current" : ""} ${state.revealed.has(node.id) ? "revealed" : ""} ${node.type === "blackhole" ? "blackhole" : ""}`;
      el.style.left = `${node.x}%`;
      el.style.top = `${node.y}%`;
      el.innerHTML = `${node.icon}<span class="node-label">${node.label}</span>`;

      const connected = getNeighbours(state.current).includes(node.id);
      if (state.started && node.id !== state.current && !connected) {
        el.classList.add("disabled");
      }

      el.onclick = () => visit(node);
      mapEl.appendChild(el);
    }
  });

  const currentNode = mapNodes.find((node) => node.id === state.current) ?? mapNodes[0];
  const ship = document.createElement("div");
  ship.className = "ship";
  ship.style.left = `${currentNode.x}%`;
  ship.style.top = `${currentNode.y}%`;
  ship.textContent = "🚀";
  mapEl.appendChild(ship);

  drawMap();
}

function log(message) {
  const logBox = document.querySelector("#log");
  const entry = document.createElement("p");
  entry.innerHTML = message;
  logBox.prepend(entry);
  state.history.unshift(message);

  while (logBox.children.length > 12) {
    logBox.lastElementChild.remove();
  }
}

let audioCtx = null;

function ensureAudio() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioCtx = new AudioCtor();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

function playTone({ frequency = 220, duration = 0.12, gain = 0.04, type = "sine", sweep = 0 }) {
  const context = ensureAudio();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  if (sweep !== 0) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + sweep), context.currentTime + duration);
  }

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(gain, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

function playSfx(type) {
  if (type === "launch") {
    playTone({ frequency: 140, duration: 0.18, gain: 0.03, type: "sawtooth", sweep: 120 });
    setTimeout(() => playTone({ frequency: 220, duration: 0.18, gain: 0.03, type: "triangle", sweep: 180 }), 80);
  }

  if (type === "success") {
    playTone({ frequency: 330, duration: 0.15, gain: 0.04, type: "triangle", sweep: 180 });
    setTimeout(() => playTone({ frequency: 440, duration: 0.18, gain: 0.04, type: "triangle", sweep: 200 }), 100);
  }

  if (type === "danger") {
    playTone({ frequency: 180, duration: 0.22, gain: 0.05, type: "square", sweep: -120 });
    setTimeout(() => playTone({ frequency: 90, duration: 0.24, gain: 0.05, type: "sawtooth", sweep: -80 }), 110);
  }

  if (type === "cashout") {
    playTone({ frequency: 390, duration: 0.12, gain: 0.04, type: "triangle", sweep: 200 });
    setTimeout(() => playTone({ frequency: 520, duration: 0.14, gain: 0.04, type: "triangle", sweep: 220 }), 75);
    setTimeout(() => playTone({ frequency: 660, duration: 0.18, gain: 0.04, type: "triangle", sweep: 260 }), 150);
  }
}

function toast(message) {
  const toastBox = document.querySelector("#toast");
  toastBox.textContent = message;
  toastBox.classList.add("show");
  window.setTimeout(() => toastBox.classList.remove("show"), 1800);
}

function update() {
  document.querySelector("#balance").textContent = state.balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
  document.querySelector("#cargo").textContent = `${state.cargo.toFixed(2)}×`;
  document.querySelector("#wager").textContent = `${state.bet} U`;
  document.querySelector("#mult").textContent = `${state.cargo.toFixed(2)}×`;
  document.querySelector("#potential").textContent = `${(state.bet * state.cargo).toFixed(2)} U`;
  document.querySelector("#discoveries").textContent = String(state.revealed.size);
  document.querySelector("#cashout").disabled = !state.started;
  document.querySelector("#status").textContent = state.started ? "EXPEDITION ACTIVE" : "READY TO LAUNCH";
  document.querySelector("#progress").style.width = `${Math.min(100, state.revealed.size * 9)}%`;
}

function randomUnit() {
  state.gameSeed = (state.gameSeed * 1664525 + 1013904223) >>> 0;
  return state.gameSeed / 4294967296;
}

function begin() {
  if (state.started) return;
  if (state.balance < state.bet) {
    toast("Insufficient bank.");
    return;
  }

  const session = chainAdapter.contract.launch({ wager: state.bet, player: "demo-wallet" });
  state.chainSession = session;
  state.balance -= state.bet;
  state.started = true;
  state.current = "start";
  state.cargo = 1;
  state.revealed = new Set(["start"]);
  state.blackDepth = 0;
  state.trip += 1;
  state.gameSeed = (Date.now() ^ (state.trip * 0x9e3779b9)) >>> 0;

  log(`<b>LAUNCH:</b> ${state.bet} U committed. Chain session ${session.gameId.slice(0, 8)} is active.`);
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
  const button = document.createElement("button");
  button.className = `btn ${modifier}`.trim();
  button.textContent = label;
  button.onclick = action;
  parent.appendChild(button);
}

function applyResult(node, result) {
  if (result.multiplier > 0) {
    state.cargo *= result.multiplier;
    log(`<b>${NODE_DEFS[node.type]?.name?.toUpperCase() ?? node.label}:</b> Cargo increased to ${state.cargo.toFixed(2)}×.`);
    playSfx("success");
  } else {
    log(`<b>DANGER:</b> the ${NODE_DEFS[node.type]?.name ?? node.label.toLowerCase()} claimed the expedition.`);
    playSfx("danger");
    lose();
    return;
  }

  closeOverlay();
}

function showTreasure(node) {
  if (state.chainSession) {
    const sessionResult = chainAdapter.contract.resolveNode({ gameId: state.chainSession.gameId, nodeType: node.type, choice: "safe" });
    state.chainSession.lastNodeResult = sessionResult;
    log(`<b>CHAIN:</b> ${node.type} resolved via simulator: ${sessionResult.multiplier.toFixed(2)}× cargo.`);
  }
  const outcome = resolveNodeEvent(node.type, "treasure", randomUnit());
  applyResult(node, outcome);
}

function showRisk(node, level) {
  if (state.chainSession) {
    const sessionResult = chainAdapter.contract.resolveNode({ gameId: state.chainSession.gameId, nodeType: node.type, choice: level });
    state.chainSession.lastNodeResult = sessionResult;
    log(`<b>CHAIN:</b> ${node.type} route ${level} resolved with ${sessionResult.multiplier.toFixed(2)}× potential.`);
  }

  const outcome = resolveNodeEvent(node.type, level, randomUnit());

  if (outcome.multiplier > 0) {
    state.cargo *= outcome.multiplier;
    log(`<b>${NODE_DEFS[node.type]?.name?.toUpperCase() ?? node.label}:</b> route survived. Cargo is now ${state.cargo.toFixed(2)}×.`);
    playSfx("success");
    closeOverlay();
    return;
  }

  log(`<b>DANGER:</b> ${NODE_DEFS[node.type]?.name ?? "The route"} consumed the expedition.`);
  playSfx("danger");
  lose();
}

function showWormhole(node) {
  const next = getNeighbours(node.id).filter((id) => id !== "start");
  const targetId = next[Math.floor(randomUnit() * next.length)];
  const target = mapNodes.find((entry) => entry.id === targetId);
  log(`<b>WORMHOLE:</b> spacetime folded. New vector acquired: ${target.label}.`);
  closeOverlay();
  state.current = target.id;
  state.revealed.add(target.id);
  renderNodes();
  update();
}

function showRuinsOutcome(node) {
  const outcome = resolveNodeEvent(node.type, "treasure", randomUnit());
  if (outcome.multiplier > 0) {
    state.cargo *= outcome.multiplier;
    log(`<b>ANCIENT RUINS:</b> ${outcome.result} discovered. Cargo is now ${state.cargo.toFixed(2)}×.`);
    closeOverlay();
    return;
  }

  log("<b>ANCIENT RUINS:</b> nothing remains but dust and static.");
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
      <p>The gravitational field deepens. Escape with your cargo, or choose another descent into the singular void.</p>
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
      log(`<b>BLACK HOLE:</b> survived ${stage.name}. Cargo is now ${state.cargo.toFixed(2)}×.`);

      if (state.blackDepth >= 5) {
        cashout();
        return;
      }

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
    addButton(actions, "COLLECT & CONTINUE", "primary", () => showTreasure(node));
    return;
  }

  if (node.type === "dead") {
    addButton(actions, "CONTINUE", "primary", () => closeOverlay());
    return;
  }

  if (node.type === "wormhole") {
    addButton(actions, "ENTER WORMHOLE", "primary", () => showWormhole(node));
    return;
  }

  if (node.type === "asteroid") {
    addButton(actions, "SAFE", "", () => showRisk(node, "safe"));
    addButton(actions, "RISKY", "primary", () => showRisk(node, "risky"));
    addButton(actions, "UNKNOWN", "danger", () => showRisk(node, "unknown"));
    return;
  }

  if (node.type === "ruins") {
    addButton(actions, "OPEN THE SITE", "primary", () => showRuinsOutcome(node));
    return;
  }

  if (node.type === "blackhole") {
    addButton(actions, "ESCAPE WITH CARGO", "", () => cashout());
    addButton(actions, "ENTER HORIZON", "primary", () => {
      state.blackDepth += 1;
      eventOverlay.remove();
      showBlackHole();
    });
  }
}

function lose() {
  document.querySelector("#event")?.remove();
  state.started = false;
  state.cargo = 1;
  state.blackDepth = 0;
  log("<b>SHIP LOST:</b> expedition payout 0 U.");
  toast("The void claimed the expedition.");
  playSfx("danger");
  update();
  renderNodes();
}

function cashout() {
  if (!state.started) return;

  const chainPayout = state.chainSession ? chainAdapter.contract.cashOut({ gameId: state.chainSession.gameId }) : { payout: state.bet * state.cargo };
  const payout = chainPayout?.payout ?? state.bet * state.cargo;
  state.balance += payout;
  state.started = false;
  state.cargo = 1;
  state.blackDepth = 0;
  state.chainSession = null;
  log(`<b>CASH OUT:</b> ${payout.toFixed(2)} U returned to bank.`);
  toast(`Expedition secured: ${payout.toFixed(2)} U`);
  playSfx("cashout");
  document.querySelector("#event")?.remove();
  update();
  renderNodes();
}

const betButtons = document.querySelectorAll(".bet");
for (const button of betButtons) {
  button.addEventListener("click", () => {
    if (state.started) return;
    for (const el of betButtons) {
      el.classList.remove("active");
    }
    button.classList.add("active");
    state.bet = Number(button.dataset.bet);
    update();
  });
}

document.querySelector("#cashout").addEventListener("click", cashout);
document.querySelector("#launch").addEventListener("click", begin);

const connectButton = document.querySelector("#connect");
if (connectButton) {
  connectButton.addEventListener("click", () => {
    toast("Demo wallet connected — replace adapter with Chain wallet flow.");
    connectButton.textContent = "WALLET CONNECTED";
  });
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
renderNodes();
update();

