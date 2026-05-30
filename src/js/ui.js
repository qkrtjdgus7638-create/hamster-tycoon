import { FOOD_GRADES } from "./data.js";
import {
  getHamsterTier,
  getNextLevelExp,
  getProgressPercent,
  getUpgradeCost,
} from "./formulas.js";

const gradeOrder = new Map(FOOD_GRADES.map((grade, index) => [grade.id, index]));

export function renderApp(root, state, handlers, lastEvent = null) {
  const tier = getHamsterTier(state.hamster.level);
  const nextExp = getNextLevelExp(state.hamster.level);
  const upgradeCost = getUpgradeCost(state.hamster.upgrade, tier);
  const collectionItems = getCollectionItems(state.collection);
  const featuredClass = lastEvent?.food?.gradeId ? `is-${lastEvent.food.gradeId}` : "";
  const skin = getHamsterSkin(state.hamster.upgrade);
  const activity = getHamsterActivity(lastEvent);

  root.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">무료 MVP</p>
        <h1>햄찌 코인 공장</h1>
      </div>
      <div class="topbar-actions">
        <div class="money-pill">
          <span>보유 돈</span>
          <strong>${formatNumber(state.money)}원</strong>
        </div>
        <button class="menu-button" data-action="toggle-menu" aria-label="메뉴 열기" aria-expanded="false" aria-controls="game-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <main class="game-layout">
      <section class="hero-panel ${featuredClass}" aria-live="polite">
        <div class="cage-scene ${activity}" aria-label="햄스터 케이지">
          <div class="cage-back">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="cage-floor"></div>

          <button class="cage-object object-wheel" type="button" aria-label="쳇바퀴">
            <span class="wheel-ring"></span>
            <span class="wheel-spoke spoke-a"></span>
            <span class="wheel-spoke spoke-b"></span>
            <span class="wheel-stand"></span>
          </button>
          <button class="cage-object object-bottle" type="button" aria-label="물통">
            <span class="bottle-body"></span>
            <span class="bottle-water"></span>
            <span class="bottle-nozzle"></span>
            <span class="bottle-drop"></span>
          </button>
          <button class="cage-object object-feeder" type="button" aria-label="먹이통">
            <span class="feeder-bowl"></span>
            <span class="feed feed-a"></span>
            <span class="feed feed-b"></span>
            <span class="feed feed-c"></span>
          </button>

          <div class="hamster-shadow"></div>
          <div class="hamster-sprite ${skin.id}" aria-label="${skin.name}">
            <span class="hamster-ear left-ear"></span>
            <span class="hamster-ear right-ear"></span>
            <span class="hamster-body"></span>
            <span class="hamster-belly"></span>
            <span class="hamster-eye left-eye"></span>
            <span class="hamster-eye right-eye"></span>
            <span class="hamster-nose"></span>
            <span class="hamster-mouth"></span>
            <span class="hamster-cheek left-cheek"></span>
            <span class="hamster-cheek right-cheek"></span>
            <span class="hamster-paw left-paw"></span>
            <span class="hamster-paw right-paw"></span>
            <span class="skin-mark skin-mark-a"></span>
            <span class="skin-mark skin-mark-b"></span>
          </div>
          ${renderLastFood(lastEvent)}
        </div>

        <div class="hamster-summary">
          <div>
            <p class="eyebrow">현재 햄스터</p>
            <h2>Lv.${state.hamster.level} ${tier.name}</h2>
          </div>
          <strong class="upgrade-badge">+${state.hamster.upgrade}</strong>
        </div>

        <div class="exp-row">
          <div class="exp-label">
            <span>경험치</span>
            <strong>${formatNumber(state.hamster.exp)} / ${formatNumber(nextExp)}</strong>
          </div>
          <div class="meter" aria-label="레벨 경험치 진행률">
            <span style="width: ${getProgressPercent(state.hamster.exp, state.hamster.level)}%"></span>
          </div>
        </div>

        <section class="compact-log-panel">
          <div class="compact-log-heading">
            <h2>최근 로그</h2>
            <span>${formatNumber(state.stats.totalDraws)}회 뽑음</span>
          </div>
          <ol class="compact-log-list">
            ${state.logs.map((log) => `<li>${escapeHtml(log)}</li>`).join("")}
          </ol>
        </section>
      </section>
    </main>

    <nav class="bottom-actions" aria-label="주요 행동">
      <button class="primary-action" data-action="draw">
        <span>먹이 뽑기</span>
        <small>뽑자마자 자동 먹방</small>
      </button>
      <button class="secondary-action" data-action="upgrade">
        <span>햄스터 강화</span>
        <small>다음 강화 ${formatNumber(upgradeCost)}원</small>
      </button>
    </nav>

    <div class="menu-scrim" data-action="close-menu" hidden></div>
    <aside class="game-menu" id="game-menu" hidden>
      <div class="menu-heading">
        <div>
          <p class="eyebrow">햄찌 서랍</p>
          <h2>메뉴</h2>
        </div>
        <button class="menu-close" data-action="close-menu">닫기</button>
      </div>

      <section class="info-panel">
        <div class="panel-heading">
          <h2>먹이 도감</h2>
          <span>${collectionItems.length}/${FOOD_GRADES.reduce((sum, grade) => sum + grade.foods.length, 0)}종</span>
        </div>
        <div class="collection-grid">
          ${renderCollection(collectionItems)}
        </div>
      </section>

      <section class="info-panel">
        <div class="panel-heading">
          <h2>희귀 기록</h2>
          <span>랭킹 확장용 데이터</span>
        </div>
        <div class="history-list">
          ${renderRareHistory(state.rareHistory)}
        </div>
      </section>

      <button class="reset-menu-action" data-action="reset">
        <span>저장 초기화</span>
        <small>처음부터 다시. 햄스터는 모르는 척합니다.</small>
      </button>
    </aside>
  `;

  root.querySelector("[data-action='draw']").addEventListener("click", handlers.onDraw);
  root
    .querySelector("[data-action='upgrade']")
    .addEventListener("click", handlers.onUpgrade);
  root.querySelector("[data-action='reset']").addEventListener("click", handlers.onReset);
  root
    .querySelector("[data-action='toggle-menu']")
    .addEventListener("click", () => toggleMenu(root, true));
  root.querySelectorAll("[data-action='close-menu']").forEach((element) => {
    element.addEventListener("click", () => toggleMenu(root, false));
  });
}

function toggleMenu(root, isOpen) {
  const menu = root.querySelector("#game-menu");
  const scrim = root.querySelector(".menu-scrim");
  const button = root.querySelector("[data-action='toggle-menu']");

  menu.hidden = !isOpen;
  scrim.hidden = !isOpen;
  button.setAttribute("aria-expanded", String(isOpen));
}

function getHamsterActivity(lastEvent) {
  if (lastEvent?.type === "food") return "is-eating";
  if (lastEvent?.type === "upgrade" && lastEvent.success) return "is-proud";
  if (lastEvent?.type === "upgrade" && lastEvent.affordable === false) return "is-thirsty";
  if (lastEvent?.type === "upgrade") return "is-wheel";
  return "is-idle";
}

function getHamsterSkin(upgrade) {
  const skins = [
    { minUpgrade: 0, id: "skin-basic", name: "기본 햄스터" },
    { minUpgrade: 5, id: "skin-sprout", name: "새싹 햄스터" },
    { minUpgrade: 10, id: "skin-cheese", name: "치즈 햄스터" },
    { minUpgrade: 15, id: "skin-berry", name: "딸기볼 햄스터" },
    { minUpgrade: 20, id: "skin-gold", name: "황금 햄스터" },
    { minUpgrade: 25, id: "skin-cosmic", name: "우주 햄스터" },
  ];

  return skins.reduce((current, skin) => {
    return upgrade >= skin.minUpgrade ? skin : current;
  }, skins[0]);
}

function renderLastFood(lastEvent) {
  if (lastEvent?.type !== "food") {
    return '<div class="food-pop idle">?</div>';
  }

  return `
    <div class="food-pop ${lastEvent.food.tone}">
      <span>${getFoodIcon(lastEvent.food.gradeId)}</span>
      <strong>${lastEvent.food.name}</strong>
    </div>
  `;
}

function renderCollection(items) {
  if (items.length === 0) {
    return '<p class="empty-copy">아직 도감이 비었습니다. 햄스터가 종이만 씹고 있습니다.</p>';
  }

  return items
    .map(
      (item) => `
        <article class="food-card ${item.gradeId}">
          <span class="grade-chip">${item.gradeName}</span>
          <h3>${item.name}</h3>
          <dl>
            <div><dt>획득</dt><dd>${formatNumber(item.count)}회</dd></div>
            <div><dt>총 경험치</dt><dd>${formatNumber(item.totalExp)}</dd></div>
            <div><dt>총 돈</dt><dd>${formatNumber(item.totalMoney)}원</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
}

function renderRareHistory(history) {
  if (history.length === 0) {
    return '<p class="empty-copy">희귀 이상 먹이가 나오면 여기에 박제됩니다.</p>';
  }

  return history
    .map(
      (item) => `
        <div class="history-item ${item.gradeId}">
          <strong>${item.gradeName} · ${item.foodName}</strong>
          <span>+${formatNumber(item.exp)} EXP / +${formatNumber(item.money)}원</span>
        </div>
      `,
    )
    .join("");
}

function getCollectionItems(collection) {
  return Object.values(collection).sort((left, right) => {
    const gradeDiff = gradeOrder.get(left.gradeId) - gradeOrder.get(right.gradeId);
    if (gradeDiff !== 0) return gradeDiff;
    return left.name.localeCompare(right.name, "ko");
  });
}

function getFoodIcon(gradeId) {
  const icons = {
    common: "씨",
    uncommon: "칩",
    rare: "★",
    epic: "◆",
    legendary: "왕",
    mythic: "우주",
  };
  return icons[gradeId] ?? "먹이";
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
