import { DEFAULT_STATE } from "./data.js";

const STORAGE_KEY = "hamster-grow-mvp-state";

export function createInitialState() {
  return structuredClone(DEFAULT_STATE);
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();

    return mergeState(createInitialState(), JSON.parse(saved));
  } catch {
    return createInitialState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}

function mergeState(base, saved) {
  return {
    ...base,
    ...saved,
    hamster: { ...base.hamster, ...saved.hamster },
    collection: { ...base.collection, ...saved.collection },
    stats: { ...base.stats, ...saved.stats },
    rankingSeed: { ...base.rankingSeed, ...saved.rankingSeed },
    logs: Array.isArray(saved.logs) ? saved.logs : base.logs,
    rareHistory: Array.isArray(saved.rareHistory)
      ? saved.rareHistory
      : base.rareHistory,
  };
}
