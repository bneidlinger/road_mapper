import './styles/main.css';
import './styles/properties-panel.css';
import { ElementManager } from './modules/ElementManager.js';
import { ToolManager } from './modules/tools/ToolManager.js';
import { SVGRenderer } from './modules/svg/SVGRenderer.js';
import { Toolbar } from './components/Toolbar.js';
import { StatusBar } from './components/StatusBar.js';
import { IntersectionPropertiesPanel } from './components/IntersectionPropertiesPanel.js';
import { BuildingPropertiesPanel } from './components/BuildingPropertiesPanel.js';
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
    this.buildingPropertiesPanel = null;
    this.store = null;
  }

  init() {
    const loadingEl = document.getElementById('canvas-loading');
    
    try {
      // Initializing Road Mapper
      
      // Show loading state
      if (loadingEl) {
        loadingEl.classList.remove('hidden');
      }
      
      // Check DOM elements
      
      // Initialize core modules
      this.grid = new Grid();
      // Grid initialized
      
      this.elementManager = new ElementManager();
      // ElementManager initialized
      
      // Create placeholder canvas for tool manager (we'll update this later)
      const dummyCanvas = document.createElement('canvas');
      this.toolManager = new ToolManager(dummyCanvas, null, this.grid, this.elementManager);
      // ToolManager initialized
      
      // Initialize SVG renderer
      this.svgRenderer = new SVGRenderer('svg-container', this.elementManager, this.toolManager);
      this.viewport = this.svgRenderer.viewport;
      // SVGRenderer initialized
      
      // Update tool manager with proper references
      this.toolManager.updateCanvas(this.svgRenderer.svgManager.svg);
      this.toolManager.viewport = this.viewport;
      // ToolManager references updated

      // Initialize UI components
      this.toolbar = new Toolbar('toolbar-container', this.toolManager);
      // Toolbar mounted

      this.statusBar = new StatusBar(this.viewport, this.toolManager);
      this.statusBar.mount('status-bar-container');
      // StatusBar mounted

      // Create separate containers for each properties panel
      const propertiesContainer = document.getElementById('properties-panel');
      
      // Create intersection panel container
      const intersectionContainer = document.createElement('div');
      intersectionContainer.id = 'intersection-properties-container';
      propertiesContainer.appendChild(intersectionContainer);
      
      this.intersectionPropertiesPanel = new IntersectionPropertiesPanel(this.elementManager);
      this.intersectionPropertiesPanel.mount('intersection-properties-container');
      // IntersectionPropertiesPanel mounted
      
      this.buildingPropertiesPanel = new BuildingPropertiesPanel();
      propertiesContainer.appendChild(this.buildingPropertiesPanel.getElement());
      // BuildingPropertiesPanel mounted

      // Initialize app state
      this.store = new Store({
        projectName: 'Untitled Project',
        units: 'metric',
        autoSave: true
      });
      // Store initialized

      // Set default tool
      this.toolManager.setActiveTool(TOOLS.SELECT);
      // Default tool set

      // Bind events
      this.bindEvents();
      // Events bound

      // Road Mapper initialized successfully with SVG rendering
      
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

    // Handle element selection events
    this.toolManager.on('elementSelected', (element) => {
      console.log('app.js: elementSelected event received:', element);
      if (element.width !== undefined && element.height !== undefined) {
        // It's a building
        console.log('app.js: Detected building selection');
        this.buildingPropertiesPanel.show(element);
        this.intersectionPropertiesPanel.hide();
      } else if (element.connectedRoads !== undefined) {
        // It's an intersection
        console.log('app.js: Detected intersection selection');
        this.intersectionPropertiesPanel.show(element);
        this.buildingPropertiesPanel.hide();
      } else {
        // It's a road or something else
        console.log('app.js: Detected other element selection');
        this.buildingPropertiesPanel.hide();
        this.intersectionPropertiesPanel.hide();
      }
    });
    
    this.toolManager.on('elementDeselected', () => {
      this.buildingPropertiesPanel.hide();
      this.intersectionPropertiesPanel.hide();
    });
    
    // Set up building properties panel events
    this.buildingPropertiesPanel.on('update-building', (data) => {
      const { building, changes } = data;
      building.updateProperties(changes);
      this.svgRenderer.updateBuilding(building);
    });
    
    this.buildingPropertiesPanel.on('delete-building', (building) => {
      this.elementManager.removeBuilding(building.id);
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
          case 'e':
          case 'E':
            // Toggle bird's eye view mode (E for Eye)
            const isNowBirdsEye = this.svgRenderer.viewport.toggleBirdsEyeMode();
            
            // Force update visibility immediately
            this.svgRenderer.updateVisibility();
            
            // Double-check that elements are being updated
            setTimeout(() => {
              this.svgRenderer.updateVisibility();
            }, 50);
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

// Export for testing
export { RoadMapperApp };

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new RoadMapperApp();
  app.init();
  
  // Expose app globally for debugging
  window.app = app;
});