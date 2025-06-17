export class BaseTool {
  constructor(toolManager) {
    this.toolManager = toolManager;
    this.isActive = false;
  }
  
  // Getters to dynamically access properties from toolManager
  get viewport() {
    return this.toolManager.viewport;
  }
  
  get grid() {
    return this.toolManager.grid;
  }
  
  get elementManager() {
    return this.toolManager.elementManager;
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  onMouseDown(event, worldPos) {}
  onMouseMove(event, worldPos) {}
  onMouseUp(event, worldPos) {}
  onKeyDown(event) {}
  onKeyUp(event) {}
  
  cancelAction() {
    // Override in subclasses to cancel current action
  }
  
  isUsingMouse() {
    // Override in subclasses to indicate if tool is actively using mouse
    return false;
  }
}