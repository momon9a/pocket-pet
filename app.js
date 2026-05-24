const STORAGE_KEY = "pocket-pet-state-v1";

const defaultState = {
  name: "Momo",
  hunger: 80,
  mood: 75,
  mode: "idle",
  lastSeen: Date.now()
};

const lines = {
  idle: ["今天也一起待一会儿吧。", "点点我，我会有反应。", "我在这里，哪也不去。"],
  feed: ["好吃！再来一口也可以。", "饱饱的，心情变好了。"],
  play: ["嘿！这个我喜欢。", "再玩一会儿吧。"],
  nap: ["我眯一下，醒来会更精神。", "呼噜呼噜。"],
  pet: ["摸摸很舒服。", "嘿嘿。", "我听见你啦。"]
};

const state = loadState();

const petNameTitle = document.querySelector("#petNameTitle");
const renameButton = document.querySelector("#renameButton");
const hungerText = document.querySelector("#hungerText");
const moodText = document.querySelector("#moodText");
const hungerBar = document.querySelector("#hungerBar");
const moodBar = document.querySelector("#moodBar");
const speechBubble = document.querySelector("#speechBubble");
const petButton = document.querySelector("#petButton");
const feedButton = document.querySelector("#feedButton");
const playButton = document.querySelector("#playButton");
const napButton = document.querySelector("#napButton");
const installCard = document.querySelector("#installCard");
const dismissInstall = document.querySelector("#dismissInstall");

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { ...defaultState };

  try {
    const parsed = JSON.parse(saved);
    const hoursAway = Math.max(0, (Date.now() - Number(parsed.lastSeen || Date.now())) / 36e5);
    return {
      ...defaultState,
      ...parsed,
      hunger: clamp(Number(parsed.hunger) - Math.floor(hoursAway * 4)),
      mood: clamp(Number(parsed.mood) - Math.floor(hoursAway * 2)),
      lastSeen: Date.now()
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function render() {
  petNameTitle.textContent = state.name;
  hungerText.textContent = state.hunger;
  moodText.textContent = state.mood;
  hungerBar.style.width = `${state.hunger}%`;
  moodBar.style.width = `${state.mood}%`;
  petButton.classList.toggle("sleepy", state.mode === "nap");
  saveState();
}

function speak(message) {
  speechBubble.textContent = message;
  speechBubble.classList.remove("hidden");
  window.clearTimeout(speak.timer);
  speak.timer = window.setTimeout(() => speechBubble.classList.add("hidden"), 3600);
}

function celebrate() {
  petButton.classList.remove("happy");
  void petButton.offsetWidth;
  petButton.classList.add("happy");
}

function act(kind) {
  if (kind === "feed") {
    state.hunger = clamp(state.hunger + 18);
    state.mood = clamp(state.mood + 4);
    state.mode = "idle";
  }

  if (kind === "play") {
    state.mood = clamp(state.mood + 16);
    state.hunger = clamp(state.hunger - 6);
    state.mode = "idle";
  }

  if (kind === "nap") {
    state.mood = clamp(state.mood + 8);
    state.hunger = clamp(state.hunger - 2);
    state.mode = "nap";
  }

  if (kind === "pet") {
    state.mood = clamp(state.mood + 5);
  }

  render();
  celebrate();
  speak(pick(lines[kind]));
}

function renamePet() {
  const nextName = window.prompt("给桌宠取个名字", state.name);
  if (!nextName) return;
  state.name = nextName.trim().slice(0, 12) || state.name;
  render();
  speak(`${state.name} 记住自己的名字了。`);
}

function showInstallHint() {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  const dismissed = localStorage.getItem("install-hint-dismissed") === "yes";
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  installCard.hidden = !isIOS || isStandalone || dismissed;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      console.info("Service worker registration skipped.");
    });
  });
}

feedButton.addEventListener("click", () => act("feed"));
playButton.addEventListener("click", () => act("play"));
napButton.addEventListener("click", () => act("nap"));
petButton.addEventListener("click", () => act("pet"));
renameButton.addEventListener("click", renamePet);
dismissInstall.addEventListener("click", () => {
  localStorage.setItem("install-hint-dismissed", "yes");
  installCard.hidden = true;
});

window.setInterval(() => {
  state.hunger = clamp(state.hunger - 1);
  if (state.hunger < 30) state.mood = clamp(state.mood - 1);
  if (state.mode !== "nap") speak(pick(lines.idle));
  render();
}, 90_000);

render();
showInstallHint();
registerServiceWorker();
