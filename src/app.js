import './styles/main.css';
import { ElementManager } from './modules/ElementManager.js';
import { ToolManager } from './modules/tools/ToolManager.js';
import { SVGRenderer } from './modules/svg/SVGRenderer.js';
import { Toolbar } from './components/Toolbar.js';
import { StatusBar } from './components/StatusBar.js';
import { IntersectionPropertiesPanel } from './components/IntersectionPropertiesPanel.js';
import { Store } from './core/Store.js';
import { TOOLS } from './core/constants.js';
import { Grid } from './modules/grid/Grid.js';

class RoadMapperApp {
  constructor() {
    this.svgRenderer = null;
    this.viewport = null;
    this.grid = null;
    this.elementManager = null;
    this.toolManager = null;
    this.toolbar = null;
    this.statusBar = null;
    this.intersectionPropertiesPanel = null;
    this.store = null;
  }

  init() {
    const loadingEl = document.getElementById('canvas-loading');
    
    try {
      console.log('Initializing Road Mapper...');
      
      // Show loading state
      if (loadingEl) {
        loadingEl.classList.remove('hidden');
      }
      
      console.log('DOM elements:', {
        svgContainer: document.getElementById('svg-container'),
        toolbarContainer: document.getElementById('toolbar-container'),
        statusBarContainer: document.getElementById('status-bar-container')
      });
      
      // Initialize core modules
      this.grid = new Grid();
      console.log('Grid initialized');
      
      this.elementManager = new ElementManager();
      console.log('ElementManager initialized');
      
      // Create placeholder canvas for tool manager (we'll update this later)
      const dummyCanvas = document.createElement('canvas');
      this.toolManager = new ToolManager(dummyCanvas, null, this.grid, this.elementManager);
      console.log('ToolManager initialized');
      
      // Initialize SVG renderer
      this.svgRenderer = new SVGRenderer('svg-container', this.elementManager, this.toolManager);
      this.viewport = this.svgRenderer.viewport;
      console.log('SVGRenderer initialized');
      
      // Update tool manager with proper references
      this.toolManager.updateCanvas(this.svgRenderer.svgManager.svg);
      this.toolManager.viewport = this.viewport;
      console.log('ToolManager references updated');

      // Initialize UI components
      this.toolbar = new Toolbar('toolbar-container', this.toolManager);
      console.log('Toolbar mounted');

      this.statusBar = new StatusBar(this.viewport, this.toolManager);
      this.statusBar.mount('status-bar-container');
      console.log('StatusBar mounted');

      this.intersectionPropertiesPanel = new IntersectionPropertiesPanel(this.elementManager);
      this.intersectionPropertiesPanel.mount('properties-panel');
      console.log('IntersectionPropertiesPanel mounted');

      // Initialize app state
      this.store = new Store({
        projectName: 'Untitled Project',
        units: 'metric',
        autoSave: true
      });
      console.log('Store initialized');

      // Set default tool
      this.toolManager.setActiveTool(TOOLS.SELECT);
      console.log('Default tool set');

      // Bind events
      this.bindEvents();
      console.log('Events bound');

      console.log('Road Mapper initialized successfully with SVG rendering');
      
      // Log viewport state for debugging
      console.log('Viewport state:', {
        x: this.viewport.x,
        y: this.viewport.y,
        zoom: this.viewport.zoom,
        panX: this.viewport.panX,
        panY: this.viewport.panY
      });
      
      // Hide loading state with fade out
      setTimeout(() => {
        if (loadingEl) {
          loadingEl.classList.add('hidden');
        }
      }, 500);
      
    } catch (error) {
      console.error('Error initializing Road Mapper:', error);
      console.error('Stack trace:', error.stack);
      
      // Update loading state to show error
      if (loadingEl) {
        const loadingText = loadingEl.querySelector('.loading-text');
        if (loadingText) {
          loadingText.textContent = 'Failed to initialize. Please refresh the page.';
          loadingText.style.color = 'var(--accent-danger)';
        }
      }
    }
  }

  bindEvents() {
    // File operations
    document.getElementById('new-project')?.addEventListener('click', () => this.newProject());
    document.getElementById('save-project')?.addEventListener('click', () => this.saveProject());
    document.getElementById('load-project')?.addEventListener('click', () => this.loadProject());
    document.getElementById('export-svg')?.addEventListener('click', () => this.exportSVG());

    // Grid toggle
    document.getElementById('toggle-grid')?.addEventListener('click', () => {
      const visible = this.grid.toggleVisibility();
      this.statusBar.updateGridStatus(visible);
      this.svgRenderer.render();
    });

    // Snap toggle
    document.getElementById('toggle-snap')?.addEventListener('click', () => {
      this.grid.toggleSnap();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'n':
            e.preventDefault();
            this.newProject();
            break;
          case 's':
            e.preventDefault();
            this.saveProject();
            break;
          case 'o':
            e.preventDefault();
            this.loadProject();
            break;
          case 'z':
            e.preventDefault();
            // TODO: Implement undo
            break;
          case 'y':
            e.preventDefault();
            // TODO: Implement redo
            break;
          case '=':
          case '+':
            e.preventDefault();
            // Zoom in
            const centerIn = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.svgRenderer.viewport.zoomAt(centerIn.x, centerIn.y, 1);
            break;
          case '-':
          case '_':
            e.preventDefault();
            // Zoom out
            const centerOut = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            this.svgRenderer.viewport.zoomAt(centerOut.x, centerOut.y, -1);
            break;
          case '0':
            e.preventDefault();
            // Reset zoom
            this.svgRenderer.viewport.reset();
            break;
        }
      } else {
        // Non-ctrl/cmd shortcuts
        switch(e.key) {
          case 'b':
          case 'B':
            // Jump to bird's eye view
            console.log('Jumping to bird\'s eye view...');
            this.svgRenderer.viewport.setZoom(0.15, window.innerWidth / 2, window.innerHeight / 2);
            // Force update visibility
            setTimeout(() => {
              this.svgRenderer.updateVisibility();
              console.log('Forced visibility update at zoom:', this.svgRenderer.viewport.zoom);
            }, 100);
            break;
        }
      }
    });
  }

  newProject() {
    if (confirm('Create a new project? All unsaved changes will be lost.')) {
      this.elementManager.clear();
      this.viewport.reset();
      this.store.setState({ projectName: 'Untitled Project' });
    }
  }

  saveProject() {
    const projectData = {
      version: '1.0.0',
      name: this.store.getState().projectName,
      viewport: {
        zoom: this.viewport.zoom,
        panX: this.viewport.panX,
        panY: this.viewport.panY
      },
      elements: this.elementManager.toJSON()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.name.replace(/\s+/g, '_')}.roadmap`;
    a.click();
    URL.revokeObjectURL(url);
  }

  loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.roadmap,.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target.result);
          
          // Load elements
          this.elementManager.fromJSON(projectData.elements);
          
          // Restore viewport
          if (projectData.viewport) {
            this.viewport.zoom = projectData.viewport.zoom;
            this.viewport.panX = projectData.viewport.panX;
            this.viewport.panY = projectData.viewport.panY;
          }
          
          // Update project name
          this.store.setState({ projectName: projectData.name || 'Loaded Project' });
          
          this.svgRenderer.render();
        } catch (error) {
          alert('Failed to load project file');
          console.error(error);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }

  exportSVG() {
    // TODO: Implement SVG export
    alert('SVG export coming soon!');
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new RoadMapperApp();
  app.init();
  
  // Expose app globally for debugging
  window.app = app;
});