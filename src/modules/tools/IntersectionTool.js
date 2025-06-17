import { BaseTool } from './BaseTool.js';

export class IntersectionTool extends BaseTool {
  activate() {
    super.activate();
    this.toolManager.canvas.style.cursor = 'crosshair';
  }

  deactivate() {
    super.deactivate();
    this.toolManager.canvas.style.cursor = 'default';
  }

  onMouseDown(event, worldPos) {
    const snappedPos = this.grid.snap(worldPos.x, worldPos.y);
    
    const nearbyRoads = this.findNearbyRoads(snappedPos.x, snappedPos.y, 20);
    
    if (nearbyRoads.length > 0) {
      this.elementManager.createIntersectionAt(
        snappedPos.x, 
        snappedPos.y, 
        nearbyRoads.map(r => r.id)
      );
      this.toolManager.emit('redraw');
    }
  }

  findNearbyRoads(x, y, radius) {
    const roads = this.elementManager.getRoads();
    const nearbyRoads = [];
    
    for (const road of roads) {
      if (road.hitTest(x, y, radius)) {
        nearbyRoads.push(road);
      }
    }
    
    return nearbyRoads;
  }
}