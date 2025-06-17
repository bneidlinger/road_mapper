import { EventEmitter } from '../../core/EventEmitter.js';
import { TOOLS } from '../../core/constants.js';
import { SelectTool } from './SelectTool.js';
import { RoadTool } from './RoadTool.js';
import { IntersectionTool } from './IntersectionTool.js';
import { DeleteTool } from './DeleteTool.js';
import { PanTool } from './PanTool.js';
import { BuildingTool } from './BuildingTool.js';

export class ToolManager extends EventEmitter {
  constructor(canvas, viewport, grid, elementManager) {
    super();
    this.canvas = canvas;
    this.viewport = viewport;
    this.grid = grid;
    this.elementManager = elementManager;
    
    this.tools = {
      [TOOLS.SELECT]: new SelectTool(this),
      [TOOLS.ROAD]: new RoadTool(this),
      [TOOLS.INTERSECTION]: new IntersectionTool(this),
      [TOOLS.DELETE]: new DeleteTool(this),
      [TOOLS.PAN]: new PanTool(this),
      [TOOLS.BUILDING]: new BuildingTool(this)
    };
    
    this.currentTool = null;
    this.activeTool = TOOLS.SELECT;
    
    // Don't setup listeners in constructor - wait for proper canvas
    if (canvas && canvas.parentNode) {
      this.setupEventListeners();
    }
  }

  updateCanvas(newCanvas) {
    // Remove old listeners if they exist
    if (this.canvas && this.boundHandlers) {
      const element = this.canvas;
      element.removeEventListener('mousedown', this.boundHandlers.mousedown);
      element.removeEventListener('mousemove', this.boundHandlers.mousemove);
      element.removeEventListener('mouseup', this.boundHandlers.mouseup);
      element.removeEventListener('wheel', this.boundHandlers.wheel);
      element.removeEventListener('contextmenu', this.boundHandlers.contextmenu);
    }
    
    this.canvas = newCanvas;
    this.setupEventListeners();
  }

  setupEventListeners() {
    // For SVG, we need to handle events differently
    const element = this.canvas.tagName === 'svg' ? this.canvas : this.canvas;
    
    console.log('Setting up event listeners on:', element);
    
    // Store bound handlers so we can remove them later
    this.boundHandlers = {
      mousedown: this.handleMouseDown.bind(this),
      mousemove: this.handleMouseMove.bind(this),
      mouseup: this.handleMouseUp.bind(this),
      wheel: this.handleWheel.bind(this),
      contextmenu: e => e.preventDefault()
    };
    
    element.addEventListener('mousedown', this.boundHandlers.mousedown);
    element.addEventListener('mousemove', this.boundHandlers.mousemove);
    element.addEventListener('mouseup', this.boundHandlers.mouseup);
    element.addEventListener('wheel', this.boundHandlers.wheel);
    element.addEventListener('contextmenu', this.boundHandlers.contextmenu);
    
    console.log('Event listeners attached');
  }

  setActiveTool(toolName) {
    console.log('ToolManager.setActiveTool:', toolName);
    if (this.currentTool) {
      this.currentTool.deactivate();
    }
    
    this.activeTool = toolName;
    this.currentTool = this.tools[toolName];
    
    if (this.currentTool) {
      console.log('Activating tool:', toolName, this.currentTool);
      this.currentTool.activate();
      this.emit('toolChange', toolName);
    }
  }

  handleMouseDown(event) {
    try {
      const worldPos = this.getWorldPosition(event);
      
      if (event.button === 2) { // Right click for pan
        this.tools[TOOLS.PAN].onMouseDown(event, worldPos);
      } else if (event.button === 0) { // Left click
        // Track mouse for potential panning
        this.mouseDownTime = Date.now();
        this.mouseDownPos = { x: event.clientX, y: event.clientY };
        this.hasMoved = false;
        this.toolIsActive = false;
        
        if (this.currentTool) {
          this.currentTool.onMouseDown(event, worldPos);
          // Check if the tool is actively using the mouse (e.g., started drawing)
          this.toolIsActive = this.currentTool.isUsingMouse && this.currentTool.isUsingMouse();
        }
      }
    } catch (error) {
      console.error('Error in handleMouseDown:', error);
      console.error('Event:', event);
      console.error('Stack:', error.stack);
    }
  }

  handleMouseMove(event) {
    const worldPos = this.getWorldPosition(event);
    
    // Check if we should start left-click panning
    if (this.mouseDownPos && !this.tools[TOOLS.PAN].isPanning && event.buttons === 1 && !this.toolIsActive) {
      const dx = event.clientX - this.mouseDownPos.x;
      const dy = event.clientY - this.mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Start panning if mouse moved while holding left button and tool isn't active
      if (distance > 5 && !this.hasMoved) {
        this.hasMoved = true;
        // Only start panning if the current tool isn't actively using the mouse
        if (!this.currentTool || !this.currentTool.isUsingMouse || !this.currentTool.isUsingMouse()) {
          if (this.currentTool && this.currentTool.cancelAction) {
            this.currentTool.cancelAction();
          }
          this.tools[TOOLS.PAN].startLeftClickPan(event);
        }
      }
    }
    
    if (this.tools[TOOLS.PAN].isPanning) {
      this.tools[TOOLS.PAN].onMouseMove(event, worldPos);
    } else if (this.currentTool) {
      this.currentTool.onMouseMove(event, worldPos);
    }
    
    this.emit('cursorMove', worldPos);
  }

  handleMouseUp(event) {
    const worldPos = this.getWorldPosition(event);
    
    // Reset mouse tracking
    this.mouseDownPos = null;
    this.mouseDownTime = null;
    this.hasMoved = false;
    this.toolIsActive = false;
    
    if (this.tools[TOOLS.PAN].isPanning) {
      this.tools[TOOLS.PAN].onMouseUp(event, worldPos);
    } else if (this.currentTool) {
      // Only pass mouse up to tool if we didn't pan
      if (!this.tools[TOOLS.PAN].isLeftClickPan) {
        this.currentTool.onMouseUp(event, worldPos);
      }
    }
  }

  handleWheel(event) {
    try {
      event.preventDefault();
      if (this.viewport && this.viewport.zoomAt) {
        this.viewport.zoomAt(event.clientX, event.clientY, -event.deltaY);
      } else {
        console.error('Viewport or zoomAt method not available');
      }
    } catch (error) {
      console.error('Error in handleWheel:', error);
      console.error('Viewport:', this.viewport);
      console.error('Stack:', error.stack);
    }
  }

  getWorldPosition(event) {
    if (this.viewport.screenToWorld) {
      return this.viewport.screenToWorld(event.clientX, event.clientY);
    }
    // Fallback for canvas
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }
}