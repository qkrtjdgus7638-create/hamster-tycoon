import { FOOD_GRADES } from "./data.js";
import {
  getHamsterTier,
  getNextLevelExp,
  getProgressPercent,
  getUpgradeCost,
  getUpgradeMultiplier,
  getUpgradeRule,
} from "./formulas.js";

const gradeOrder = new Map(FOOD_GRADES.map((grade, index) => [grade.id, index]));

export function renderApp(root, state, handlers, lastEvent = null) {
  const tier = getHamsterTier(state.hamster.level);
  const nextExp = getNextLevelExp(state.hamster.level);
  const upgradeCost = getUpgradeCost(state.hamster.upgrade, tier);
  const upgradeRule = getUpgradeRule(state.hamster.upgrade);
  const upgradeMultiplier = getUpgradeMultiplier(state.hamster.upgrade);
  const collectionItems = getCollectionItems(state.collection);
  const featuredClass = lastEvent?.food?.gradeId ? `is-${lastEvent.food.gradeId}` : "";

  root.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">무료 MVP</p>
        <h1>햄찌 코인 공장</h1>
      </div>
      <div class="money-pill">
        <span>보유 돈</span>
        <strong>${formatNumber(state.money)}원</strong>
      </div>
    </header>

    <main class="game-layout">
      <section class="hero-panel ${featuredClass}" aria-live="polite">
        <div class="hamster-stage">
          <div class="hamster-shadow"></div>
          <div class="hamster-face" aria-label="햄스터 임시 캐릭터">
            <span class="ear left-ear"></span>
            <span class="ear right-ear"></span>
            <span class="eye left-eye"></span>
            <span class="eye right-eye"></span>
            <span class="nose"></span>
            <span class="cheek left-cheek"></span>
            <span class="cheek right-cheek"></span>
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

        <div class="stat-grid">
          ${renderStat("돈 배율", `${formatMultiplier(tier.moneyMultiplier)}x`)}
          ${renderStat("경험치 배율", `${formatMultiplier(tier.expMultiplier)}x`)}
          ${renderStat("강화 배율", `${formatMultiplier(upgradeMultiplier)}x`)}
          ${renderStat("다음 강화", `${formatNumber(upgradeCost)}원`)}
        </div>
      </section>

      <section class="action-panel">
        <button class="primary-action" data-action="draw">
          <span>먹이 뽑기</span>
          <small>뽑자마자 자동 먹방</small>
        </button>
        <button class="secondary-action" data-action="upgrade">
          <span>햄스터 강화</span>
          <small>성공률 ${Math.round(upgradeRule.successRate * 100)}%</small>
        </button>
        <button class="secondary-action" data-action="toggle-dex">
          <span>도감 보기</span>
          <small>${collectionItems.length}종 발견</small>
        </button>
        <button class="ghost-action" data-action="reset">
          <span>저장 초기화</span>
          <small>처음부터 다시</small>
        </button>
      </section>

      <section class="info-panel">
        <div class="panel-heading">
          <h2>최근 로그</h2>
          <span>${formatNumber(state.stats.totalDraws)}회 뽑음</span>
        </div>
        <ol class="log-list">
          ${state.logs.map((log) => `<li>${escapeHtml(log)}</li>`).join("")}
        </ol>
      </section>

      <section class="info-panel collection-panel" id="collection-panel" hidden>
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
          <span>랭킹 확장용 데이터 포함</span>
        </div>
        <div class="history-list">
          ${renderRareHistory(state.rareHistory)}
        </div>
      </section>
    </main>
  `;

  root.querySelector("[data-action='draw']").addEventListener("click", handlers.onDraw);
  root
    .querySelector("[data-action='upgrade']")
    .addEventListener("click", handlers.onUpgrade);
  root.querySelector("[data-action='reset']").addEventListener("click", handlers.onReset);
  root
    .querySelector("[data-action='toggle-dex']")
    .addEventListener("click", () => {
      const panel = root.querySelector("#collection-panel");
      panel.hidden = !panel.hidden;
      if (!panel.hidden) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
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

function renderStat(label, value) {
  return `
    <div class="stat-card">
      <span>${label}</span>
      <strong>${value}</strong>
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

function formatMultiplier(value) {
  return value.toFixed(2);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
