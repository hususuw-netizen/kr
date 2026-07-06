const STORAGE_KEY = "kr_vocabulary_cards_v1";
const DAILY_MODE_KEY = "kr_daily_mode_v2";

function loadCards() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function formatNow() {
  return new Date().toLocaleString("zh-TW", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function bindLiveClock(selector) {
  const node = document.querySelector(selector);
  if (!node) return;

  const renderNow = () => {
    node.textContent = formatNow();
  };

  renderNow();
  window.setInterval(renderNow, 1000);
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadDailySessionRaw() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_MODE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveDailySession(session) {
  localStorage.setItem(DAILY_MODE_KEY, JSON.stringify(session));
}

function ensureDailySession(cards) {
  const today = getTodayKey();
  const cardIds = cards.map((card) => card.id);
  const current = loadDailySessionRaw();
  const isToday = current.date === today;

  const usedTodayIds = Array.isArray(current.usedTodayIds) && isToday
    ? current.usedTodayIds.filter((id) => cardIds.includes(id))
    : [];

  let deckIds = Array.isArray(current.deckIds) && isToday ? current.deckIds.filter((id) => cardIds.includes(id)) : [];
  if (!deckIds.length) {
    const remainingIds = cardIds.filter((id) => !usedTodayIds.includes(id));
    deckIds = shuffle([...remainingIds]).slice(0, 20);
  }

  const resultById = isToday && current.resultById && typeof current.resultById === "object" ? current.resultById : {};
  const cleanedResultById = {};
  Object.entries(resultById).forEach(([id, value]) => {
    if (deckIds.includes(id) && (value === "remembered" || value === "forgot")) {
      cleanedResultById[id] = value;
    }
  });

  const session = {
    date: today,
    started: isToday ? Boolean(current.started) : false,
    ended: isToday ? Boolean(current.ended) : false,
    deckIds,
    usedTodayIds,
    resultById: cleanedResultById,
  };

  saveDailySession(session);
  return session;
}

function getDailySummary(session) {
  const values = Object.values(session.resultById || {});
  const remembered = values.filter((value) => value === "remembered").length;
  const forgot = values.filter((value) => value === "forgot").length;
  return {
    remembered,
    forgot,
    answered: remembered + forgot,
    total: session.deckIds?.length || 0,
  };
}

function getPapagoLink(text, target = "zh-TW") {
  return `https://papago.naver.com/?sk=ko&tk=${encodeURIComponent(target)}&st=${encodeURIComponent(text)}`;
}

function getGoogleTranslateLink(text) {
  return `https://translate.google.com/?sl=ko&tl=zh-TW&text=${encodeURIComponent(text)}&op=translate`;
}

function getVolumeIcon() {
  return `
    <svg class="icon-volume" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M11 5 6 9H3v6h3l5 4z"></path>
      <path d="M15.5 8.5a5 5 0 0 1 0 7"></path>
      <path d="M18.5 5.5a9 9 0 0 1 0 13"></path>
    </svg>
  `;
}

function getGearIcon() {
  return `
    <svg class="icon-gear" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21a2 2 0 1 1-4 0v-.08A1.7 1.7 0 0 0 9.2 20a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H2.9a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.08-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9.2 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.08V2.9a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 .4 1.08 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.27.3.48.64.6 1a1.7 1.7 0 0 0 1.08.4h.02a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.08.4 1.7 1.7 0 0 0-.52.2z"></path>
    </svg>
  `;
}

function formatPartOfSpeech(partOfSpeech) {
  const value = String(partOfSpeech || "X").trim() || "X";
  return value;
}

function speakKorean(text) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ko"));
  utterance.lang = "ko-KR";
  if (koreanVoice) utterance.voice = koreanVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

async function fetchGoogleTranslation(text) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ text }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.message || "蝧餉陌憭望???);
  }
  return String(result.translatedText || "").trim();
}

function getMeaningInputs(form) {
  return Array.from(form.querySelectorAll('input[name="meanings[]"]'));
}

function collectMeanings(form) {
  return getMeaningInputs(form)
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function createCardPayload(form) {
  const formData = new FormData(form);
  const korean = String(formData.get("korean") || "").trim();
  const partOfSpeech = String(formData.get("partOfSpeech") || "X").trim();
  const example = String(formData.get("example") || "").trim();
  const memo = String(formData.get("memo") || "").trim();
  const meanings = collectMeanings(form);

  if (!korean || !meanings.length) return null;

  return {
    id: createId(),
    korean,
    meaning: meanings[0],
    meanings,
    partOfSpeech,
    example,
    memo,
    seenCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createMeaningRow(value = "") {
  const row = document.createElement("div");
  row.className = "meaning-row";
  row.innerHTML = `
    <input name="meanings[]" placeholder="靘?摮豢" value="${escapeHtml(value)}" />
    <button class="ghost meaning-remove" type="button" aria-label="?芷????>-</button>
  `;
  return row;
}

function resetMeaningRows(container) {
  if (!container) return;
  container.innerHTML = "";
  const firstRow = createMeaningRow("");
  firstRow.querySelector(".meaning-remove")?.setAttribute("hidden", "hidden");
  container.appendChild(firstRow);
}

function incrementSeenCount(cardId) {
  const cards = loadCards();
  const card = cards.find((entry) => entry.id === cardId);
  if (!card) return;
  card.seenCount += 1;
  card.updatedAt = new Date().toISOString();
  saveCards(cards);
}

a... truncated for brevity