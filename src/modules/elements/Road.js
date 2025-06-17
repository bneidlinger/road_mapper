import { ROAD_TYPES, ZOOM_LEVELS } from '../../core/constants.js';
import { RoadRenderer } from '../rendering/RoadRenderer.js';

export class Road {
  constructor(id, points = [], type = 'STREET') {
    this.id = id;
    this.points = points;
    this.type = type;
    this.properties = { ...ROAD_TYPES[type] };
    this.selected = false;
  }

  addPoint(x, y) {
    this.points.push({ x, y });
  }

  getLastPoint() {
    return this.points[this.points.length - 1];
  }

  getBounds() {
    if (this.points.length === 0) return null;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const point of this.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  draw(ctx, viewport) {
    if (this.points.length < 2) return;
    
    // Use the new road renderer
    RoadRenderer.drawRoad(ctx, this, viewport);
    
    // Draw control points when selected and zoomed in
    if (this.selected && viewport.zoom > ZOOM_LEVELS.STANDARD) {
      ctx.save();
      ctx.fillStyle = '#00ff88';
      
      for (const point of this.points) {
        const screenPoint = viewport.worldToScreen(point.x, point.y);
        ctx.beginPath();
        ctx.arc(screenPoint.x, screenPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  hitTest(x, y, tolerance = 5) {
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      
      const dist = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
      if (dist <= this.properties.width / 2 + tolerance) {
        return true;
      }
    }
    return false;
  }

  pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      points: this.points
    };
  }

  static fromJSON(data) {
    const road = new Road(data.id, data.points, data.type);
    return road;
  }
}