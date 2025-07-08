import { BaseTool } from './BaseTool.js';
import { Road } from '../elements/Road.js';
import { IntersectionDetector } from '../intersection/IntersectionDetector.js';
import { TIntersectionRenderer } from '../intersection/TIntersectionRenderer.js';

export class RoadTool extends BaseTool {
  constructor(toolManager) {
    super(toolManager);
    this.isDrawing = false;
    this.currentRoad = null;
    this.previewPoint = null;
    this.roadType = 'STREET'; // Default road type
    this.intersectionDetector = new IntersectionDetector(this.elementManager);
    this.tIntersectionRenderer = new TIntersectionRenderer();
    this.potentialIntersection = null; // Store detected intersection for preview
    this.isExtending = false; // Track if we're extending an existing road
    this.extendingFromStart = false; // Track which end we're extending from
    
    // Debug logging removed
  }

  activate() {
    super.activate();
    this.toolManager.canvas.style.cursor = 'crosshair';
  }

  deactivate() {
    super.deactivate();
    this.finishRoad();
    this.toolManager.canvas.style.cursor = 'default';
  }

  cancelAction() {
    // Cancel current road drawing
    if (this.isDrawing) {
      this.currentRoad = null;
      this.isDrawing = false;
      this.previewPoint = null;
      this.potentialIntersection = null;
      this.toolManager.emit('redraw');
    }
  }

  isUsingMouse() {
    // Road tool is actively using mouse when drawing
    return this.isDrawing;
  }

  onMouseDown(event, worldPos) {
    const snappedPos = this.grid.snap(worldPos.x, worldPos.y, this.grid.smallGrid);
    
    if (!this.isDrawing) {
      this.startRoad(snappedPos.x, snappedPos.y);
    } else {
      this.addPoint(snappedPos.x, snappedPos.y);
    }
  }

  onMouseMove(event, worldPos) {
    if (this.isDrawing) {
      this.previewPoint = this.grid.snap(worldPos.x, worldPos.y, this.grid.smallGrid);
      
      // Check for potential T-intersection
      // For segment drawing, we need to pass the start point of the current segment
      const approachFrom = this.currentRoad && this.currentRoad.points.length > 0 
        ? this.currentRoad.points[this.currentRoad.points.length - 1]
        : null;
        
      this.potentialIntersection = this.intersectionDetector.detectTIntersection(
        this.previewPoint.x,
        this.previewPoint.y,
        this.currentRoad ? this.currentRoad.id : null,
        approachFrom
      );
      
      // Potential T-intersection detected
      
      this.toolManager.emit('redraw');
    }
  }

  onMouseUp(event, worldPos) {
    if (event.detail === 2) { // Double click to finish
      this.finishRoad();
    }
  }

  startRoad(x, y) {
    // Check if we're near an existing road's endpoint
    const roadEndpoint = this.elementManager.findRoadByEndpoint(x, y, 15);
    
    if (roadEndpoint) {
      // Extend the existing road
      this.currentRoad = roadEndpoint.road;
      this.isExtending = true;
      
      // Determine which end we're extending from
      const firstPoint = this.currentRoad.getFirstPoint();
      this.extendingFromStart = (roadEndpoint.endpoint === firstPoint);
      
      // Extending existing road
    } else {
      // Create a new road
      const roadId = `road_${Date.now()}`;
      this.currentRoad = new Road(roadId, [], this.roadType);
      this.currentRoad.addPoint(x, y);
      this.isExtending = false;
    }
    
    this.isDrawing = true;
  }
  
  setRoadType(type) {
    this.roadType = type;
  }

  addPoint(x, y) {
    if (this.currentRoad) {
      // Get the appropriate reference point based on whether we're extending
      let referencePoint;
      if (this.isExtending) {
        referencePoint = this.extendingFromStart ? 
          this.currentRoad.getFirstPoint() : 
          this.currentRoad.getLastPoint();
      } else {
        referencePoint = this.currentRoad.getLastPoint();
      }
      
      if (referencePoint.x !== x || referencePoint.y !== y) {
        // Check if we're creating a T-intersection
        const intersection = this.intersectionDetector.detectTIntersection(
          x, y, this.currentRoad.id
        );
        
        if (intersection) {
          // Add the point to complete the road
          if (this.isExtending && this.extendingFromStart) {
            // Insert at the beginning if extending from start
            this.currentRoad.points.unshift({ x: intersection.point.x, y: intersection.point.y });
          } else {
            this.currentRoad.addPoint(intersection.point.x, intersection.point.y);
          }
          
          // Update the road in element manager if extending
          if (this.isExtending) {
            this.elementManager.emit('roadUpdated', this.currentRoad);
          } else {
            this.elementManager.addRoad(this.currentRoad);
          }
          
          // Create the intersection with the current road ID
          this.elementManager.createIntersectionAt(
            intersection.point.x,
            intersection.point.y,
            [this.currentRoad.id, intersection.road.id]
          );
          
          // Mark as not drawing anymore
          this.currentRoad = null;
          this.isDrawing = false;
          this.isExtending = false;
          this.previewPoint = null;
          this.potentialIntersection = null;
          this.toolManager.emit('redraw');
        } else {
          // Add point normally
          if (this.isExtending && this.extendingFromStart) {
            // Insert at the beginning if extending from start
            this.currentRoad.points.unshift({ x, y });
          } else {
            this.currentRoad.addPoint(x, y);
          }
        }
      }
    }
  }

