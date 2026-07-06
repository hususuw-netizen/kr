const STORAGE_KEY = "kr_vocabulary_cards_v1";
const DAILY_MODE_KEY = "kr_daily_mode_v3";

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
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
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

function getPapagoLink(text) {
  return `https://papago.naver.com/?sk=ko&tk=zh-TW&st=${encodeURIComponent(text)}`;
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

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function speakKorean(text) {
  if (!("speechSynthesis" in window)) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("ko"));
  utterance.lang = "ko-KR";
  if (koreanVoice) utterance.voice = koreanVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

function createMeaningRow(value = "") {
  const row = document.createElement("div");
  row.className = "meaning-row";
  row.innerHTML = `
    <input name="meanings[]" placeholder="請輸入中文意思" value="${escapeHtml(value)}" />
    <button class="ghost meaning-remove" type="button" aria-label="刪除此意思">-</button>
  `;
  return row;
}

function fillMeaningRows(container, meanings) {
  if (!container) return;
  container.innerHTML = "";

  const nextMeanings = meanings.length ? meanings : [""];
  nextMeanings.forEach((meaning, index) => {
    const row = createMeaningRow(meaning);
    if (index === 0) {
      row.querySelector(".meaning-remove")?.setAttribute("hidden", "hidden");
    }
    container.appendChild(row);
  });
}

function collectMeanings(form) {
  return Array.from(form.querySelectorAll('input[name="meanings[]"]'))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function formatPartOfSpeech(value) {
  return String(value || "X").trim() || "X";
}

function createCardPayload(form) {
  const formData = new FormData(form);
  const korean = String(formData.get("korean") || "").trim();
  const meanings = collectMeanings(form);
  const partOfSpeech = formatPartOfSpeech(formData.get("partOfSpeech"));
  const example = String(formData.get("example") || "").trim();
  const memo = String(formData.get("memo") || "").trim();

  if (!korean || !meanings.length) return null;

  return {
    korean,
    meaning: meanings[0],
    meanings,
    partOfSpeech,
    example,
    memo,
  };
}

function incrementSeenCount(cardId) {
  const cards = loadCards();
  const card = cards.find((entry) => entry.id === cardId);
  if (!card) return;

  card.seenCount = Number(card.seenCount || 0) + 1;
  card.updatedAt = new Date().toISOString();
  saveCards(cards);
}

function ensureDailySession(cards) {
  const today = getTodayKey();
  const current = loadDailySessionRaw();
  const cardIds = cards.map((card) => card.id);
  const isToday = current.date === today;
  const usedTodayIds = Array.isArray(current.usedTodayIds) && isToday
    ? current.usedTodayIds.filter((id) => cardIds.includes(id))
    : [];
  const storedDeckIds = Array.isArray(current.deckIds) && isToday
    ? current.deckIds.filter((id) => cardIds.includes(id))
    : [];
  const remainingIds = cardIds.filter((id) => !usedTodayIds.includes(id));

  const deckIds = storedDeckIds.length
    ? storedDeckIds
    : shuffle(remainingIds).slice(0, 20);

  const rawResultById = isToday && current.resultById && typeof current.resultById === "object"
    ? current.resultById
    : {};
  const resultById = {};

  Object.entries(rawResultById).forEach(([id, value]) => {
    if (deckIds.includes(id) && (value === "remembered" || value === "forgot")) {
      resultById[id] = value;
    }
  });

  const session = {
    date: today,
    started: isToday ? Boolean(current.started) : false,
    ended: isToday ? Boolean(current.ended) : false,
    deckIds,
    usedTodayIds,
    resultById,
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

function updateToggleButton(button, showAnswer) {
  if (!button) return;
  button.textContent = showAnswer ? "答案：開" : "答案：關";
  button.setAttribute("aria-pressed", showAnswer ? "true" : "false");
  button.classList.toggle("is-on", showAnswer);
  button.classList.toggle("is-off", !showAnswer);
}

function initWritePage() {
  const form = document.querySelector("#card-form");
  if (!form) return;

  const formTitle = document.querySelector("#write-form-title");
  const submitButton = form.querySelector('button[type="submit"]');
  const list = document.querySelector("#card-list");
  const status = document.querySelector("#write-status");
  const totalCount = document.querySelector("#total-count");
  const maxViewsNode = document.querySelector("#max-views-write");
  const todayDailyStudiedNode = document.querySelector("#today-daily-studied");
  const searchInput = document.querySelector("#search");
  const koreanInput = document.querySelector("#korean");
  const partOfSpeechInput = document.querySelector("#part-of-speech");
  const posPicker = document.querySelector("#pos-picker");
  const meaningList = document.querySelector("#meaning-list");
  const addMeaningButton = document.querySelector("#add-meaning");
  const googleMeaningButton = document.querySelector("#google-meaning");

  const state = {
    editingCardId: null,
  };

  bindLiveClock("#write-now");

  const cancelEditButton = document.createElement("button");
  cancelEditButton.type = "button";
  cancelEditButton.className = "ghost";
  cancelEditButton.hidden = true;
  cancelEditButton.textContent = "取消編輯";
  submitButton?.parentElement?.appendChild(cancelEditButton);

  function setPosSelection(value) {
    const nextValue = formatPartOfSpeech(value);
    partOfSpeechInput.value = nextValue;
    posPicker?.querySelectorAll(".pos-option").forEach((button) => {
      button.classList.toggle("active", button.dataset.value === nextValue);
    });
  }

  function exitEditMode(message = "") {
    state.editingCardId = null;
    form.reset();
    fillMeaningRows(meaningList, [""]);
    setPosSelection("X");
    if (formTitle) formTitle.textContent = "新增單字卡";
    if (submitButton) submitButton.textContent = "儲存單字卡";
    cancelEditButton.hidden = true;
    if (message) status.textContent = message;
  }

  function enterEditMode(card) {
    state.editingCardId = card.id;
    koreanInput.value = card.korean || "";
    fillMeaningRows(meaningList, card.meanings?.length ? card.meanings : [card.meaning || ""]);
    setPosSelection(card.partOfSpeech || "X");
    form.example.value = card.example || "";
    form.memo.value = card.memo || "";
    if (formTitle) formTitle.textContent = "編輯單字卡";
    if (submitButton) submitButton.textContent = "更新單字卡";
    cancelEditButton.hidden = false;
    status.textContent = `正在編輯 ${card.korean}`;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    koreanInput.focus();
  }

  function render() {
    const cards = loadCards();
    const session = ensureDailySession(cards);
    const dailySet = new Set(session.usedTodayIds || []);
    const summary = getDailySummary(session);
    const keyword = String(searchInput.value || "").trim().toLowerCase();

    const filtered = cards.filter((card) => {
      if (!keyword) return true;
      return [
        card.korean,
        ...(card.meanings || [card.meaning]),
        card.example,
        card.memo,
        card.partOfSpeech,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });

    totalCount.textContent = String(cards.length);
    maxViewsNode.textContent = String(cards.reduce((max, card) => Math.max(max, Number(card.seenCount || 0)), 0));
    todayDailyStudiedNode.textContent = String(summary.answered);

    list.innerHTML = "";
    if (!filtered.length) {
      list.innerHTML = '<div class="empty">目前沒有符合條件的單字卡。</div>';
      return;
    }

    filtered
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
      .forEach((card) => {
        const meanings = card.meanings?.length ? card.meanings : [card.meaning];
        const dailyDot = dailySet.has(card.id)
          ? '<span class="daily-dot" title="今日已出現在隨機模式"></span>'
          : "";
        const item = document.createElement("article");
        item.className = "card";
        item.innerHTML = `
          <button class="delete-icon" type="button" aria-label="刪除 ${escapeHtml(card.korean)}" title="刪除" data-action="delete" data-id="${card.id}">X</button>
          <button class="edit-icon" type="button" aria-label="編輯 ${escapeHtml(card.korean)} 單字卡" title="編輯單字卡" data-action="edit" data-id="${card.id}">${getGearIcon()}</button>
          <div class="card-head">
            <div>
              <div class="word-line">
                <div class="word">${escapeHtml(card.korean)}</div>
                ${dailyDot}
              </div>
              <div class="meaning">${escapeHtml(meanings[0] || "")}</div>
            </div>
            <div class="pill">已看 ${Number(card.seenCount || 0)} 次</div>
          </div>
          <div class="meta">
            <div class="pill">${escapeHtml(formatPartOfSpeech(card.partOfSpeech))}</div>
          </div>
          ${
            meanings.length > 1
              ? `<div class="candidate-pills">${meanings.slice(1).map((meaning) => `<div class="pill">${escapeHtml(meaning)}</div>`).join("")}</div>`
              : ""
          }
          ${card.example ? `<p><strong>例句：</strong>${escapeHtml(card.example)}</p>` : ""}
          ${card.memo ? `<p><strong>備註：</strong>${escapeHtml(card.memo)}</p>` : ""}
          <div class="actions">
            <button class="secondary icon-button" type="button" aria-label="語音播放 ${escapeHtml(card.korean)}" title="語音播放" data-action="speak" data-id="${card.id}">${getVolumeIcon()}</button>
            <a class="button-link ghost" href="${getPapagoLink(card.korean)}" target="_blank" rel="noreferrer">Papago 翻譯</a>
          </div>
        `;
        list.appendChild(item);
      });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = createCardPayload(form);
    if (!payload) {
      status.textContent = "請至少填入韓文單字與一個中文意思。";
      return;
    }

    const cards = loadCards();
    if (state.editingCardId) {
      const card = cards.find((entry) => entry.id === state.editingCardId);
      if (!card) {
        exitEditMode("找不到要編輯的單字卡，已返回新增模式。");
        render();
        return;
      }

      card.korean = payload.korean;
      card.meaning = payload.meaning;
      card.meanings = payload.meanings;
      card.partOfSpeech = payload.partOfSpeech;
      card.example = payload.example;
      card.memo = payload.memo;
      card.updatedAt = new Date().toISOString();
      saveCards(cards);
      render();
      exitEditMode(`已更新 ${card.korean}`);
      return;
    }

    cards.push({
      id: createId(),
      seenCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    });
    saveCards(cards);
    render();
    exitEditMode(`已儲存 ${payload.korean}`);
  });

  list.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const actionButton = target.closest("[data-action]");
    if (!(actionButton instanceof HTMLElement)) return;

    const { action, id } = actionButton.dataset;
    if (!id) return;

    if (action === "delete") {
      const cards = loadCards();
      const card = cards.find((entry) => entry.id === id);
      if (!card) return;

      if (!window.confirm(`確定要刪除「${card.korean}」嗎？這筆單字卡會永久移除。`)) {
        status.textContent = "已取消刪除。";
        return;
      }

      saveCards(cards.filter((entry) => entry.id !== id));
      if (state.editingCardId === id) {
        exitEditMode();
      }
      render();
      status.textContent = "已刪除單字卡。";
      return;
    }

    if (action === "edit") {
      const card = loadCards().find((entry) => entry.id === id);
      if (!card) return;
      enterEditMode(card);
      return;
    }

    if (action === "speak") {
      const card = loadCards().find((entry) => entry.id === id);
      if (!card) return;
      const ok = speakKorean(card.korean);
      status.textContent = ok ? `正在播放 ${card.korean}` : "此瀏覽器不支援語音播放。";
    }
  });

  meaningList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const removeButton = target.closest(".meaning-remove");
    if (!(removeButton instanceof HTMLButtonElement)) return;
    if (meaningList.querySelectorAll(".meaning-row").length <= 1) return;
    removeButton.parentElement?.remove();
  });

  addMeaningButton?.addEventListener("click", () => {
    meaningList?.appendChild(createMeaningRow(""));
  });

  cancelEditButton.addEventListener("click", () => {
    exitEditMode("已取消編輯。");
  });

  searchInput.addEventListener("input", render);

  posPicker?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    if (!target.dataset.value) return;
    setPosSelection(target.dataset.value);
  });

  googleMeaningButton?.addEventListener("click", () => {
    const korean = String(koreanInput.value || "").trim();
    if (!korean) {
      status.textContent = "請先輸入韓文單字。";
      return;
    }
    window.open(getGoogleTranslateLink(korean), "_blank", "noreferrer");
    status.textContent = "已開啟 Google 翻譯。";
  });

  fillMeaningRows(meaningList, [""]);
  setPosSelection("X");
  render();
}

