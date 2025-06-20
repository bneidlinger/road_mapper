import { SVGBaseElement } from '../SVGBaseElement.js';
import { ROAD_TYPES, ROAD_COLORS } from '../../../core/constants.js';
import { BirdsEyeAnimations } from '../../effects/BirdsEyeAnimations.js';
import { ZOOM_THRESHOLDS } from '../../effects/EffectConstants.js';
import { RoadMarkingsRenderer } from '../renderers/RoadMarkingsRenderer.js';
import { RoadSurfaceRenderer } from '../renderers/RoadSurfaceRenderer.js';

export class SVGRoadElement extends SVGBaseElement {
  constructor(road) {
    super(road.id, 'road');
    this.road = road;
    this.mainPath = null;
    this.sidewalkPaths = null;
    this.laneMarkings = null;
    this.roadGroup = null;
    this.curbsGroup = null;
    this.shouldersGroup = null;
    
    // Initialize renderers
    this.markingsRenderer = new RoadMarkingsRenderer();
    this.surfaceRenderer = new RoadSurfaceRenderer();
  }

  render() {
    if (this.road.points.length < 2) return;

    const pathData = this.createPathData(this.road.points);
    const properties = this.road.properties;

    // Create main road group
    this.roadGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.roadGroup.setAttribute('class', 'road-group');

    // Add sidewalks (bottom layer)
    const sidewalks = this.surfaceRenderer.renderSidewalks(pathData, properties);
    if (sidewalks) {
      this.roadGroup.appendChild(sidewalks);
      this.sidewalkPaths = sidewalks;
    }

    // Add curbs
    const curbs = this.surfaceRenderer.renderCurbs(pathData, properties);
    this.roadGroup.appendChild(curbs);
    this.curbsGroup = curbs;

    // Add main road surface
    const surface = this.surfaceRenderer.renderRoadSurface(pathData, properties, this.road.type);
    this.roadGroup.appendChild(surface);
    this.mainPath = this.surfaceRenderer.getMainPath();

    // Add shoulders
    const shoulders = this.surfaceRenderer.renderShoulders(pathData, properties);
    if (shoulders) {
      this.roadGroup.appendChild(shoulders);
      this.shouldersGroup = shoulders;
    }

    // Add lane markings (top layer)
    const markings = this.markingsRenderer.renderMarkings(this.road, pathData, properties);
    this.roadGroup.appendChild(markings);
    this.laneMarkings = markings;

    // Add selection highlight if selected
    if (this.selected) {
      this.renderSelection(this.roadGroup, pathData, properties);
    }

    this.group.appendChild(this.roadGroup);
    
    // Store references to key elements for later use
    this.storeElementReferences();
  }

  createPathData(points) {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }









  renderSelection(parent, pathData, properties) {
    const selectionPath = this.createPath(pathData, {
      'stroke': '#00ff88',
      'stroke-width': properties.width + 10,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'fill': 'none',
      'opacity': '0.3',
      'class': 'selection-highlight'
    });

    // Add glow effect
    selectionPath.style.filter = 'url(#glow)';
    
    parent.insertBefore(selectionPath, parent.firstChild);
  }

  storeElementReferences() {
    // Store references to key elements after render
    if (this.group) {
      this.mainPath = this.group.querySelector('.road-path');
      this.curbsGroup = this.group.querySelector('.curbs');
      this.shouldersGroup = this.group.querySelector('.shoulders');
      this.laneMarkings = this.group.querySelector('.lane-markings');
      this.sidewalkPaths = this.group.querySelector('.sidewalks');
      
      // Log if mainPath is missing
      if (!this.mainPath) {
        console.warn(`SVGRoadElement: mainPath not found for road ${this.road?.id}`);
        // Try to find it in road-surface group
        const surfaceGroup = this.group.querySelector('.road-surface');
        if (surfaceGroup) {
          this.mainPath = surfaceGroup.querySelector('path');
          if (this.mainPath) {
            console.log(`Found mainPath in road-surface group for road ${this.road?.id}`);
          }
        }
      }
    }
  }

