import { SVGManager } from './SVGManager.js';
import { SVGViewport } from './SVGViewport.js';
import { SVGRoadElement } from './elements/SVGRoadElement.js';
import { SVGIntersectionElement } from './elements/SVGIntersectionElement.js';
import { SVGBuildingElement } from './elements/SVGBuildingElement.js';
import { ROAD_COLORS } from '../../core/constants.js';
import { ZOOM_THRESHOLDS } from '../effects/EffectConstants.js';
import { SVGFiltersFactory } from './effects/SVGFiltersFactory.js';
import { SVGPatternsFactory } from './effects/SVGPatternsFactory.js';
import { VisibilityManager } from './rendering/VisibilityManager.js';
import { isometricRenderer } from '../rendering/IsometricRenderer.js';

export class SVGRenderer {
  constructor(containerId, elementManager, toolManager) {
    this.elementManager = elementManager;
    this.toolManager = toolManager;
    
    // Initialize SVG manager and viewport
    this.svgManager = new SVGManager(containerId);
    this.viewport = new SVGViewport(this.svgManager);
    
    // Store SVG element references
    this.svgElements = new Map();
    
    // Initialize visibility manager
    this.visibilityManager = new VisibilityManager(this.svgManager, this.viewport);
    
    // Setup patterns and filters
    this.setupDefsAndPatterns();
    
    // Bind events
    this.bindEvents();
    
    // Initial render
    this.render();
    // Initial visibility update
    this.updateVisibility();
  }

  setupDefsAndPatterns() {
    // Add filters
    this.svgManager.addDef(SVGFiltersFactory.createGlowFilter());
    this.svgManager.addDef(SVGFiltersFactory.createCircuitGlowFilter());
    this.svgManager.addDef(SVGFiltersFactory.createBuildingSelectionGlow());
    this.svgManager.addDef(SVGFiltersFactory.createCityLightBlur());
    
    // Add building shadow filters
    const shadowFilters = SVGFiltersFactory.createBuildingShadowFilters();
    shadowFilters.forEach(filter => this.svgManager.addDef(filter));
    
    // Add 3D effect filter
    this.svgManager.addDef(SVGFiltersFactory.createBuilding3DEffect());
    
    // Add patterns
    SVGPatternsFactory.createAsphaltPattern(this.svgManager);
    SVGPatternsFactory.createFineGridPattern(this.svgManager);
    SVGPatternsFactory.createMediumGridPattern(this.svgManager);
  }



  bindEvents() {
    // Element manager events
    this.elementManager.on('roadAdded', (road) => this.addRoad(road));
    this.elementManager.on('roadRemoved', (road) => this.removeRoad(road));
    this.elementManager.on('roadUpdated', (road) => this.updateRoad(road));
    this.elementManager.on('intersectionAdded', (intersection) => this.addIntersection(intersection));
    this.elementManager.on('intersectionUpdated', (intersection) => this.updateIntersection(intersection));
    this.elementManager.on('intersectionRemoved', (intersection) => this.removeIntersection(intersection));
    this.elementManager.on('buildingAdded', (building) => this.addBuilding(building));
    this.elementManager.on('buildingRemoved', (building) => this.removeBuilding(building));
    this.elementManager.on('cleared', () => this.clear());
    
    // Tool manager events
    this.toolManager.on('redraw', () => this.render());
    
    // Viewport events
    this.viewport.on('change', () => this.updateVisibility());
  }

  render() {
    // Clear and re-render all elements
    this.clear();
    
    // Render grid
    this.renderGrid();
    
    // Render all roads
    const roads = this.elementManager.getRoads();
    roads.forEach(road => this.addRoad(road));
    
    // Render all buildings (before intersections so they appear behind)
    const buildings = this.elementManager.getBuildings();
    buildings.forEach(building => this.addBuilding(building));
    
    // Render all intersections
    const intersections = this.elementManager.getIntersections();
    intersections.forEach(intersection => this.addIntersection(intersection));
    
    // Render active tool overlay
    this.renderToolOverlay();
    
    // Update visibility/detail levels after rendering
    this.updateVisibility();
  }

