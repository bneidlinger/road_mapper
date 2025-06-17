import { IntersectionTypeRenderer } from './IntersectionTypeRenderer.js';

/**
 * Renderer for simple/circular intersections
 */
export class SimpleIntersectionRenderer extends IntersectionTypeRenderer {
  render(intersection, connections, roadWidth, viewport) {
    const elements = [];
    const radius = roadWidth * 0.7; // Proportional to road width
    
    // Curb
    const curb = this.createCircle(
      intersection.x,
      intersection.y,
      radius + 1,
      {
        'fill': '#555555'
      }
    );
    elements.push(curb);
    
    // Asphalt
    const asphalt = this.createCircle(
      intersection.x,
      intersection.y,
      radius,
      {
        'fill': '#333333'
      }
    );
    elements.push(asphalt);
    
    return elements;
  }
}