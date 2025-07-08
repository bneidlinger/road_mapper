import { EventEmitter } from '../../core/EventEmitter.js';
import { TOOLS } from '../../core/constants.js';
import { SelectTool } from './SelectTool.js';
import { RoadTool } from './RoadTool.js';
import { IntersectionTool } from '../../tools/intersectionTool.js';
import { ZoneTool } from '../../tools/zoneTool.js';
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
      [TOOLS.ZONE]: new ZoneTool(this),
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
    
    // Setting up event listeners
    
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
    
    // Event listeners attached
  }

  setActiveTool(toolName) {
    if (this.currentTool) {
      this.currentTool.deactivate();
    }
    
    this.activeTool = toolName;
    this.currentTool = this.tools[toolName];
    
    // Update class on SVG container for tool-specific styling
    if (this.canvas && this.canvas.tagName === 'svg') {
      // Remove all tool classes
      this.canvas.classList.remove('select-tool-active', 'road-tool-active',
        'building-tool-active', 'intersection-tool-active', 'zone-tool-active',
        'delete-tool-active', 'pan-tool-active');
      
      // Add current tool class
      const toolClass = toolName.toLowerCase() + '-tool-active';
      this.canvas.classList.add(toolClass);
    }
    
    if (this.currentTool) {
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
    
    // Mouse move handling
    
    // Check if we should start left-click panning
    // Only check once if the tool is active - don't double-check
    if (this.mouseDownPos && !this.tools[TOOLS.PAN].isPanning && event.buttons === 1) {
      const dx = event.clientX - this.mouseDownPos.x;
      const dy = event.clientY - this.mouseDownPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Start panning if mouse moved while holding left button and tool isn't active
      if (distance > 5 && !this.hasMoved) {
        this.hasMoved = true;
        
        // Use the toolIsActive flag that was set during mouseDown
        if (!this.toolIsActive) {
          // Starting left-click pan - tool not active
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
    // Handle mouse up
    const worldPos = this.getWorldPosition(event);
    
    // Reset mouse tracking
    this.mouseDownPos = null;
    this.mouseDownTime = null;
    this.hasMoved = false;
    this.toolIsActive = false;
    
    // Check if pan tool was active before processing
    const wasLeftClickPan = this.tools[TOOLS.PAN].isLeftClickPan;
    
    if (this.tools[TOOLS.PAN].isPanning) {
      this.tools[TOOLS.PAN].onMouseUp(event, worldPos);
    }
    
    // Always pass mouseUp to current tool if it was a left click, even if panning occurred
    // This ensures tools can clean up their state properly
    if (this.currentTool && event.button === 0) {
      // If we were left-click panning, the tool might want to cancel its action
      if (wasLeftClickPan && this.currentTool.cancelAction) {
        this.currentTool.cancelAction();
      } else {
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
    if (this.viewport && this.viewport.screenToWorld) {
      return this.viewport.screenToWorld(event.clientX, event.clientY);
    }
    // Fallback for canvas
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }
}