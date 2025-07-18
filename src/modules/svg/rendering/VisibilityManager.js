import { ZOOM_THRESHOLDS } from '../../effects/EffectConstants.js';

/**
 * Manages visibility and detail levels for SVG elements based on zoom
 */
export class VisibilityManager {
  constructor(svgManager, viewport) {
    this.svgManager = svgManager;
    this.viewport = viewport;
  }

  /**
   * Update visibility based on zoom level
   * @param {number} zoom - Current zoom level
   * @param {Map} svgElements - Map of SVG elements
   */
  updateVisibility(zoom, svgElements) {
    const isBirdsEye = this.viewport ? this.viewport.isBirdsEyeMode() : zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
    // console.log('VisibilityManager updateVisibility - zoom:', zoom, 'isBirdsEye:', isBirdsEye, 'manual:', this.viewport?.manualBirdsEyeMode);
    
    // Update grid visibility
    this.updateGridVisibility(zoom);
    
    // Update background color for bird's eye view
    this.updateBackgroundColor(zoom);
    
    // Update element detail levels
    this.updateElementDetails(zoom, svgElements);
  }

  /**
   * Update grid visibility based on zoom
   */
  updateGridVisibility(zoom) {
    const gridLayer = this.svgManager.layers.grid;
    const isBirdsEye = this.viewport ? this.viewport.isBirdsEyeMode() : zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
    
    if (gridLayer) {
      if (isBirdsEye) {
        // Bird's eye view - very subtle circuit board grid
        gridLayer.style.opacity = '0.03';
        gridLayer.style.mixBlendMode = 'screen';
      } else {
        gridLayer.style.mixBlendMode = 'normal';
        if (zoom < 0.3) {
          gridLayer.style.opacity = '0.02';
        } else if (zoom < 0.5) {
          gridLayer.style.opacity = '0.05';
        } else if (zoom < 1) {
          gridLayer.style.opacity = '0.1';
        } else if (zoom < 2) {
          gridLayer.style.opacity = '0.15';
        } else if (zoom < 4) {
          gridLayer.style.opacity = '0.2';
        } else {
          gridLayer.style.opacity = '0.25';
        }
      }
    }
  }

  /**
   * Update background color for bird's eye view
   */
  updateBackgroundColor(zoom) {
    const isBirdsEye = this.viewport ? this.viewport.isBirdsEyeMode() : zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
    const container = document.getElementById('svg-container');
    
    if (container) {
      if (isBirdsEye) {
        container.style.backgroundColor = '#0a0a0a'; // Dark circuit board background
        this.svgManager.svg.style.background = '#0a0a0a';
      } else {
        container.style.backgroundColor = '#1a1a1a'; // Normal background
        this.svgManager.svg.style.background = '#1a1a1a';
      }
    }
  }

  /**
   * Update element detail levels
   */
  updateElementDetails(zoom, svgElements) {
    const isBirdsEye = this.viewport ? this.viewport.isBirdsEyeMode() : zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
    const visibleBounds = this.getExpandedViewportBounds();
    
    svgElements.forEach((item, id) => {
      // Handle both direct elements and wrapped elements (like buildings)
      const element = item.element || item;
      const dataObject = item.building || item.road || item.intersection || element;
      
      // Check if element is in viewport for buildings
      if (item.building) {
        const building = item.building;
        const inViewport = this.isInViewport(building, visibleBounds);
        
        if (!inViewport) {
          // Hide off-screen buildings
          if (item.getElement) {
            const el = item.getElement();
            if (el) el.style.display = 'none';
          }
          return; // Skip further processing
        } else {
          // Show visible buildings
          if (item.getElement) {
            const el = item.getElement();
            if (el) el.style.display = '';
          }
        }
      }
      
      // Special handling for SVGRoadElement and SVGIntersectionElement which are stored directly
      if (item && item.updateDetailLevel) {
        // It's a direct element (road or intersection)
        // Update element directly
        item.updateDetailLevel(zoom, isBirdsEye);
      } else if (dataObject && dataObject.updateDetailLevel) {
        // It's a wrapped element
        if (dataObject.updateDetailLevel.length >= 2) {
          dataObject.updateDetailLevel(zoom, isBirdsEye);
        } else {
          dataObject.updateDetailLevel(zoom);
        }
      }
    });
    
    // Log a sample element to check if bird's eye styles are applied
    const firstRoad = Array.from(svgElements.values()).find(item => {
      const obj = item.road || item;
      return obj && obj.constructor && obj.constructor.name === 'SVGRoadElement';
    });
    
    if (firstRoad) {
      const roadEl = firstRoad.road || firstRoad;
      // Sample road element state: {
      //   id: roadEl.road?.id,
      //   mainPathColor: roadEl.mainPath?.getAttribute('stroke'),
      //   mainPathOpacity: roadEl.mainPath?.getAttribute('opacity')
      // };
    }
  }

  /**
   * Get opacity for zoom level
   */
  static getOpacityForZoom(zoom, minZoom = 0.5, maxZoom = 2) {
    if (zoom < minZoom) return 0;
    if (zoom > maxZoom) return 1;
    
    // Linear interpolation
    return (zoom - minZoom) / (maxZoom - minZoom);
  }

  /**
   * Check if in bird's eye view
   */
  isBirdsEyeView(zoom) {
    return this.viewport ? this.viewport.isBirdsEyeMode() : zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
  }

  /**
   * Get expanded viewport bounds for culling
   */
  getExpandedViewportBounds() {
    if (!this.viewport) return null;
    
    const bounds = this.viewport.getVisibleBounds();
    const expansion = 200; // Expand bounds by 200 units in each direction
    
    return {
      left: bounds.x - expansion,
      right: bounds.x + bounds.width + expansion,
      top: bounds.y - expansion,
      bottom: bounds.y + bounds.height + expansion
    };
  }
  
  /**
   * Check if building is in viewport
   */
  isInViewport(building, bounds) {
    if (!bounds) return true; // Show all if no bounds
    
    // Check if building rectangle overlaps with viewport
    const buildingRight = building.x + building.width;
    const buildingBottom = building.y + building.height;
    
    return !(
      building.x > bounds.right ||
      buildingRight < bounds.left ||
      building.y > bounds.bottom ||
      buildingBottom < bounds.top
    );
  }
  
  /**
   * Get detail level for zoom
   */
  static getDetailLevel(zoom) {
    if (zoom < ZOOM_THRESHOLDS.BIRDS_EYE) return 'BIRDS_EYE';
    if (zoom < ZOOM_THRESHOLDS.NETWORK) return 'NETWORK';
    if (zoom < ZOOM_THRESHOLDS.SIMPLIFIED) return 'SIMPLIFIED';
    if (zoom < ZOOM_THRESHOLDS.STANDARD) return 'STANDARD';
    if (zoom < ZOOM_THRESHOLDS.DETAILED) return 'DETAILED';
    return 'CLOSEUP';
  }
}