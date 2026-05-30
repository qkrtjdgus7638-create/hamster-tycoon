import { HAMSTER_TIERS, UPGRADE_MULTIPLIER_ANCHORS } from "./data.js";

export function getNextLevelExp(level) {
  return Math.floor(50 + level ** 2 * 12);
}

export function getHamsterTier(level) {
  return HAMSTER_TIERS.reduce((current, tier) => {
    return level >= tier.minLevel ? tier : current;
  }, HAMSTER_TIERS[0]);
}

export function getUpgradeMultiplier(upgrade) {
  if (upgrade <= 0) return 1;

  for (let i = 0; i < UPGRADE_MULTIPLIER_ANCHORS.length - 1; i += 1) {
    const [leftLevel, leftValue] = UPGRADE_MULTIPLIER_ANCHORS[i];
    const [rightLevel, rightValue] = UPGRADE_MULTIPLIER_ANCHORS[i + 1];

    if (upgrade >= leftLevel && upgrade <= rightLevel) {
      const progress = (upgrade - leftLevel) / (rightLevel - leftLevel);
      return leftValue + (rightValue - leftValue) * progress;
    }
  }

  const extraLevels = upgrade - 30;
  return 25 * 1.14 ** extraLevels;
}

export function getUpgradeCost(upgrade, tier) {
  return Math.floor(100 * tier.upgradeCostMultiplier * (upgrade + 1) ** 2);
}

export function getUpgradeRule(upgrade) {
  if (upgrade <= 4) return { successRate: 0.95, downgradeRate: 0 };
  if (upgrade <= 9) return { successRate: 0.8, downgradeRate: 0 };
  if (upgrade <= 14) return { successRate: 0.6, downgradeRate: 0.1 };
  if (upgrade <= 19) return { successRate: 0.4, downgradeRate: 0.25 };
  if (upgrade <= 24) return { successRate: 0.25, downgradeRate: 0.4 };
  return { successRate: 0.15, downgradeRate: 0.6 };
}

export function calculateFoodRewards(food, hamster) {
  const tier = getHamsterTier(hamster.level);
  const exp = Math.floor(food.baseExp * tier.expMultiplier);
  const money = Math.floor(
    food.baseMoney * getUpgradeMultiplier(hamster.upgrade) * tier.moneyMultiplier,
  );

  return { exp, money, tier };
}

export function addExpAndResolveLevels(hamster, gainedExp) {
  let level = hamster.level;
  let exp = hamster.exp + gainedExp;
  let levelUps = 0;

  while (exp >= getNextLevelExp(level)) {
    exp -= getNextLevelExp(level);
    level += 1;
    levelUps += 1;
  }

  return {
    ...hamster,
    level,
    exp,
    levelUps,
  };
}

export function getProgressPercent(exp, level) {
  return Math.min(100, Math.floor((exp / getNextLevelExp(level)) * 100));
}