  renderGrid() {
    // Check if grid is visible (we need to add grid reference to constructor)
    if (!this.toolManager.grid || !this.toolManager.grid.visible) return;
    
    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const bounds = this.viewport.getVisibleBounds();
    
    gridRect.setAttribute('x', bounds.x - 1000);
    gridRect.setAttribute('y', bounds.y - 1000);
    gridRect.setAttribute('width', bounds.width + 2000);
    gridRect.setAttribute('height', bounds.height + 2000);
    gridRect.setAttribute('fill', 'url(#grid-medium)');
    gridRect.setAttribute('class', 'grid-background');
    
    this.svgManager.addToLayer('grid', gridRect);
  }

  addRoad(road) {
    const svgRoad = new SVGRoadElement(road);
    const element = svgRoad.createElement(this.svgManager);
    
    this.svgElements.set(road.id, svgRoad);
    this.svgManager.addToLayer('ground', element);
    
    // Apply initial detail level after a small delay to ensure DOM is ready
    setTimeout(() => {
      const isBirdsEye = this.viewport.isBirdsEyeMode();
      svgRoad.updateDetailLevel(this.viewport.zoom, isBirdsEye);
    }, 0);
  }

  removeRoad(road) {
    const svgRoad = this.svgElements.get(road.id);
    if (svgRoad) {
      svgRoad.remove();
      this.svgElements.delete(road.id);
    }
  }

  updateRoad(road) {
    const svgRoad = this.svgElements.get(road.id);
    if (svgRoad) {
      // Remove the old element
      svgRoad.remove();
      
      // Create and add the updated element
      const element = svgRoad.createElement(this.svgManager);
      this.svgManager.addToLayer('ground', element);
      
      // Update detail level
      const isBirdsEye = this.viewport.isBirdsEyeMode();
      svgRoad.updateDetailLevel(this.viewport.zoom, isBirdsEye);
    }
  }

  addIntersection(intersection) {
    const svgIntersection = new SVGIntersectionElement(intersection, this.viewport, this.elementManager);
    
    this.svgElements.set(intersection.id, svgIntersection);
    this.svgManager.addToLayer('ground', svgIntersection.element);
    
    // Apply initial detail level after a small delay to ensure DOM is ready
    setTimeout(() => {
      const isBirdsEye = this.viewport.isBirdsEyeMode();
      svgIntersection.updateDetailLevel(this.viewport.zoom, isBirdsEye);
      
      // Also update all connected roads to ensure they're visible
      if (intersection.connections) {
        for (const connection of intersection.connections) {
          const svgRoad = this.svgElements.get(connection.roadId);
          if (svgRoad && svgRoad.updateDetailLevel) {
            svgRoad.updateDetailLevel(this.viewport.zoom, isBirdsEye);
          }
        }
      }
    }, 10); // Slightly longer delay to ensure everything is ready
  }
  
  updateIntersection(intersection) {
    const svgIntersection = this.svgElements.get(intersection.id);
    if (svgIntersection) {
      svgIntersection.update();
      // Ensure zoom levels are maintained after intersection update
      svgIntersection.updateDetailLevel(this.viewport.zoom);
    }
    
    // IMPORTANT: Update all connected roads to ensure they maintain visibility
    // This fixes the issue where roads disappear when intersections update
    if (intersection.connections) {
      for (const connection of intersection.connections) {
        const roadId = connection.roadId;
        const svgRoad = this.svgElements.get(roadId);
        if (svgRoad && svgRoad.updateDetailLevel) {
          svgRoad.updateDetailLevel(this.viewport.zoom);
        }
      }
    }
  }

  removeIntersection(intersection) {
    const element = this.svgManager.svg.getElementById(intersection.id);
    if (element) {
      element.remove();
    }
  }

