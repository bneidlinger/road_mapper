import { mapState } from '../settings/state.js';
import { drawRoad } from '../elements/road.js';

let ctx = null;

export function initCanvas() {
  const canvas = document.getElementById('road-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  render();
}

export function render() {
  if (!ctx) return;
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(mapState.panX, mapState.panY);
  ctx.scale(mapState.zoom, mapState.zoom);

  for (const road of mapState.roads) {
    drawRoad(ctx, road);
  }

  ctx.restore();
}