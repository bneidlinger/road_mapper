import { EventEmitter } from '../../core/EventEmitter.js';

export class Viewport extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.minZoom = 0.1;
    this.maxZoom = 5;
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.panX) / this.zoom,
      y: (screenY - this.panY) / this.zoom
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX * this.zoom + this.panX,
      y: worldY * this.zoom + this.panY
    };
  }

  pan(deltaX, deltaY) {
    this.panX += deltaX;
    this.panY += deltaY;
    this.emit('change', { type: 'pan', panX: this.panX, panY: this.panY });
  }

  zoomAt(x, y, delta) {
    const oldZoom = this.zoom;
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));
    
    const scaleChange = this.zoom / oldZoom;
    this.panX = x - (x - this.panX) * scaleChange;
    this.panY = y - (y - this.panY) * scaleChange;
    
    this.emit('change', { type: 'zoom', zoom: this.zoom, panX: this.panX, panY: this.panY });
  }

  reset() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.emit('change', { type: 'reset' });
  }

  fitToContent(bounds) {
    const padding = 50;
    const canvasWidth = this.canvas.width - padding * 2;
    const canvasHeight = this.canvas.height - padding * 2;
    
    const scaleX = canvasWidth / bounds.width;
    const scaleY = canvasHeight / bounds.height;
    this.zoom = Math.min(scaleX, scaleY);
    
    this.panX = padding + (canvasWidth - bounds.width * this.zoom) / 2 - bounds.x * this.zoom;
    this.panY = padding + (canvasHeight - bounds.height * this.zoom) / 2 - bounds.y * this.zoom;
    
    this.emit('change', { type: 'fit' });
  }
}