  updateDetailLevel(zoom, forceMode = null) {
    // Bird's eye view mode (circuit board style) when zoomed out far
    // Check if we have a viewport with manual bird's eye mode
    let isBirdsEye = zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
    
    // If forceMode is provided, use it (passed from visibility manager)
    if (forceMode !== null) {
      isBirdsEye = forceMode;
    }
    
    console.log('SVGRoadElement updateDetailLevel - zoom:', zoom, 'isBirdsEye:', isBirdsEye, 'forceMode:', forceMode, 'roadId:', this.road?.id);
    
    // Ensure we have element references
    if (!this.mainPath) {
      console.log('mainPath missing, trying to restore references...');
      this.storeElementReferences();
      
      // If still no mainPath, try to find it directly
      if (!this.mainPath && this.group) {
        this.mainPath = this.group.querySelector('path.road-path');
        if (!this.mainPath) {
          // Try any path in the road-surface group
          const surfaceGroup = this.group.querySelector('.road-surface');
          if (surfaceGroup) {
            this.mainPath = surfaceGroup.querySelector('path');
          }
        }
        console.log('After second attempt, mainPath exists:', !!this.mainPath);
      }
    }
    
    // Debugging logs removed for cleaner console
    
    // Make sure the group itself is visible
    if (this.group) {
      this.group.style.display = '';
      this.group.style.visibility = 'visible';
      this.group.style.opacity = '1';
      // Force visibility at extreme zoom levels
      if (zoom < 0.05) {
        this.group.style.display = 'block !important';
        this.group.style.visibility = 'visible !important';
        this.group.style.opacity = '1 !important';
      }
    }
    if (this.roadGroup) {
      this.roadGroup.style.display = '';
      this.roadGroup.style.visibility = 'visible';
      this.roadGroup.style.opacity = '1';
    }
    
    // Update visibility for renderers
    this.markingsRenderer.updateVisibility(zoom, isBirdsEye);
    this.surfaceRenderer.updateVisibility(zoom, isBirdsEye);
    
    // Update styling based on zoom level
    if (this.mainPath) {
      const baseWidth = this.road.properties.width;
      
      // Ensure the road surface group is visible
      const surfaceGroup = this.mainPath.parentElement;
      if (surfaceGroup && surfaceGroup.classList.contains('road-surface')) {
        surfaceGroup.style.display = '';
        surfaceGroup.style.visibility = 'visible';
        surfaceGroup.style.opacity = '1';
      }
      
      // Also ensure the main path itself is visible
      this.mainPath.style.display = '';
      this.mainPath.style.visibility = 'visible';
      
      // Apply bird's eye style when zoomed out
      if (isBirdsEye) {
        console.log(`Applying bird's eye style to road ${this.road.id}`);
        
        // Force removal of any existing styles first
        this.mainPath.removeAttribute('style');
        
        // Use the new animation system for consistent styling
        BirdsEyeAnimations.applyRoadBirdsEyeStyle(this.mainPath);
        
        // Double-check the styles were applied
        const appliedStroke = this.mainPath.getAttribute('stroke');
        const appliedStyle = this.mainPath.style.cssText;
        console.log(`Road ${this.road.id} after bird's eye:`, {
          stroke: appliedStroke,
          style: appliedStyle
        });
        
        // Hide ALL other road details
        this.surfaceRenderer.updateVisibility(zoom, true);
        this.markingsRenderer.updateVisibility(zoom, true);
      } else {
        // Normal road rendering
        this.mainPath.setAttribute('stroke', ROAD_COLORS.asphalt);
        this.mainPath.setAttribute('stroke-width', baseWidth);
        this.mainPath.setAttribute('opacity', '1');
        this.mainPath.style.filter = '';
        
        // Clear bird's eye styles
        BirdsEyeAnimations.removeRoadBirdsEyeStyle(this.mainPath);
        
        // Show curbs and other details
        this.surfaceRenderer.updateVisibility(zoom, false);
      }
      
      // Extra check: if zoom is extremely low, force bird's eye style
      if (zoom < 0.1 && this.mainPath.getAttribute('stroke') !== '#00ff88') {
        console.warn('Forcing bird\'s eye style at extreme zoom:', zoom);
        this.mainPath.setAttribute('stroke', '#00ff88');
        this.mainPath.style.stroke = '#00ff88';
        const strokeWidth = Math.max(5, Math.min(20, 0.6 / zoom));
        this.mainPath.setAttribute('stroke-width', strokeWidth);
        this.mainPath.style.strokeWidth = strokeWidth + 'px';
      }
    } else {
      console.warn('SVGRoadElement mainPath not found for road', this.road.id);
    }
  }

  hitTest(x, y, tolerance = 5) {
    // Use the main path for hit testing
    if (!this.mainPath) return false;
    
    // Get the point in SVG coordinates
    const point = this.svgManager.svg.createSVGPoint();
    point.x = x;
    point.y = y;
    
    // Check if point is on the path
    const distance = this.getDistanceToPath(point, this.mainPath);
    return distance <= this.road.properties.width / 2 + tolerance;
  }

  getDistanceToPath(point, pathElement) {
    // Simplified distance calculation
    // In a real implementation, you'd use more sophisticated path distance algorithms
    let minDistance = Infinity;
    
    for (let i = 0; i < this.road.points.length - 1; i++) {
      const p1 = this.road.points[i];
      const p2 = this.road.points[i + 1];
      
      const distance = this.pointToLineDistance(
        point.x, point.y,
        p1.x, p1.y,
        p2.x, p2.y
      );
      
      minDistance = Math.min(minDistance, distance);
    }
    
    return minDistance;
  }

  pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}