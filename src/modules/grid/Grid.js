import { GRID_SIZES, PIXELS_PER_METER } from '../../core/constants.js';

export class Grid {
  constructor(gridSize = GRID_SIZES.MEDIUM) {
    this.gridSize = gridSize;
    this.snapEnabled = true;
    this.visible = true;
  }

  snap(x, y) {
    if (!this.snapEnabled) {
      return { x, y };
    }
    
    return {
      x: Math.round(x / this.gridSize) * this.gridSize,
      y: Math.round(y / this.gridSize) * this.gridSize
    };
  }

  setGridSize(size) {
    this.gridSize = size;
  }

  toggleSnap() {
    this.snapEnabled = !this.snapEnabled;
    return this.snapEnabled;
  }

  toggleVisibility() {
    this.visible = !this.visible;
    return this.visible;
  }

  draw(ctx, viewport) {
    if (!this.visible) return;

    const { width, height } = ctx.canvas;
    ctx.save();

    // Adjust grid opacity based on zoom level
    let opacity = 0.15;
    if (viewport.zoom < 0.5) opacity = 0.05;
    else if (viewport.zoom > 2) opacity = 0.2;

    const startX = Math.floor(-viewport.panX / viewport.zoom / this.gridSize) * this.gridSize;
    const startY = Math.floor(-viewport.panY / viewport.zoom / this.gridSize) * this.gridSize;
    const endX = startX + width / viewport.zoom + this.gridSize;
    const endY = startY + height / viewport.zoom + this.gridSize;

    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1 / viewport.zoom;

    ctx.beginPath();
    for (let x = startX; x <= endX; x += this.gridSize) {
      const screenX = x * viewport.zoom + viewport.panX;
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
    }
    for (let y = startY; y <= endY; y += this.gridSize) {
      const screenY = y * viewport.zoom + viewport.panY;
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
    }
    ctx.stroke();

    if (this.gridSize === GRID_SIZES.MEDIUM) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 2})`;
      ctx.lineWidth = 2 / viewport.zoom;
      ctx.beginPath();
      
      const majorGrid = GRID_SIZES.COARSE;
      const majorStartX = Math.floor(-viewport.panX / viewport.zoom / majorGrid) * majorGrid;
      const majorStartY = Math.floor(-viewport.panY / viewport.zoom / majorGrid) * majorGrid;
      
      for (let x = majorStartX; x <= endX; x += majorGrid) {
        const screenX = x * viewport.zoom + viewport.panX;
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, height);
      }
      for (let y = majorStartY; y <= endY; y += majorGrid) {
        const screenY = y * viewport.zoom + viewport.panY;
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}