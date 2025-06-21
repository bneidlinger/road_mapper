import { BaseTool } from './BaseTool.js';

export class SelectTool extends BaseTool {
  constructor(toolManager) {
    super(toolManager);
    this.selectedElement = null;
    this.isDragging = false;
    this.dragStart = null;
  }

  activate() {
    super.activate();
    this.toolManager.canvas.style.cursor = 'default';
  }

  deactivate() {
    super.deactivate();
    this.clearSelection();
  }

  onMouseDown(event, worldPos) {
    const element = this.elementManager.getElementAt(worldPos.x, worldPos.y);
    
    if (element) {
      this.selectElement(element);
      this.isDragging = true;
      this.dragStart = { x: worldPos.x, y: worldPos.y };
    } else {
      this.clearSelection();
    }
  }

  onMouseMove(event, worldPos) {
    if (this.isDragging && this.selectedElement) {
      const dx = worldPos.x - this.dragStart.x;
      const dy = worldPos.y - this.dragStart.y;
      
      // Handle different element types
      if (this.selectedElement.points) { // Road
        for (const point of this.selectedElement.points) {
          point.x += dx;
          point.y += dy;
        }
        this.dragStart = { x: worldPos.x, y: worldPos.y };
        this.toolManager.emit('redraw');
      } else if (this.selectedElement.width !== undefined && this.selectedElement.height !== undefined) {
        // Building - allow moving
        this.selectedElement.x += dx;
        this.selectedElement.y += dy;
        this.dragStart = { x: worldPos.x, y: worldPos.y };
        this.toolManager.emit('redraw');
      }
      // Intersections cannot be moved - they are fixed at road connections
    } else {
      const element = this.elementManager.getElementAt(worldPos.x, worldPos.y);
      this.toolManager.canvas.style.cursor = element ? 'pointer' : 'default';
    }
  }

  onMouseUp(event, worldPos) {
    this.isDragging = false;
    this.dragStart = null;
  }

  selectElement(element) {
    this.clearSelection();
    this.selectedElement = element;
    element.selected = true;
    // Selected element
    // Emit through both toolManager and elementManager for compatibility
    this.toolManager.emit('elementSelected', element);
    this.elementManager.emit('elementSelected', element);
    // Emitted elementSelected event
    this.toolManager.emit('redraw');
  }

  clearSelection() {
    if (this.selectedElement) {
      this.selectedElement.selected = false;
      this.selectedElement = null;
      // Emit through both toolManager and elementManager for compatibility
      this.toolManager.emit('elementDeselected');
      this.elementManager.emit('elementDeselected');
      this.toolManager.emit('redraw');
    }
  }

  isUsingMouse() {
    // Select tool is actively using mouse when dragging
    return this.isDragging;
  }
}