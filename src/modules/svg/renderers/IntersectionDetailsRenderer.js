/**
 * Handles rendering of intersection details like stop signs and road markings
 */
export class IntersectionDetailsRenderer {
  constructor() {
    this.detailsGroup = null;
  }

  /**
   * Add stop signs for T-intersection
   */
  addTIntersectionStopSigns(intersection, connections, roadWidth) {
    const elements = [];
    
    // Find the stem of the T (the road that needs a stop sign)
    const angles = connections.map(c => c.angle).sort((a, b) => a - b);
    
    let stemAngle = null;
    for (let i = 0; i < angles.length; i++) {
      const angle1 = angles[i];
      const angle2 = angles[(i + 1) % angles.length];
      const diff = Math.abs(angle2 - angle1);
      
      if (Math.abs(diff - Math.PI) < 0.3) {
        stemAngle = angles[(i + 2) % angles.length];
        break;
      }
    }
    
    if (stemAngle !== null) {
      const signDistance = roadWidth * 1.2;
      const signX = intersection.x + Math.cos(stemAngle) * signDistance;
      const signY = intersection.y + Math.sin(stemAngle) * signDistance;
      
      const stopSign = this.createStopSign(signX, signY, 12, stemAngle);
      elements.push(stopSign);
    }
    
    return elements;
  }

  /**
   * Add stop signs for 4-way intersection
   */
  addCrossIntersectionStopSigns(intersection, connections, roadWidth) {
    const elements = [];
    
    // Add stop signs at all 4 approaches
    for (const conn of connections) {
      const signDistance = roadWidth * 1.5;
      const signX = intersection.x + Math.cos(conn.angle) * signDistance;
      const signY = intersection.y + Math.sin(conn.angle) * signDistance;
      
      const stopSign = this.createStopSign(signX, signY, 10, conn.angle);
      elements.push(stopSign);
    }
    
    return elements;
  }

  /**
   * Add road markings for cross intersection
   */
  addCrossRoadMarkings(intersection, connections, roadWidth) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'cross-road-markings');
    
    // Add stop lines for each approach
    for (const conn of connections) {
      const stopLineDistance = roadWidth * 0.8;
      const lineLength = roadWidth * 0.8;
      
      // Calculate stop line position
      const lineX = intersection.x + Math.cos(conn.angle) * stopLineDistance;
      const lineY = intersection.y + Math.sin(conn.angle) * stopLineDistance;
      
      // Calculate perpendicular angle for line direction
      const perpAngle = conn.angle + Math.PI / 2;
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', lineX + Math.cos(perpAngle) * lineLength / 2);
      line.setAttribute('y1', lineY + Math.sin(perpAngle) * lineLength / 2);
      line.setAttribute('x2', lineX - Math.cos(perpAngle) * lineLength / 2);
      line.setAttribute('y2', lineY - Math.sin(perpAngle) * lineLength / 2);
      line.setAttribute('stroke', 'white');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('opacity', '0.8');
      
      g.appendChild(line);
    }
    
    return g;
  }

  /**
   * Create a stop sign
   */
  createStopSign(x, y, size, angle) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x}, ${y}) rotate(${(angle + Math.PI/2) * 180/Math.PI})`);
    
    // Create octagon
    const octagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = [];
    const sides = 8;
    
    for (let i = 0; i < sides; i++) {
      const a = (i * 2 * Math.PI) / sides - Math.PI / 8;
      const px = Math.cos(a) * size;
      const py = Math.sin(a) * size;
      points.push(`${px},${py}`);
    }
    
    octagon.setAttribute('points', points.join(' '));
    octagon.setAttribute('fill', '#dd0000');
    octagon.setAttribute('stroke', 'white');
    octagon.setAttribute('stroke-width', size * 0.1);
    
    g.appendChild(octagon);
    
    // Add text if size is large enough
    if (size > 8) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '0');
      text.setAttribute('y', '0');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-family', 'Arial');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-size', size * 0.4);
      text.textContent = 'STOP';
      
      g.appendChild(text);
    }
    
    return g;
  }
}