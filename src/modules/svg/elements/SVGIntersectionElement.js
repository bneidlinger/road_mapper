import { SVGBaseElement } from '../SVGBaseElement.js';
import { BirdsEyeAnimations } from '../../effects/BirdsEyeAnimations.js';
import { TIntersectionSVGRenderer } from '../renderers/TIntersectionSVGRenderer.js';
import { CrossIntersectionRenderer } from '../renderers/CrossIntersectionRenderer.js';
import { SimpleIntersectionRenderer } from '../renderers/SimpleIntersectionRenderer.js';
import { IntersectionDetailsRenderer } from '../renderers/IntersectionDetailsRenderer.js';
import { RealisticIntersectionRenderer } from '../renderers/RealisticIntersectionRenderer.js';
import { RealisticControlsRenderer } from '../renderers/RealisticControlsRenderer.js';

export class SVGIntersectionElement extends SVGBaseElement {
  constructor(intersection, viewport, elementManager) {
    super();
    this.intersection = intersection;
    this.viewport = viewport;
    this.elementManager = elementManager;
    this.isBirdsEye = false;
    
    // Initialize renderers
    this.tRenderer = new TIntersectionSVGRenderer();
    this.crossRenderer = new CrossIntersectionRenderer();
    this.simpleRenderer = new SimpleIntersectionRenderer();
    this.detailsRenderer = new IntersectionDetailsRenderer();
    this.realisticRenderer = new RealisticIntersectionRenderer();
    this.controlsRenderer = new RealisticControlsRenderer();
    
    this.createElement();
  }

  createElement() {
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', 'intersection');
    this.element.setAttribute('data-id', this.intersection.id);
    
    // Add glow filters for traffic lights if not already present
    this.ensureGlowFilters();
    
    // Create a temporary canvas context for the renderer
    // We'll extract the paths and convert to SVG
    this.renderIntersection();
  }

  ensureGlowFilters() {
    // Check if filters already exist in the SVG
    const svg = this.element.ownerDocument?.documentElement || document.querySelector('svg');
    if (!svg) return;
    
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    
    // Check if glow filters already exist
    if (!defs.querySelector('#glow-red')) {
      const filters = this.controlsRenderer.createGlowFilters();
      // Move filter children to main defs
      while (filters.firstChild) {
        defs.appendChild(filters.firstChild);
      }
    }
  }

  renderIntersection() {
    // Clear existing content
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    
    // Bird's eye view - render as glowing LED node
    if (this.isBirdsEye) {
      console.log('Rendering bird\'s eye intersection for', this.intersection.id);
      this.renderBirdsEyeIntersection();
      return;
    }
    
    const connections = this.getConnectionAngles();
    
    console.log('Rendering intersection', this.intersection.id, 'with', connections.length, 'connections');
    
    // Get road width
    const roadWidth = this.getRoadWidth();
    
    // Use realistic renderer for better visual quality
    const elements = this.realisticRenderer.render(this.intersection, connections, roadWidth, this.viewport);
    
    // Add rendered elements
    elements.forEach(el => this.element.appendChild(el));
    
    // Add control elements (stop signs, traffic lights) if zoomed in enough
    if (this.viewport.zoom >= 0.5) {
      this.addControlElements(connections, roadWidth);
    }
    
    if (this.intersection.selected) {
      this.renderSelectionHighlight();
    }
  }

  renderBirdsEyeIntersection() {
    // Use the new animation system for cleaner code
    const zoom = this.viewport?.zoom || 0.1;
    const animatedGroup = BirdsEyeAnimations.createIntersectionAnimation(this.intersection, zoom);
    this.element.appendChild(animatedGroup);
    
    if (this.intersection.selected) {
      this.renderSelectionHighlight();
    }
  }

  getRoadWidth() {
    // Get actual road width from connected roads
    const roads = this.elementManager.getRoads();
    let roadWidth = 20; // Default to street width
    
    // Find the actual width from connected roads
    for (const conn of this.intersection.connectedRoads) {
      const road = roads.find(r => r.id === conn.roadId);
      if (road && road.properties && road.properties.width) {
        roadWidth = road.properties.width;
        break; // Use the first road's width
      }
    }
    
    return roadWidth;
  }

  addControlElements(connections, roadWidth) {
    // Add control elements based on intersection control type
    if (this.intersection.controlType === 'stop_sign') {
      this.addStopSigns(connections, roadWidth);
    } else if (this.intersection.controlType === 'traffic_light') {
      this.addTrafficLights(connections, roadWidth);
    } else if (this.intersection.controlType === 'yield') {
      this.addYieldSigns(connections, roadWidth);
    }
  }

  addStopSigns(connections, roadWidth) {
    // Add stop signs based on configuration
    connections.forEach((conn, index) => {
      if (this.intersection.stopSignConfig.positions.includes(index) || 
          this.intersection.stopSignConfig.count === connections.length) {
        const stopSign = this.controlsRenderer.createStopSign(
          this.intersection, 
          conn.angle, 
          roadWidth
        );
        this.element.appendChild(stopSign);
      }
    });
  }

