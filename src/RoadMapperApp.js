import { ElementManager } from './modules/ElementManager.js';
import { ToolManager } from './modules/tools/ToolManager.js';
import { SVGRenderer } from './modules/svg/SVGRenderer.js';
import { Toolbar } from './components/Toolbar.js';
import { StatusBar } from './components/StatusBar.js';
import { IntersectionPropertiesPanel } from './components/IntersectionPropertiesPanel.js';
import { Store } from './core/Store.js';
import { TOOLS } from './core/constants.js';
import { Grid } from './modules/grid/Grid.js';

export class RoadMapperApp {
  constructor(containerId) {
    this.containerId = containerId;
    this.svgRenderer = null;
    this.viewport = null;
    this.grid = null;
    this.elementManager = null;
    this.toolManager = null;
    this.toolbar = null;
    this.statusBar = null;
    this.intersectionPropertiesPanel = null;
    this.store = null;
    
    this.init();
  }

  init() {
    try {
      console.log('Initializing Road Mapper...');
      
      // Create container structure
      const container = document.getElementById(this.containerId);
      container.innerHTML = `
        <div id="svg-container" style="width: 100%; height: 100%;"></div>
        <div id="toolbar-container"></div>
        <div id="status-bar-container"></div>
      `;
      
      // Initialize core modules
      this.grid = new Grid();
      this.elementManager = new ElementManager();
      
      // Create placeholder canvas for tool manager
      const dummyCanvas = document.createElement('canvas');
      this.toolManager = new ToolManager(dummyCanvas, null, this.grid, this.elementManager);
      
      // Initialize SVG renderer
      this.svgRenderer = new SVGRenderer('svg-container', this.elementManager, this.toolManager);
      this.viewport = this.svgRenderer.viewport;
      
      // Update tool manager with actual viewport
      this.toolManager.viewport = this.viewport;
      this.toolManager.svgManager = this.svgRenderer.svgManager;
      
      // Setup grid SVG reference
      this.grid.setSVGManager(this.svgRenderer.svgManager);
      
      // Initialize UI components
      this.toolbar = new Toolbar('toolbar-container', this.toolManager);
      this.statusBar = new StatusBar('status-bar-container', this.viewport, this.grid);
      
      // Initialize properties panel
      this.intersectionPropertiesPanel = new IntersectionPropertiesPanel(this.elementManager);
      
      // Initialize store
      this.store = Store.getInstance();
      
      // Bind keyboard shortcuts
      this.bindKeyboardShortcuts();
      
      // Set default tool
      this.toolManager.setActiveTool(TOOLS.SELECT);
      
      console.log('Road Mapper initialized successfully');
      
      // Also expose the renderer for easier access
      this.renderer = this.svgRenderer;
      
    } catch (error) {
      console.error('Failed to initialize Road Mapper:', error);
    }
  }

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Prevent shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            this.toolManager.setActiveTool(TOOLS.SELECT);
          }
          break;
        case 'r':
          this.toolManager.setActiveTool(TOOLS.ROAD);
          break;
        case 'i':
          this.toolManager.setActiveTool(TOOLS.INTERSECTION);
          break;
        case 'd':
          this.toolManager.setActiveTool(TOOLS.DELETE);
          break;
        case 'b':
          this.toolManager.setActiveTool(TOOLS.BUILDING);
          break;
        case ' ':
          e.preventDefault();
          this.toolManager.setActiveTool(TOOLS.PAN);
          break;
        case 'g':
          this.grid.toggleVisibility();
          break;
        case 'escape':
          this.toolManager.setActiveTool(TOOLS.SELECT);
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === ' ') {
        this.toolManager.setActiveTool(TOOLS.SELECT);
      }
    });
  }
}