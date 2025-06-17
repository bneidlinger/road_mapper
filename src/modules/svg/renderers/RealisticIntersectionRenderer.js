export class RealisticIntersectionRenderer {
  constructor() {
    this.pavementColor = '#4a4a4a';
    this.pavementBorderColor = '#3a3a3a';
    this.curbColor = '#666666';
    this.cornerRadius = 8; // Radius for rounded corners
  }

  /**
   * Renders a realistic intersection with natural pavement blending
   */
  render(intersection, connections, roadWidth, viewport) {
    const elements = [];
    
    console.log('RealisticIntersectionRenderer: Rendering intersection at', intersection.x, intersection.y);
    
    // Sort connections by angle for proper rendering
    const sortedConnections = [...connections].sort((a, b) => a.angle - b.angle);
    
    // Create the main intersection pavement
    const pavement = this.createIntersectionPavement(intersection, sortedConnections, roadWidth);
    elements.push(...pavement);
    
    // Add curbs
    const curbs = this.createCurbs(intersection, sortedConnections, roadWidth);
    elements.push(...curbs);
    
    // Add road markings based on intersection type
    if (intersection.controlType !== 'none') {
      const markings = this.createRoadMarkings(intersection, sortedConnections, roadWidth);
      elements.push(...markings);
    }
    
    // Add a debug circle to show the actual hit test area
    const debugCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    debugCircle.setAttribute('cx', intersection.x);
    debugCircle.setAttribute('cy', intersection.y);
    debugCircle.setAttribute('r', intersection.radius);
    debugCircle.setAttribute('fill', 'rgba(255,0,0,0.3)');
    debugCircle.setAttribute('stroke', 'red');
    debugCircle.setAttribute('stroke-width', '3');
    debugCircle.setAttribute('stroke-dasharray', '5,5');
    elements.push(debugCircle);
    
    // Add center crosshair
    const crosshairSize = 10;
    const crosshairH = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crosshairH.setAttribute('x1', intersection.x - crosshairSize);
    crosshairH.setAttribute('y1', intersection.y);
    crosshairH.setAttribute('x2', intersection.x + crosshairSize);
    crosshairH.setAttribute('y2', intersection.y);
    crosshairH.setAttribute('stroke', 'red');
    crosshairH.setAttribute('stroke-width', '2');
    elements.push(crosshairH);
    
    const crosshairV = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crosshairV.setAttribute('x1', intersection.x);
    crosshairV.setAttribute('y1', intersection.y - crosshairSize);
    crosshairV.setAttribute('x2', intersection.x);
    crosshairV.setAttribute('y2', intersection.y + crosshairSize);
    crosshairV.setAttribute('stroke', 'red');
    crosshairV.setAttribute('stroke-width', '2');
    elements.push(crosshairV);
    
    // Add text showing coordinates
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', intersection.x);
    text.setAttribute('y', intersection.y - intersection.radius - 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'red');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');
    text.textContent = `(${intersection.x}, ${intersection.y})`;
    elements.push(text);
    
    return elements;
  }

  /**
   * Creates the main pavement shape that naturally blends with connecting roads
   */
  createIntersectionPavement(intersection, connections, roadWidth) {
    const elements = [];
    const center = { x: intersection.x, y: intersection.y };
    
    // Calculate the convex hull of road edges to create a natural shape
    const points = this.calculateIntersectionShape(center, connections, roadWidth);
    
    // Create the main pavement polygon
    const pavement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = this.createSmoothPath(points);
    pavement.setAttribute('d', pathData);
    pavement.setAttribute('fill', this.pavementColor);
    pavement.setAttribute('stroke', this.pavementBorderColor);
    pavement.setAttribute('stroke-width', '0.5');
    pavement.setAttribute('class', 'intersection-pavement');
    
    elements.push(pavement);
    
    return elements;
  }

  /**
   * Calculates the shape of the intersection based on connecting roads
   */
  calculateIntersectionShape(center, connections, roadWidth) {
    const points = [];
    const extendDistance = roadWidth * 0.7; // How far the pavement extends into roads
    
    connections.forEach((conn, index) => {
      const angle = conn.angle;
      const nextAngle = connections[(index + 1) % connections.length].angle;
      
      // Calculate the perpendicular angles for road edges
      const perpAngle1 = angle - Math.PI / 2;
      const perpAngle2 = angle + Math.PI / 2;
      
      // Create points for the road edges
      const edge1 = {
        x: center.x + Math.cos(angle) * extendDistance + Math.cos(perpAngle1) * (roadWidth / 2),
        y: center.y + Math.sin(angle) * extendDistance + Math.sin(perpAngle1) * (roadWidth / 2)
      };
      
      const edge2 = {
        x: center.x + Math.cos(angle) * extendDistance + Math.cos(perpAngle2) * (roadWidth / 2),
        y: center.y + Math.sin(angle) * extendDistance + Math.sin(perpAngle2) * (roadWidth / 2)
      };
      
      // Add corner points between roads for smooth transitions
      const angleDiff = this.normalizeAngle(nextAngle - angle);
      const cornerAngle = angle + angleDiff / 2;
      const cornerDistance = roadWidth / Math.sin(angleDiff / 2) * 0.8;
      
      const cornerPoint = {
        x: center.x + Math.cos(cornerAngle) * Math.min(cornerDistance, roadWidth * 1.5),
        y: center.y + Math.sin(cornerAngle) * Math.min(cornerDistance, roadWidth * 1.5)
      };
      
      points.push(edge1);
      if (angleDiff > Math.PI / 6) { // Only add corner point for wide angles
        points.push(cornerPoint);
      }
      points.push(edge2);
    });
    
    return points;
  }

  /**
   * Creates a smooth path from points using bezier curves
   */
  createSmoothPath(points) {
    if (points.length < 3) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length; i++) {
      const current = points[i];
      const next = points[(i + 1) % points.length];
      const nextNext = points[(i + 2) % points.length];
      
      // Calculate control points for smooth curves
      const cp1 = this.getControlPoint(current, next, 0.3);
      const cp2 = this.getControlPoint(next, current, 0.3);
      
      path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${next.x} ${next.y}`;
    }
    
    path += ' Z';
    return path;
  }

  /**
   * Calculates bezier control points for smooth curves
   */
  getControlPoint(from, to, factor = 0.3) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return {
      x: from.x + dx * factor,
      y: from.y + dy * factor
    };
  }

  /**
   * Creates realistic curb elements
   */
  createCurbs(intersection, connections, roadWidth) {
    const elements = [];
    const center = { x: intersection.x, y: intersection.y };
    const curbWidth = 2;
    
    connections.forEach((conn, index) => {
      const angle = conn.angle;
      const nextConn = connections[(index + 1) % connections.length];
      const nextAngle = nextConn.angle;
      
      // Create curb segments between roads
      const angleDiff = this.normalizeAngle(nextAngle - angle);
      if (angleDiff > Math.PI / 3) { // Only add curbs for wide angles
        const startAngle = angle + Math.PI / 2;
        const endAngle = nextAngle - Math.PI / 2;
        
        const curb = this.createCurbArc(center, roadWidth * 0.8, curbWidth, startAngle, endAngle);
        elements.push(curb);
      }
    });
    
    return elements;
  }

  /**
   * Creates a curb arc element
   */
  createCurbArc(center, radius, width, startAngle, endAngle) {
    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    
    const innerRadius = radius - width / 2;
    const outerRadius = radius + width / 2;
    
    const startInner = {
      x: center.x + Math.cos(startAngle) * innerRadius,
      y: center.y + Math.sin(startAngle) * innerRadius
    };
    
    const endInner = {
      x: center.x + Math.cos(endAngle) * innerRadius,
      y: center.y + Math.sin(endAngle) * innerRadius
    };
    
    const startOuter = {
      x: center.x + Math.cos(startAngle) * outerRadius,
      y: center.y + Math.sin(startAngle) * outerRadius
    };
    
    const endOuter = {
      x: center.x + Math.cos(endAngle) * outerRadius,
      y: center.y + Math.sin(endAngle) * outerRadius
    };
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = `
      M ${startInner.x} ${startInner.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}
      L ${endOuter.x} ${endOuter.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${startOuter.x} ${startOuter.y}
      Z
    `;
    
    path.setAttribute('d', d);
    path.setAttribute('fill', this.curbColor);
    path.setAttribute('class', 'intersection-curb');
    
    return path;
  }

  /**
   * Creates road markings (stop lines, crosswalks)
   */
  createRoadMarkings(intersection, connections, roadWidth) {
    const elements = [];
    const center = { x: intersection.x, y: intersection.y };
    
    connections.forEach((conn, index) => {
      const angle = conn.angle;
      
      // Add stop line
      if (intersection.controlType === 'stop_sign' && 
          intersection.stopSignConfig.positions.includes(index)) {
        const stopLine = this.createStopLine(center, angle, roadWidth);
        elements.push(stopLine);
      }
      
      // Add crosswalk for major intersections
      if (connections.length >= 4 && intersection.controlType !== 'none') {
        const crosswalk = this.createCrosswalk(center, angle, roadWidth);
        elements.push(...crosswalk);
      }
    });
    
    return elements;
  }

  /**
   * Creates a stop line marking
   */
  createStopLine(center, angle, roadWidth) {
    const distance = roadWidth * 0.8;
    const lineWidth = roadWidth * 0.8;
    const perpAngle = angle + Math.PI / 2;
    
    const lineCenter = {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance
    };
    
    const start = {
      x: lineCenter.x + Math.cos(perpAngle) * (lineWidth / 2),
      y: lineCenter.y + Math.sin(perpAngle) * (lineWidth / 2)
    };
    
    const end = {
      x: lineCenter.x - Math.cos(perpAngle) * (lineWidth / 2),
      y: lineCenter.y - Math.sin(perpAngle) * (lineWidth / 2)
    };
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('stroke', 'white');
    line.setAttribute('stroke-width', '3');
    line.setAttribute('opacity', '0.8');
    line.setAttribute('class', 'stop-line');
    
    return line;
  }

  /**
   * Creates crosswalk markings
   */
  createCrosswalk(center, angle, roadWidth) {
    const elements = [];
    const distance = roadWidth * 1.2;
    const stripeWidth = 3;
    const stripeLength = roadWidth * 0.8;
    const stripeSpacing = 4;
    const numStripes = Math.floor(roadWidth / (stripeWidth + stripeSpacing));
    
    const perpAngle = angle + Math.PI / 2;
    const crosswalkCenter = {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance
    };
    
    for (let i = 0; i < numStripes; i++) {
      const offset = (i - numStripes / 2) * (stripeWidth + stripeSpacing);
      
      const stripeStart = {
        x: crosswalkCenter.x + Math.cos(perpAngle) * offset,
        y: crosswalkCenter.y + Math.sin(perpAngle) * offset
      };
      
      const stripe = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stripe.setAttribute('x1', stripeStart.x - Math.cos(angle) * stripeLength / 2);
      stripe.setAttribute('y1', stripeStart.y - Math.sin(angle) * stripeLength / 2);
      stripe.setAttribute('x2', stripeStart.x + Math.cos(angle) * stripeLength / 2);
      stripe.setAttribute('y2', stripeStart.y + Math.sin(angle) * stripeLength / 2);
      stripe.setAttribute('stroke', 'white');
      stripe.setAttribute('stroke-width', stripeWidth);
      stripe.setAttribute('opacity', '0.7');
      stripe.setAttribute('class', 'crosswalk-stripe');
      
      elements.push(stripe);
    }
    
    return elements;
  }

  /**
   * Normalizes angle to [0, 2π]
   */
  normalizeAngle(angle) {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle > 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  }
}