  addTrafficLights(connections, roadWidth) {
    // Add traffic lights at configured positions
    // For 4-way intersections, add lights on opposite pairs
    if (connections.length >= 4) {
      // Add lights on primary direction (0 and 2)
      const light1 = this.controlsRenderer.createTrafficLight(
        this.intersection,
        connections[0].angle,
        roadWidth,
        'green'
      );
      this.element.appendChild(light1);
      
      const light2 = this.controlsRenderer.createTrafficLight(
        this.intersection,
        connections[2].angle,
        roadWidth,
        'green'
      );
      this.element.appendChild(light2);
      
      // Add lights on secondary direction (1 and 3)
      const light3 = this.controlsRenderer.createTrafficLight(
        this.intersection,
        connections[1].angle,
        roadWidth,
        'red'
      );
      this.element.appendChild(light3);
      
      const light4 = this.controlsRenderer.createTrafficLight(
        this.intersection,
        connections[3].angle,
        roadWidth,
        'red'
      );
      this.element.appendChild(light4);
    } else {
      // For T-intersections, add appropriate lights
      connections.forEach((conn, index) => {
        const state = index === 0 ? 'green' : 'red';
        const light = this.controlsRenderer.createTrafficLight(
          this.intersection,
          conn.angle,
          roadWidth,
          state
        );
        this.element.appendChild(light);
      });
    }
  }

  addYieldSigns(connections, roadWidth) {
    // Add yield signs at minor road approaches
    connections.forEach((conn, index) => {
      // Add yield signs to approaches 1 and 3 for 4-way intersections
      // Or to the minor road for T-intersections
      if ((connections.length === 4 && (index === 1 || index === 3)) ||
          (connections.length === 3 && index === 1)) {
        const yieldSign = this.controlsRenderer.createYieldSign(
          this.intersection,
          conn.angle,
          roadWidth
        );
        this.element.appendChild(yieldSign);
      }
    });
  }









  renderSelectionHighlight() {
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    highlight.setAttribute('cx', this.intersection.x);
    highlight.setAttribute('cy', this.intersection.y);
    highlight.setAttribute('r', '25');
    highlight.setAttribute('fill', 'none');
    highlight.setAttribute('stroke', '#00ff88');
    highlight.setAttribute('stroke-width', '3');
    highlight.setAttribute('opacity', '0.8');
    highlight.setAttribute('class', 'selection-highlight');
    
    this.element.appendChild(highlight);
  }

  getConnectionAngles() {
    // Get actual road angles from connected roads
    const connections = [];
    const roads = this.elementManager.getRoads();
    
    for (const conn of this.intersection.connectedRoads) {
      const road = roads.find(r => r.id === conn.roadId);
      if (road) {
        // Find the angle of the road at this intersection
        // For a road that continues through the intersection, we need both directions
        const angles = this.getRoadAnglesAtIntersection(road, this.intersection);
        for (const angle of angles) {
          connections.push({ angle, roadId: conn.roadId });
        }
      }
    }
    return connections;
  }

  getRoadAnglesAtIntersection(road, intersection) {
    const angles = [];
    const tolerance = 10;
    
    // Check if the intersection is at either end of the road
    const firstPoint = road.points[0];
    const lastPoint = road.points[road.points.length - 1];
    
    const distToFirst = Math.hypot(firstPoint.x - intersection.x, firstPoint.y - intersection.y);
    const distToLast = Math.hypot(lastPoint.x - intersection.x, lastPoint.y - intersection.y);
    
    // Check if intersection is at the start
    if (distToFirst < tolerance) {
      if (road.points.length > 1) {
        const nextPoint = road.points[1];
        angles.push(Math.atan2(nextPoint.y - intersection.y, nextPoint.x - intersection.x));
      }
    }
    
    // Check if intersection is at the end
    if (distToLast < tolerance) {
      if (road.points.length > 1) {
        const prevPoint = road.points[road.points.length - 2];
        angles.push(Math.atan2(prevPoint.y - intersection.y, prevPoint.x - intersection.x));
      }
    }
    
    // Check if the road passes through the intersection (not at endpoints)
    if (distToFirst >= tolerance && distToLast >= tolerance) {
      // Find which segment contains the intersection point
      for (let i = 0; i < road.points.length - 1; i++) {
        const p1 = road.points[i];
        const p2 = road.points[i + 1];
        
        // Check if intersection point is on this segment
        const segmentLength = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const dist1 = Math.hypot(intersection.x - p1.x, intersection.y - p1.y);
        const dist2 = Math.hypot(intersection.x - p2.x, intersection.y - p2.y);
        
        if (Math.abs(dist1 + dist2 - segmentLength) < 1) {
          // Intersection is on this segment - add both directions
          const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          angles.push(angle);
          angles.push(angle + Math.PI); // Opposite direction
          break;
        }
      }
    }
    
    return angles.length > 0 ? angles : [0];
  }

  update() {
    this.renderIntersection();
  }

  updateDetailLevel(zoom) {
    // Check if we're in bird's eye view using centralized constant
    this.isBirdsEye = BirdsEyeAnimations.isBirdsEyeZoom(zoom);
    console.log('SVGIntersectionElement updateDetailLevel - zoom:', zoom, 'isBirdsEye:', this.isBirdsEye);
    // Re-render to adjust detail levels based on zoom
    this.renderIntersection();
  }

  setSelected(selected) {
    this.intersection.selected = selected;
    this.update();
  }
}