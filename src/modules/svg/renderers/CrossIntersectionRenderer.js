import { IntersectionTypeRenderer } from './IntersectionTypeRenderer.js';

/**
 * Renderer for cross/4-way intersections
 */
export class CrossIntersectionRenderer extends IntersectionTypeRenderer {
  render(intersection, connections, roadWidth, viewport) {
    const elements = [];
    const intersectionSize = roadWidth * 1.2; // Slightly larger than road width
    
    // Create curb/outline
    const curb = this.createRect(
      intersection.x - intersectionSize / 2 - 2,
      intersection.y - intersectionSize / 2 - 2,
      intersectionSize + 4,
      intersectionSize + 4,
      {
        'fill': '#555555',
        'rx': '5',
        'ry': '5'
      }
    );
    elements.push(curb);
    
    // Create asphalt
    const asphalt = this.createRect(
      intersection.x - intersectionSize / 2,
      intersection.y - intersectionSize / 2,
      intersectionSize,
      intersectionSize,
      {
        'fill': '#333333',
        'rx': '4',
        'ry': '4'
      }
    );
    elements.push(asphalt);
    
    return elements;
  }
}