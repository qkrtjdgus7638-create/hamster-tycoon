import { FOOD_GRADES } from "./data.js";
import {
  addExpAndResolveLevels,
  calculateFoodRewards,
  getHamsterTier,
  getUpgradeCost,
  getUpgradeRule,
} from "./formulas.js";

const MAX_LOGS = 10;
const MAX_RARE_HISTORY = 20;

export function drawFood(state, random = Math.random) {
  const food = rollFood(random);
  const rewards = calculateFoodRewards(food, state.hamster);
  const hamsterAfterExp = addExpAndResolveLevels(state.hamster, rewards.exp);
  const collection = updateCollection(state.collection, food, rewards);
  const logs = buildFoodLogs(state.logs, food, rewards, hamsterAfterExp.levelUps);
  const rareHistory = updateRareHistory(state.rareHistory, food, rewards);
  const money = state.money + rewards.money;
  const totalEarnedMoney = state.stats.totalEarnedMoney + rewards.money;

  return {
    state: {
      ...state,
      money,
      hamster: {
        level: hamsterAfterExp.level,
        exp: hamsterAfterExp.exp,
        upgrade: state.hamster.upgrade,
      },
      collection,
      rareHistory,
      logs,
      stats: {
        ...state.stats,
        totalDraws: state.stats.totalDraws + 1,
        totalEarnedMoney,
        totalEarnedExp: state.stats.totalEarnedExp + rewards.exp,
        maxMoneyBurst: Math.max(state.stats.maxMoneyBurst, rewards.money),
      },
      rankingSeed: {
        bestLevel: Math.max(state.rankingSeed.bestLevel, hamsterAfterExp.level),
        bestUpgrade: Math.max(state.rankingSeed.bestUpgrade, state.hamster.upgrade),
        totalEarnedMoney,
        updatedAt: new Date().toISOString(),
      },
    },
    event: {
      type: "food",
      food,
      rewards,
      levelUps: hamsterAfterExp.levelUps,
    },
  };
}

export function upgradeHamster(state, random = Math.random) {
  const tier = getHamsterTier(state.hamster.level);
  const cost = getUpgradeCost(state.hamster.upgrade, tier);
  const rule = getUpgradeRule(state.hamster.upgrade);

  if (state.money < cost) {
    return {
      state: {
        ...state,
        logs: prependLog(
          state.logs,
          `돈이 부족합니다. 햄스터가 지갑을 열어보고 조용히 닫았습니다. 필요: ${formatNumber(cost)}원`,
        ),
      },
      event: { type: "upgrade", success: false, affordable: false, cost },
    };
  }

  const success = random() < rule.successRate;
  const downgraded = !success && random() < rule.downgradeRate;
  const previousUpgrade = state.hamster.upgrade;
  const nextUpgrade = success
    ? previousUpgrade + 1
    : Math.max(0, previousUpgrade - (downgraded ? 1 : 0));
  const message = getUpgradeMessage(success, downgraded, previousUpgrade, nextUpgrade);
  const totalEarnedMoney = state.stats.totalEarnedMoney;

  return {
    state: {
      ...state,
      money: state.money - cost,
      hamster: {
        ...state.hamster,
        upgrade: nextUpgrade,
      },
      logs: prependLog(state.logs, `${message} (-${formatNumber(cost)}원)`),
      rankingSeed: {
        bestLevel: state.rankingSeed.bestLevel,
        bestUpgrade: Math.max(state.rankingSeed.bestUpgrade, nextUpgrade),
        totalEarnedMoney,
        updatedAt: new Date().toISOString(),
      },
    },
    event: {
      type: "upgrade",
      success,
      downgraded,
      affordable: true,
      previousUpgrade,
      nextUpgrade,
      cost,
    },
  };
}

function rollFood(random) {
  const roll = random() * 100;
  let cursor = 0;
  const grade = FOOD_GRADES.find((item) => {
    cursor += item.probability;
    return roll <= cursor;
  }) ?? FOOD_GRADES[0];

  const name = pick(grade.foods, random);

  return {
    id: `${grade.id}:${name}`,
    name,
    gradeId: grade.id,
    gradeName: grade.name,
    tone: grade.tone,
    baseExp: randomInt(grade.expRange[0], grade.expRange[1], random),
    baseMoney: randomInt(grade.moneyRange[0], grade.moneyRange[1], random),
  };
}

function updateCollection(collection, food, rewards) {
  const previous = collection[food.id] ?? {
    name: food.name,
    gradeId: food.gradeId,
    gradeName: food.gradeName,
    count: 0,
    totalExp: 0,
    totalMoney: 0,
    firstFoundAt: new Date().toISOString(),
  };

  return {
    ...collection,
    [food.id]: {
      ...previous,
      count: previous.count + 1,
      totalExp: previous.totalExp + rewards.exp,
      totalMoney: previous.totalMoney + rewards.money,
      lastFoundAt: new Date().toISOString(),
    },
  };
}

function updateRareHistory(history, food, rewards) {
  const recordableGrades = ["rare", "epic", "legendary", "mythic"];
  if (!recordableGrades.includes(food.gradeId)) return history;

  return [
    {
      id: crypto.randomUUID(),
      foodName: food.name,
      gradeName: food.gradeName,
      gradeId: food.gradeId,
      money: rewards.money,
      exp: rewards.exp,
      foundAt: new Date().toISOString(),
    },
    ...history,
  ].slice(0, MAX_RARE_HISTORY);
}

function buildFoodLogs(logs, food, rewards, levelUps) {
  const flavor = getFoodMessage(food, rewards);
  const levelMessage =
    levelUps > 0
      ? ` 레벨이 ${levelUps}번 올랐습니다. 햄스터가 성장통 대신 낮잠을 선택했습니다.`
      : "";

  return prependLog(
    logs,
    `${flavor} 경험치 +${formatNumber(rewards.exp)}, 돈 +${formatNumber(rewards.money)}원.${levelMessage}`,
  );
}

function getFoodMessage(food, rewards) {
  if (food.gradeId === "mythic") {
    return `신화 먹이 등장! 햄스터가 ${food.name}을 먹고 우주의 진리를 깨달았다가 까먹었습니다.`;
  }
  if (food.gradeId === "legendary") {
    return `전설 먹이 등장! 햄스터가 ${food.name}을 먹고 잠깐 왕좌를 요구했습니다.`;
  }
  if (food.gradeId === "epic") {
    return `햄스터가 ${food.name}을 먹고 눈빛만큼은 재벌이 됐습니다.`;
  }
  if (food.gradeId === "rare") {
    return `햄스터가 ${food.name}을 먹고 잠깐 부자가 된 표정을 지었습니다.`;
  }

  return `햄스터가 ${food.name}을 먹고 ${formatNumber(rewards.money)}원을 뱉었습니다.`;
}

function getUpgradeMessage(success, downgraded, previousUpgrade, nextUpgrade) {
  if (success) {
    return `강화 성공! +${previousUpgrade}에서 +${nextUpgrade}이 됐습니다. 햄스터가 근육 있는 척을 합니다.`;
  }
  if (downgraded) {
    return `강화 실패... 햄스터가 놀라서 +${previousUpgrade}에서 +${nextUpgrade}로 미끄러졌습니다.`;
  }
  return "강화 실패... 햄스터가 강화석 위에서 잠들었습니다.";
}

function prependLog(logs, message) {
  return [message, ...logs].slice(0, MAX_LOGS);
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}

function randomInt(min, max, random) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}
