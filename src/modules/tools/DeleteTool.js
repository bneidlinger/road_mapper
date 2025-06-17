import { BaseTool } from './BaseTool.js';

export class DeleteTool extends BaseTool {
  activate() {
    super.activate();
    this.toolManager.canvas.style.cursor = 'not-allowed';
  }

  deactivate() {
    super.deactivate();
    this.toolManager.canvas.style.cursor = 'default';
  }

  onMouseDown(event, worldPos) {
    const element = this.elementManager.getElementAt(worldPos.x, worldPos.y);
    
    if (element) {
      this.deleteElement(element);
    }
  }

  onMouseMove(event, worldPos) {
    const element = this.elementManager.getElementAt(worldPos.x, worldPos.y);
    this.toolManager.canvas.style.cursor = element ? 'pointer' : 'not-allowed';
  }

  deleteElement(element) {
    if (element.points) { // Road
      this.elementManager.removeRoad(element.id);
      
      const intersections = this.elementManager.getIntersections();
      for (const intersection of intersections) {
        intersection.removeConnection(element.id);
        if (intersection.connectedRoads.length < 2) {
          this.elementManager.removeIntersection(intersection.id);
        }
      }
    } else if (element.x !== undefined) { // Intersection
      this.elementManager.removeIntersection(element.id);
    }
    
    this.toolManager.emit('elementDeleted', element);
    this.toolManager.emit('redraw');
  }
}