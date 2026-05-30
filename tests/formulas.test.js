import assert from "node:assert/strict";

import {
  addExpAndResolveLevels,
  calculateFoodRewards,
  getHamsterTier,
  getNextLevelExp,
  getUpgradeCost,
  getUpgradeMultiplier,
  getUpgradeRule,
} from "../src/js/formulas.js";

assert.equal(getNextLevelExp(1), 62);
assert.equal(getNextLevelExp(5), 350);

assert.equal(getHamsterTier(1).name, "아기 햄스터");
assert.equal(getHamsterTier(15).name, "볼주머니 햄스터");
assert.equal(getHamsterTier(120).name, "신화 햄스터");

assert.equal(getUpgradeMultiplier(0), 1);
assert.equal(getUpgradeMultiplier(10), 2.65);
assert.equal(getUpgradeMultiplier(15), 4.5);
assert.ok(getUpgradeMultiplier(12) > getUpgradeMultiplier(11));

assert.equal(getUpgradeCost(0, getHamsterTier(1)), 100);
assert.equal(getUpgradeCost(4, getHamsterTier(5)), 4500);

assert.deepEqual(getUpgradeRule(4), { successRate: 0.95, downgradeRate: 0 });
assert.deepEqual(getUpgradeRule(14), { successRate: 0.6, downgradeRate: 0.1 });
assert.deepEqual(getUpgradeRule(25), { successRate: 0.15, downgradeRate: 0.6 });

const rewards = calculateFoodRewards(
  { baseExp: 100, baseMoney: 1000 },
  { level: 30, upgrade: 5 },
);
assert.equal(rewards.exp, 120);
assert.equal(rewards.money, 2550);

const hamster = addExpAndResolveLevels({ level: 1, exp: 0, upgrade: 0 }, 200);
assert.equal(hamster.level, 3);
assert.equal(hamster.exp, 40);
assert.equal(hamster.levelUps, 2);

console.log("formula tests passed");
