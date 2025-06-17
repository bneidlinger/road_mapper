import { BaseTool } from './BaseTool.js';

export class PanTool extends BaseTool {
  constructor(toolManager) {
    super(toolManager);
    this.isPanning = false;
    this.lastMousePos = null;
    this.isLeftClickPan = false;
  }

  activate() {
    super.activate();
    this.toolManager.canvas.style.cursor = 'grab';
  }

  deactivate() {
    super.deactivate();
    this.toolManager.canvas.style.cursor = 'default';
  }

  onMouseDown(event, worldPos) {
    this.isPanning = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    this.toolManager.canvas.style.cursor = 'grabbing';
  }

  onMouseMove(event, worldPos) {
    if (this.isPanning && this.lastMousePos) {
      const dx = event.clientX - this.lastMousePos.x;
      const dy = event.clientY - this.lastMousePos.y;
      
      this.viewport.pan(dx, dy);
      this.lastMousePos = { x: event.clientX, y: event.clientY };
      this.toolManager.emit('redraw');
    }
  }

  onMouseUp(event, worldPos) {
    const wasLeftClickPan = this.isLeftClickPan;
    this.isPanning = false;
    this.lastMousePos = null;
    this.isLeftClickPan = false;
    
    // Restore the cursor based on the active tool if it was a left-click pan
    if (wasLeftClickPan) {
      const activeTool = this.toolManager.currentTool;
      if (activeTool && activeTool !== this) {
        activeTool.activate(); // This will set the appropriate cursor
      }
    } else {
      this.toolManager.canvas.style.cursor = this.isActive ? 'grab' : 'default';
    }
  }

  startLeftClickPan(event) {
    this.isPanning = true;
    this.isLeftClickPan = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
    this.toolManager.canvas.style.cursor = 'grabbing';
  }
}