function initStudyPage() {
  const rootWord = document.querySelector("#study-word");
  if (!rootWord) return;

  const toggleAnswerButton = document.querySelector("#toggle-answer");
  const prevButton = document.querySelector("#prev-card");
  const nextButton = document.querySelector("#next-card");
  const speakButton = document.querySelector("#study-speak");
  const translateLink = document.querySelector("#study-papago-translate");
  const answer = document.querySelector("#study-answer");
  const example = document.querySelector("#study-example");
  const memo = document.querySelector("#study-memo");
  const currentIndexNode = document.querySelector("#current-index");
  const totalNode = document.querySelector("#study-total-inline");
  const statusNode = document.querySelector("#study-status");

  const state = {
    cards: [],
    currentIndex: 0,
    showAnswer: false,
    seenInRound: new Set(),
  };

  bindLiveClock("#study-now");

  function loadState() {
    state.cards = loadCards();
    state.currentIndex = 0;
    state.seenInRound = new Set();
  }

  function render() {
    totalNode.textContent = String(state.cards.length);

    if (!state.cards.length) {
      rootWord.textContent = "先去建立單字卡";
      answer.hidden = false;
      answer.textContent = "目前沒有資料，請先到新增單字卡頁新增內容。";
      example.hidden = true;
      memo.hidden = true;
      example.textContent = "";
      memo.textContent = "";
      currentIndexNode.textContent = "0";
      translateLink.href = "https://papago.naver.com/";
      statusNode.textContent = "";
      updateToggleButton(toggleAnswerButton, state.showAnswer);
      return;
    }

    const card = state.cards[state.currentIndex];
    const meanings = card.meanings?.length ? card.meanings : [card.meaning];
    if (!state.seenInRound.has(card.id)) {
      incrementSeenCount(card.id);
      state.seenInRound.add(card.id);
    }

    rootWord.textContent = card.korean;
    answer.hidden = !state.showAnswer;
    answer.textContent = meanings.join(" / ");
    example.textContent = card.example ? `例句：${card.example}` : "";
    memo.textContent = card.memo ? `備註：${card.memo}` : "";
    example.hidden = !card.example;
    memo.hidden = !card.memo;
    currentIndexNode.textContent = String(state.currentIndex + 1);
    translateLink.href = getPapagoLink(card.korean);
    statusNode.textContent = "";
    updateToggleButton(toggleAnswerButton, state.showAnswer);
  }

  toggleAnswerButton?.addEventListener("click", () => {
    state.showAnswer = !state.showAnswer;
    answer.hidden = !state.showAnswer;
    updateToggleButton(toggleAnswerButton, state.showAnswer);
  });

  prevButton?.addEventListener("click", () => {
    if (!state.cards.length) return;
    state.currentIndex = (state.currentIndex - 1 + state.cards.length) % state.cards.length;
    render();
  });

  nextButton?.addEventListener("click", () => {
    if (!state.cards.length) return;
    state.currentIndex = (state.currentIndex + 1) % state.cards.length;
    render();
  });

  speakButton?.addEventListener("click", () => {
    if (!state.cards.length) return;
    const card = state.cards[state.currentIndex];
    const ok = speakKorean(card.korean);
    statusNode.textContent = ok ? `正在播放 ${card.korean}` : "此瀏覽器不支援語音播放。";
  });

  loadState();
  render();
}