  addBuilding(building) {
    // Create SVG building element using the new wrapper class
    const svgBuilding = new SVGBuildingElement(building, this.svgManager);
    this.svgElements.set(building.id, svgBuilding);
    this.svgManager.addToLayer('ground', svgBuilding.getElement());
    
    // Update detail level based on current zoom
    svgBuilding.updateDetailLevel(this.viewport.zoom, this.viewport.isBirdsEyeMode());
    
    // Force visibility update
    this.updateVisibility();
  }

  removeBuilding(building) {
    const svgBuilding = this.svgElements.get(building.id);
    if (svgBuilding) {
      svgBuilding.destroy();
      this.svgElements.delete(building.id);
    }
  }

  renderToolOverlay() {
    // Clear overlay layer
    this.svgManager.clearLayer('overlay');
    
    // Let the active tool render its overlay
    const activeTool = this.toolManager.tools[this.toolManager.activeTool];
    if (activeTool && activeTool.renderSVG) {
      activeTool.renderSVG(this.svgManager, this.viewport);
    }
  }

  updateVisibility() {
    // Delegate to visibility manager
    this.visibilityManager.updateVisibility(this.viewport.zoom, this.svgElements);
  }

  clear() {
    // Clear all layers except grid
    ['underground', 'ground', 'markings', 'elevated', 'overlay'].forEach(layer => {
      this.svgManager.clearLayer(layer);
    });
    
    this.svgElements.clear();
  }

  getElementAt(x, y) {
    // Convert to world coordinates
    const worldPos = this.viewport.screenToWorld(x, y);
    
    // Check intersections first (higher priority)
    const intersections = this.elementManager.getIntersections();
    for (const intersection of intersections) {
      if (intersection.hitTest && intersection.hitTest(worldPos.x, worldPos.y)) {
        return intersection;
      }
    }
    
    // Then check buildings
    const buildings = this.elementManager.getBuildings();
    for (const building of buildings) {
      if (building.hitTest && building.hitTest(worldPos)) {
        return building;
      }
    }
    
    // Finally check roads
    for (const [id, svgElement] of this.svgElements) {
      if (svgElement.hitTest && svgElement.hitTest(worldPos.x, worldPos.y)) {
        return this.elementManager.getRoad(id);
      }
    }
    
    return null;
  }

  updateElement(element) {
    const svgElement = this.svgElements.get(element.id);
    if (svgElement) {
      svgElement.road = element; // Update reference
      svgElement.update();
    }
  }

  updateBuilding(building) {
    const svgBuilding = this.svgElements.get(building.id);
    if (svgBuilding) {
      // Remove old element
      svgBuilding.destroy();
      this.svgElements.delete(building.id);
      
      // Create new element with updated properties
      const newSvgBuilding = new SVGBuildingElement(building, this.svgManager);
      this.svgElements.set(building.id, newSvgBuilding);
      this.svgManager.addToLayer('ground', newSvgBuilding.getElement());
      
      // Update detail level
      newSvgBuilding.updateDetailLevel(this.viewport.zoom, this.viewport.isBirdsEyeMode());
    }
  }

  /**
   * Toggle isometric view mode
   */
  toggleIsometric() {
    const isEnabled = isometricRenderer.toggle();
    
    // Update all building elements
    this.svgElements.forEach((element, id) => {
      if (element instanceof SVGBuildingElement) {
        element.updateRenderMode();
        element.updateDetailLevel(this.viewport.zoom, this.viewport.isBirdsEyeMode());
      }
    });
    
    // Apply viewport transform if needed
    if (isEnabled) {
      const transform = isometricRenderer.getViewportTransform();
      if (transform) {
        this.svgManager.svg.style.transform = transform;
      }
    } else {
      this.svgManager.svg.style.transform = '';
    }
    
    return isEnabled;
  }
  
  /**
   * Check if isometric mode is enabled
   */
  isIsometricEnabled() {
    return isometricRenderer.isEnabled();
  }
}