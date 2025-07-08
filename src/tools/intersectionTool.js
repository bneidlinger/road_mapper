import { BaseTool } from '../modules/tools/BaseTool.js';
import { state } from '../state.js';

export class IntersectionTool extends BaseTool {
  onMouseDown(event, worldPos) {
    if (event.button !== 0) return;
    const snapped = this.grid.snap(worldPos.x, worldPos.y, this.grid.smallGrid);
    const intersection = {
      id: `intersection_${Date.now()}`,
      x: snapped.x,
      y: snapped.y
    };
    state.elements.intersections.push(intersection);
    this.toolManager.emit('redraw');
  }

  getCursor() {
    return 'crosshair';
  }
}
