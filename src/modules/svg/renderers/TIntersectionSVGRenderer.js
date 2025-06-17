import { IntersectionTypeRenderer } from './IntersectionTypeRenderer.js';

/**
 * Renderer for T-shaped intersections
 */
export class TIntersectionSVGRenderer extends IntersectionTypeRenderer {
  render(intersection, connections, roadWidth, viewport) {
    const elements = [];
    const halfWidth = roadWidth / 2;
    const intersectionSize = roadWidth; // Match road width exactly
    
    // Find the stem road (the one that doesn't continue through)
    const stemIndex = this.findStemIndex(connections);
    
    // Create the main curb background
    const curbGroup = this.createGroup();
    
    // Main rectangle for the through road
    const throughCurb = this.createRect(
      intersection.x - intersectionSize,
      intersection.y - halfWidth - 1,
      intersectionSize * 2,
      roadWidth + 2,
      {
        'fill': '#555555',
        'rx': '2'
      }
    );
    
    // Stem rectangle
    const stemCurb = this.createRect(
      intersection.x - halfWidth - 1,
      intersection.y - halfWidth - 1,
      roadWidth + 2,
      intersectionSize,
      {
        'fill': '#555555'
      }
    );
    
    // Rotate based on actual road angles
    if (connections.length === 3 && stemIndex >= 0) {
      const angles = connections.map(c => c.angle).sort((a, b) => a - b);
      const stemAngle = angles[stemIndex];
      const rotation = stemAngle * 180 / Math.PI - 90;
      curbGroup.setAttribute('transform', `rotate(${rotation}, ${intersection.x}, ${intersection.y})`);
    }
    
    curbGroup.appendChild(throughCurb);
    curbGroup.appendChild(stemCurb);
    elements.push(curbGroup);
    
    // Create the asphalt on top
    const asphaltGroup = this.createGroup({
      'transform': curbGroup.getAttribute('transform')
    });
    
    const throughAsphalt = this.createRect(
      intersection.x - intersectionSize,
      intersection.y - halfWidth,
      intersectionSize * 2,
      roadWidth,
      {
        'fill': '#333333',
        'rx': '2'
      }
    );
    
    const stemAsphalt = this.createRect(
      intersection.x - halfWidth,
      intersection.y - halfWidth,
      roadWidth,
      intersectionSize,
      {
        'fill': '#333333'
      }
    );
    
    asphaltGroup.appendChild(throughAsphalt);
    asphaltGroup.appendChild(stemAsphalt);
    elements.push(asphaltGroup);
    
    return elements;
  }

  /**
   * Find which road is the stem by checking angle differences
   */
  findStemIndex(connections) {
    const angles = connections.map(c => c.angle).sort((a, b) => a - b);
    let stemIndex = -1;
    
    // Find which road is the stem by checking angle differences
    for (let i = 0; i < angles.length; i++) {
      const angle1 = angles[i];
      const angle2 = angles[(i + 1) % angles.length];
      const angle3 = angles[(i + 2) % angles.length];
      
      const diff12 = Math.abs(angle2 - angle1);
      const diff23 = Math.abs(angle3 - angle2);
      
      // If two roads are roughly opposite (180 degrees), the third is the stem
      if (Math.abs(diff12 - Math.PI) < 0.3 || Math.abs(diff23 - Math.PI) < 0.3) {
        if (Math.abs(diff12 - Math.PI) < 0.3) {
          stemIndex = (i + 2) % angles.length;
        } else {
          stemIndex = i;
        }
        break;
      }
    }
    
    return stemIndex;
  }
}