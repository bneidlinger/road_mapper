import { EventEmitter } from '../../core/EventEmitter.js';

export class SVGViewport extends EventEmitter {
  constructor(svgManager) {
    super();
    this.svgManager = svgManager;
    this.svg = svgManager.svg;
    
    // Viewport state
    this.x = 0;
    this.y = 0;
    this.width = this.svg.clientWidth;
    this.height = this.svg.clientHeight;
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 6; // Cap at 600% for performance
    
    // Add compatibility properties for existing code
    Object.defineProperty(this, 'panX', {
      get() { return -this.x * this.zoom + this.width / 2; },
      set(value) { this.x = -(value - this.width / 2) / this.zoom; }
    });
    Object.defineProperty(this, 'panY', {
      get() { return -this.y * this.zoom + this.height / 2; },
      set(value) { this.y = -(value - this.height / 2) / this.zoom; }
    });
    
    this.setupEventListeners();
    this.updateViewBox();
  }

  setupEventListeners() {
    // Listen for container resize
    this.svgManager.on('resize', ({ width, height }) => {
      this.width = width;
      this.height = height;
      this.updateViewBox();
    });
  }

  updateViewBox() {
    // Calculate viewBox based on zoom and pan
    const viewWidth = this.width / this.zoom;
    const viewHeight = this.height / this.zoom;
    
    this.svgManager.setViewBox(
      this.x - viewWidth / 2,
      this.y - viewHeight / 2,
      viewWidth,
      viewHeight
    );
    
    this.emit('change', {
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      width: viewWidth,
      height: viewHeight
    });
  }

  pan(deltaX, deltaY) {
    // Pan in world coordinates (accounting for zoom)
    this.x -= deltaX / this.zoom;
    this.y -= deltaY / this.zoom;
    this.updateViewBox();
  }

  panTo(x, y) {
    this.x = x;
    this.y = y;
    this.updateViewBox();
  }

  zoomAt(screenX, screenY, delta) {
    // Convert screen coordinates to world coordinates
    const worldPos = this.screenToWorld(screenX, screenY);
    
    // Calculate new zoom - smoother zooming for better control
    const zoomFactor = delta > 0 ? 1.15 : 0.87;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));
    
    if (newZoom !== this.zoom) {
      // Calculate the difference in world position after zoom
      const scale = newZoom / this.zoom;
      
      // Adjust pan to keep the mouse position fixed
      this.x = worldPos.x - (worldPos.x - this.x) / scale;
      this.y = worldPos.y - (worldPos.y - this.y) / scale;
      
      this.zoom = newZoom;
      this.updateViewBox();
    }
  }

  setZoom(zoom, centerX = null, centerY = null) {
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    
    if (centerX !== null && centerY !== null) {
      const worldPos = this.screenToWorld(centerX, centerY);
      const scale = newZoom / this.zoom;
      
      this.x = worldPos.x - (worldPos.x - this.x) / scale;
      this.y = worldPos.y - (worldPos.y - this.y) / scale;
    }
    
    this.zoom = newZoom;
    this.updateViewBox();
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.updateViewBox();
  }

  fitToContent(bounds, padding = 50) {
    if (!bounds || bounds.width === 0 || bounds.height === 0) return;
    
    // Calculate zoom to fit content
    const scaleX = (this.width - padding * 2) / bounds.width;
    const scaleY = (this.height - padding * 2) / bounds.height;
    const newZoom = Math.min(scaleX, scaleY, this.maxZoom);
    
    // Center on content
    this.x = bounds.x + bounds.width / 2;
    this.y = bounds.y + bounds.height / 2;
    this.zoom = newZoom;
    
    this.updateViewBox();
  }

  screenToWorld(screenX, screenY) {
    // Get the SVG element's bounding rect
    const rect = this.svg.getBoundingClientRect();
    
    // Convert to SVG coordinates
    const svgX = screenX - rect.left;
    const svgY = screenY - rect.top;
    
    // Get current viewBox
    const viewBox = this.svgManager.getViewBox();
    
    // Convert to world coordinates
    const worldX = viewBox.x + (svgX / this.width) * viewBox.width;
    const worldY = viewBox.y + (svgY / this.height) * viewBox.height;
    
    return { x: worldX, y: worldY };
  }

  worldToScreen(worldX, worldY) {
    // Get current viewBox
    const viewBox = this.svgManager.getViewBox();
    
    // Convert to SVG coordinates
    const svgX = ((worldX - viewBox.x) / viewBox.width) * this.width;
    const svgY = ((worldY - viewBox.y) / viewBox.height) * this.height;
    
    // Get the SVG element's bounding rect
    const rect = this.svg.getBoundingClientRect();
    
    // Convert to screen coordinates
    const screenX = svgX + rect.left;
    const screenY = svgY + rect.top;
    
    return { x: screenX, y: screenY };
  }

  getVisibleBounds() {
    const viewBox = this.svgManager.getViewBox();
    return {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height
    };
  }
}