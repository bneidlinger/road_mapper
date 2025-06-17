/**
 * Base class for intersection type renderers
 */
export class IntersectionTypeRenderer {
  constructor() {
    this.elements = [];
  }

  /**
   * Render the intersection
   * @param {Object} intersection - Intersection data
   * @param {Array} connections - Connection angles and road IDs
   * @param {number} roadWidth - Width of connected roads
   * @param {Object} viewport - Viewport for zoom-based details
   * @returns {Array<SVGElement>} Array of SVG elements
   */
  render(intersection, connections, roadWidth, viewport) {
    throw new Error('Subclasses must implement render method');
  }

  /**
   * Create SVG rectangle element
   */
  createRect(x, y, width, height, attributes = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    
    Object.entries(attributes).forEach(([key, value]) => {
      rect.setAttribute(key, value);
    });
    
    return rect;
  }

  /**
   * Create SVG circle element
   */
  createCircle(cx, cy, r, attributes = {}) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    
    Object.entries(attributes).forEach(([key, value]) => {
      circle.setAttribute(key, value);
    });
    
    return circle;
  }

  /**
   * Create SVG group element
   */
  createGroup(attributes = {}) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    Object.entries(attributes).forEach(([key, value]) => {
      group.setAttribute(key, value);
    });
    
    return group;
  }

  /**
   * Get road width from connected roads
   */
  getRoadWidth(intersection, elementManager) {
    const roads = elementManager.getRoads();
    let roadWidth = 20; // Default to street width
    
    // Find the actual width from connected roads
    for (const conn of intersection.connectedRoads) {
      const road = roads.find(r => r.id === conn.roadId);
      if (road && road.properties && road.properties.width) {
        roadWidth = road.properties.width;
        break; // Use the first road's width
      }
    }
    
    return roadWidth;
  }
}