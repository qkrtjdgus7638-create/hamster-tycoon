import { drawFood, upgradeHamster } from "./game.js";
import { loadState, resetState, saveState } from "./storage.js";
import { renderApp } from "./ui.js";

const root = document.querySelector("#app");
let state = loadState();
let lastEvent = null;

const handlers = {
  onDraw() {
    const result = drawFood(state);
    state = result.state;
    lastEvent = result.event;
    persistAndRender();
  },
  onUpgrade() {
    const result = upgradeHamster(state);
    state = result.state;
    lastEvent = result.event;
    persistAndRender();
  },
  onReset() {
    const confirmed = window.confirm("저장 데이터를 초기화할까요? 햄스터는 기억 못 하는 척합니다.");
    if (!confirmed) return;

    state = resetState();
    lastEvent = null;
    render();
  },
};

function persistAndRender() {
  saveState(state);
  render();
}

function render() {
  renderApp(root, state, handlers, lastEvent);
}

render();