function initDailyPage() {
  const rootWord = document.querySelector("#daily-word");
  if (!rootWord) return;

  bindLiveClock("#daily-now");

  const startButton = document.querySelector("#daily-start");
  const endButton = document.querySelector("#daily-end");
  const backToStartButton = document.querySelector("#daily-back-to-start");
  const retryRoundButton = document.querySelector("#daily-new-mode");
  const rememberButton = document.querySelector("#daily-remember");
  const forgotButton = document.querySelector("#daily-forgot");
  const toggleAnswerButton = document.querySelector("#daily-toggle-answer");
  const answer = document.querySelector("#daily-answer");
  const example = document.querySelector("#daily-example");
  const memo = document.querySelector("#daily-memo");
  const currentIndexNode = document.querySelector("#daily-current-index");
  const totalNode = document.querySelector("#daily-total-inline");
  const statusNode = document.querySelector("#daily-status");
  const summaryNode = document.querySelector("#daily-summary");
  const summaryRemembered = document.querySelector("#daily-summary-remembered");
  const summaryForgot = document.querySelector("#daily-summary-forgot");

  const state = {
    cards: [],
    currentIndex: 0,
    showAnswer: false,
    session: null,
    seenInRound: new Set(),
  };

  function syncCardsFromSession(cards) {
    const cardMap = new Map(cards.map((card) => [card.id, card]));
    state.cards = state.session.deckIds.map((id) => cardMap.get(id)).filter(Boolean);
    state.currentIndex = 0;
  }

  function getRemainingIds(cards, usedTodayIds) {
    return cards.map((card) => card.id).filter((id) => !usedTodayIds.includes(id));
  }

  function hasRemainingToday() {
    const cards = loadCards();
    const usedTodayIds = state.session?.date === getTodayKey() ? state.session.usedTodayIds || [] : [];
    return getRemainingIds(cards, usedTodayIds).length > 0;
  }

  function loadState() {
    const cards = loadCards();
    state.session = ensureDailySession(cards);
    syncCardsFromSession(cards);
    state.seenInRound = new Set();
  }

  function prepareStartPage(preferNewDeck) {
    const cards = loadCards();
    const current = ensureDailySession(cards);
    const usedTodayIds = current.date === getTodayKey() ? current.usedTodayIds || [] : [];
    const remainingIds = getRemainingIds(cards, usedTodayIds);
    const useNewDeck = preferNewDeck && remainingIds.length > 0;
    const deckIds = useNewDeck ? shuffle(remainingIds).slice(0, 20) : current.deckIds;

    state.session = {
      date: getTodayKey(),
      started: false,
      ended: false,
      deckIds,
      usedTodayIds,
      resultById: {},
    };
    saveDailySession(state.session);
    syncCardsFromSession(cards);
    state.showAnswer = false;
    state.seenInRound = new Set();
    return useNewDeck;
  }

  function updateSummary() {
    const summary = getDailySummary(state.session || { deckIds: [], resultById: {} });
    summaryRemembered.textContent = String(summary.remembered);
    summaryForgot.textContent = String(summary.forgot);
  }

  function updateControls() {
    const started = Boolean(state.session?.started);
    const ended = Boolean(state.session?.ended);
    const canStart = hasRemainingToday();

    startButton.hidden = started || ended || !state.cards.length;
    startButton.disabled = !canStart;
    endButton.hidden = !started || ended;
    backToStartButton.hidden = !ended;
    retryRoundButton.hidden = !ended;
    rememberButton.hidden = !started || ended;
    forgotButton.hidden = !started || ended;
    toggleAnswerButton.hidden = !started || ended;
    summaryNode.hidden = !ended;

    updateToggleButton(toggleAnswerButton, state.showAnswer);
    updateSummary();
  }

  function render() {
    totalNode.textContent = String(state.cards.length);

    if (!state.cards.length) {
      rootWord.textContent = "今日沒有可抽的單字";
      answer.hidden = false;
      answer.textContent = "請先到新增單字卡頁建立內容，或等每日題庫在 0:00 重置。";
      example.textContent = "";
      memo.textContent = "";
      example.hidden = true;
      memo.hidden = true;
      currentIndexNode.textContent = "0";
      statusNode.textContent = "";
      updateControls();
      return;
    }

    if (state.session.ended) {
      const summary = getDailySummary(state.session);
      rootWord.textContent = "本輪已結束";
      answer.hidden = false;
      answer.textContent = `本次完成 ${summary.answered} / ${summary.total} 題，可回到開始頁或本輪重測。`;
      example.textContent = "";
      memo.textContent = "";
      example.hidden = true;
      memo.hidden = true;
      currentIndexNode.textContent = String(summary.answered);
      statusNode.textContent = "下方可查看本輪統整。";
      updateControls();
      return;
    }

    if (!state.session.started) {
      const canStart = hasRemainingToday();
      rootWord.textContent = canStart ? "按開始進入今日 20 題" : "今天沒有未測過的單字";
      answer.hidden = false;
      answer.textContent = canStart
        ? "開始後會鎖定今天的 20 題，直到 0:00 才重置。"
        : "今天可抽的單字都已出現過了，請等 0:00 重置。";
      example.textContent = "";
      memo.textContent = "";
      example.hidden = true;
      memo.hidden = true;
      currentIndexNode.textContent = "0";
      statusNode.textContent = "";
      updateControls();
      return;
    }

    const card = state.cards[state.currentIndex];
    const meanings = card.meanings?.length ? card.meanings : [card.meaning];
    if (!state.seenInRound.has(card.id)) {
      incrementSeenCount(card.id);
      state.seenInRound.add(card.id);
    }

    rootWord.textContent = card.korean;
    answer.hidden = !state.showAnswer;
    answer.textContent = meanings.join(" / ");
    example.textContent = card.example ? `例句：${card.example}` : "";
    memo.textContent = card.memo ? `備註：${card.memo}` : "";
    example.hidden = !card.example;
    memo.hidden = !card.memo;
    currentIndexNode.textContent = String(state.currentIndex + 1);

    const result = state.session.resultById?.[card.id];
    rememberButton.classList.toggle("is-selected", result === "remembered");
    forgotButton.classList.toggle("is-selected", result === "forgot");

    statusNode.textContent = "";
    updateControls();
  }

  function advanceAfterAnswer() {
    const unansweredIndex = state.cards.findIndex((card) => !state.session.resultById?.[card.id]);
    if (unansweredIndex >= 0) {
      state.currentIndex = unansweredIndex;
      return;
    }

    state.session.ended = true;
    saveDailySession(state.session);
  }

  startButton?.addEventListener("click", () => {
    if (!hasRemainingToday()) return;
    state.seenInRound = new Set();
    state.session.started = true;
    state.session.ended = false;
    state.session.usedTodayIds = Array.from(new Set([...(state.session.usedTodayIds || []), ...state.session.deckIds]));
    state.currentIndex = 0;
    saveDailySession(state.session);
    render();
  });

  endButton?.addEventListener("click", () => {
    state.session.ended = true;
    saveDailySession(state.session);
    render();
  });

  backToStartButton?.addEventListener("click", () => {
    const switched = prepareStartPage(true);
    render();
    statusNode.textContent = switched
      ? "已切換到今天尚未出現的新一輪。"
      : "今天沒有新的單字了，已回到開始頁。";
  });

  retryRoundButton?.addEventListener("click", () => {
    state.session.started = true;
    state.session.ended = false;
    state.session.resultById = {};
    state.currentIndex = 0;
    state.showAnswer = false;
    state.seenInRound = new Set();
    saveDailySession(state.session);
    statusNode.textContent = "已重新開始本輪。";
    render();
  });

  rememberButton?.addEventListener("click", () => {
    if (!state.session.started || state.session.ended || !state.cards.length) return;
    const card = state.cards[state.currentIndex];
    state.session.resultById[card.id] = "remembered";
    saveDailySession(state.session);
    advanceAfterAnswer();
    render();
  });

  forgotButton?.addEventListener("click", () => {
    if (!state.session.started || state.session.ended || !state.cards.length) return;
    const card = state.cards[state.currentIndex];
    state.session.resultById[card.id] = "forgot";
    saveDailySession(state.session);
    advanceAfterAnswer();
    render();
  });

  toggleAnswerButton?.addEventListener("click", () => {
    state.showAnswer = !state.showAnswer;
    answer.hidden = !state.showAnswer;
    updateToggleButton(toggleAnswerButton, state.showAnswer);
  });

  loadState();
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initWritePage();
  initStudyPage();
  initDailyPage();
});
