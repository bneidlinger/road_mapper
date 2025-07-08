import { BaseTool } from '../modules/tools/BaseTool.js';
import { state } from '../state.js';

export class ZoneTool extends BaseTool {
  constructor(toolManager) {
    super(toolManager);
    this.isDrawing = false;
    this.currentZone = null;
    this.previewPoint = null;
  }

  onMouseDown(event, worldPos) {
    if (event.button !== 0) return;
    const snapped = this.grid.snap(worldPos.x, worldPos.y, this.grid.smallGrid);
    if (!this.isDrawing) {
      this.currentZone = { id: `zone_${Date.now()}`, points: [snapped] };
      this.isDrawing = true;
    } else {
      this.currentZone.points.push(snapped);
    }
  }

  onMouseMove(event, worldPos) {
    if (!this.isDrawing) return;
    this.previewPoint = this.grid.snap(worldPos.x, worldPos.y, this.grid.smallGrid);
    this.toolManager.emit('redraw');
  }

  onMouseUp(event, worldPos) {
    if (event.detail === 2 && this.isDrawing) {
      this.finishZone();
    }
  }

  finishZone() {
    if (this.currentZone && this.currentZone.points.length > 2) {
      state.elements.zones.push(this.currentZone);
    }
    this.currentZone = null;
    this.isDrawing = false;
    this.previewPoint = null;
    this.toolManager.emit('redraw');
  }

  getCursor() {
    return 'crosshair';
  }

  renderSVG(svgManager) {
    if (!this.currentZone) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pts = this.currentZone.points;
    if (pts.length === 0) return;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x} ${pts[i].y}`;
    }
    if (this.previewPoint) {
      d += ` L ${this.previewPoint.x} ${this.previewPoint.y}`;
    }
    path.setAttribute('d', d);
    path.setAttribute('fill', 'rgba(0, 128, 255, 0.3)');
    path.setAttribute('stroke', '#0080ff');
    path.setAttribute('stroke-dasharray', '4 4');
    svgManager.addToLayer('overlay', path);
  }
}