  finishRoad() {
    if (this.currentRoad && this.currentRoad.points.length > 1) {
      if (this.isExtending) {
        // For extended roads, just emit an update event
        this.elementManager.emit('roadUpdated', this.currentRoad);
      } else {
        // For new roads, add them to the element manager
        this.elementManager.addRoad(this.currentRoad);
      }
      this.checkForIntersections(this.currentRoad);
    }
    
    this.currentRoad = null;
    this.isDrawing = false;
    this.isExtending = false;
    this.previewPoint = null;
    this.potentialIntersection = null;
    this.toolManager.emit('redraw');
  }

  checkForIntersections(newRoad) {
    const roads = this.elementManager.getRoads();
    const intersections = this.intersectionDetector.findIntersections(newRoad, roads);
    
    for (const intersection of intersections) {
      this.elementManager.createIntersectionAt(
        intersection.point.x,
        intersection.point.y,
        intersection.roadIds
      );
    }
  }

  renderCanvas(ctx) {
    // Render preview if drawing
    if (this.currentRoad && this.isDrawing) {
      // Draw the current road
      if (this.currentRoad.points.length > 0) {
        const firstPoint = this.currentRoad.points[0];
        const screenFirst = this.viewport.worldToScreen(firstPoint.x, firstPoint.y);
        
        ctx.save();
        // Use a darker color similar to the final road color to prevent brightness
        ctx.strokeStyle = 'rgba(42, 42, 58, 0.9)'; // Similar to ROAD_COLORS.asphalt
        ctx.lineWidth = this.currentRoad.properties.width;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(screenFirst.x, screenFirst.y);
        
        for (let i = 1; i < this.currentRoad.points.length; i++) {
          const point = this.currentRoad.points[i];
          const screenPoint = this.viewport.worldToScreen(point.x, point.y);
          ctx.lineTo(screenPoint.x, screenPoint.y);
        }
        
        if (this.previewPoint) {
          const targetPoint = this.potentialIntersection 
            ? this.potentialIntersection.point 
            : this.previewPoint;
          const screenPreview = this.viewport.worldToScreen(targetPoint.x, targetPoint.y);
          ctx.lineTo(screenPreview.x, screenPreview.y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  renderSVG(svgManager, viewport) {
    if (this.currentRoad && this.isDrawing) {
      // Create a temporary path for the road being drawn
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = '';
      
      // Build path data - handle extending from start differently
      if (this.isExtending && this.extendingFromStart && this.previewPoint) {
        // Start with preview point when extending from start
        const targetPoint = this.potentialIntersection 
          ? this.potentialIntersection.point 
          : this.previewPoint;
        d += `M ${targetPoint.x} ${targetPoint.y}`;
        
        // Then connect to the existing road points
        this.currentRoad.points.forEach((point, index) => {
          d += ` L ${point.x} ${point.y}`;
        });
      } else {
        // Normal path building
        this.currentRoad.points.forEach((point, index) => {
          if (index === 0) {
            d += `M ${point.x} ${point.y}`;
          } else {
            d += ` L ${point.x} ${point.y}`;
          }
        });
        
        // Add preview point if exists
        if (this.previewPoint) {
          // If we have a potential intersection, snap to that point
          const targetPoint = this.potentialIntersection 
            ? this.potentialIntersection.point 
            : this.previewPoint;
          d += ` L ${targetPoint.x} ${targetPoint.y}`;
        }
      }
      
      path.setAttribute('d', d);
      // Use a darker color similar to the final road color to prevent brightness
      path.setAttribute('stroke', 'rgba(42, 42, 58, 0.9)'); // Similar to ROAD_COLORS.asphalt
      path.setAttribute('stroke-width', this.currentRoad.properties.width);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-dasharray', '5 5');
      path.setAttribute('class', 'road-preview');
      
      svgManager.addToLayer('overlay', path);
      
      // If there's a potential T-intersection, show it
      if (this.potentialIntersection) {
        this.renderIntersectionPreview(svgManager, this.potentialIntersection);
      }
    }
  }

  renderIntersectionPreview(svgManager, intersection) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'intersection-preview');
    
    // Outer glow
    const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glowCircle.setAttribute('cx', intersection.point.x);
    glowCircle.setAttribute('cy', intersection.point.y);
    glowCircle.setAttribute('r', '12');
    glowCircle.setAttribute('fill', '#ffff00');
    glowCircle.setAttribute('stroke', '#ff9900');
    glowCircle.setAttribute('stroke-width', '2');
    glowCircle.setAttribute('opacity', '0.4');
    
    // Inner indicator
    const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    innerCircle.setAttribute('cx', intersection.point.x);
    innerCircle.setAttribute('cy', intersection.point.y);
    innerCircle.setAttribute('r', '6');
    innerCircle.setAttribute('fill', '#ff9900');
    innerCircle.setAttribute('opacity', '0.8');
    
    g.appendChild(glowCircle);
    g.appendChild(innerCircle);
    
    svgManager.addToLayer('overlay', g);
  }
}