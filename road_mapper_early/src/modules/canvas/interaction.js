import { mapState } from '../settings/state.js';
import { render } from './renderer.js';

export function setupInteraction() {
  const canvas = document.getElementById('road-canvas');
  if (!canvas) return;

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    mapState.zoom = Math.max(0.1, mapState.zoom + delta);
    render();
  });

  let isPanning = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener('pointerdown', (e) => {
    isPanning = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('pointermove', (e) => {
    if (!isPanning) return;
    mapState.panX += e.clientX - startX;
    mapState.panY += e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    render();
  });

  window.addEventListener('pointerup', () => {
    isPanning = false;
  });
}
road-mapper/src/m