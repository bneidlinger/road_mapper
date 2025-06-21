export class RealisticIntersectionRenderer {
  constructor() {
    this.pavementColor = '#3d3d4e';
    this.pavementBorderColor = '#2a2a3a';
    this.curbColor = '#4a4a5a';
    this.cornerRadius = 12; // Radius for rounded corners
    this.shadowColor = 'rgba(0, 0, 0, 0.3)';
  }

  /**
   * Renders a realistic intersection with natural pavement blending
   */
  render(intersection, connections, roadWidth, viewport) {
    const elements = [];
    
    // Rendering intersection
    
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
    
    
    return elements;
  }
  
  /**
   * Ensures shadow filter exists in the SVG
   */
  ensureShadowFilter() {
    const svg = document.querySelector('svg');
    if (!svg) return;
    
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    
    // Check if shadow filter already exists
    if (!defs.querySelector('#intersection-shadow')) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'intersection-shadow');
      filter.setAttribute('x', '-50%');
      filter.setAttribute('y', '-50%');
      filter.setAttribute('width', '200%');
      filter.setAttribute('height', '200%');
      
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('in', 'SourceAlpha');
      blur.setAttribute('stdDeviation', '3');
      
      const offset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
      offset.setAttribute('dx', '2');
      offset.setAttribute('dy', '2');
      offset.setAttribute('result', 'offsetblur');
      
      const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode1.setAttribute('in', 'offsetblur');
      const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode2.setAttribute('in', 'SourceGraphic');
      
      merge.appendChild(mergeNode1);
      merge.appendChild(mergeNode2);
      
      filter.appendChild(blur);
      filter.appendChild(offset);
      filter.appendChild(merge);
      
      defs.appendChild(filter);
    }
  }

  /**
   * Creates the main pavement shape that naturally blends with connecting roads
   */
  createIntersectionPavement(intersection, connections, roadWidth) {
    const elements = [];
    const center = { x: intersection.x, y: intersection.y };
    
    // Calculate the convex hull of road edges to create a natural shape
    const points = this.calculateIntersectionShape(center, connections, roadWidth);
    const pathData = this.createSmoothPath(points);
    
    // Create the main pavement polygon
    const pavement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pavement.setAttribute('d', pathData);
    pavement.setAttribute('fill', this.pavementColor);
    pavement.setAttribute('stroke', this.pavementBorderColor);
    pavement.setAttribute('stroke-width', '1');
    pavement.setAttribute('stroke-opacity', '0.5');
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
    path.setAttribute('fill-opacity', '0.4');
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
        // Creating stop line
        const stopLine = this.createStopLine(center, angle, roadWidth);
        elements.push(stopLine);
      }
      
      // Add crosswalk for major intersections (traffic lights only for now)
      if (connections.length >= 4 && intersection.controlType === 'traffic_light') {
        // Creating crosswalk
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
    // Reverse the angle to place stop line on the approach side
    const approachAngle = angle + Math.PI;
    const distance = roadWidth * 0.9;
    const lineWidth = roadWidth * 0.75;
    // Use the original angle for perpendicular calculation
    const perpAngle = angle + Math.PI / 2;
    
    const lineCenter = {
      x: center.x + Math.cos(approachAngle) * distance,
      y: center.y + Math.sin(approachAngle) * distance
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
    line.setAttribute('stroke', '#f0f0f0');
    line.setAttribute('stroke-width', '4');
    line.setAttribute('opacity', '0.9');
    line.setAttribute('stroke-linecap', 'square');
    line.setAttribute('class', 'stop-line');
    
    return line;
  }

  /**
   * Creates crosswalk markings
   */
  createCrosswalk(center, angle, roadWidth) {
    const elements = [];
    // Use approach angle for crosswalk placement
    const approachAngle = angle + Math.PI;
    const distance = roadWidth * 1.2;
    const stripeWidth = 2;
    const stripeLength = 12; // Fixed length for crosswalk stripes
    const stripeSpacing = 3;
    const crosswalkWidth = roadWidth * 0.8;
    const numStripes = Math.floor(stripeLength / (stripeWidth + stripeSpacing));
    
    // Use original angle for perpendicular calculation
    const perpAngle = angle + Math.PI / 2;
    const crosswalkCenter = {
      x: center.x + Math.cos(approachAngle) * distance,
      y: center.y + Math.sin(approachAngle) * distance
    };
    
    for (let i = 0; i < numStripes; i++) {
      const offset = (i - numStripes / 2) * (stripeWidth + stripeSpacing);
      
      // Position along the road direction
      const stripeStart = {
        x: crosswalkCenter.x + Math.cos(angle) * offset,
        y: crosswalkCenter.y + Math.sin(angle) * offset
      };
      
      const stripe = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      // Stripes run perpendicular to the road (across it)
      stripe.setAttribute('x1', stripeStart.x - Math.cos(perpAngle) * crosswalkWidth / 2);
      stripe.setAttribute('y1', stripeStart.y - Math.sin(perpAngle) * crosswalkWidth / 2);
      stripe.setAttribute('x2', stripeStart.x + Math.cos(perpAngle) * crosswalkWidth / 2);
      stripe.setAttribute('y2', stripeStart.y + Math.sin(perpAngle) * crosswalkWidth / 2);
      stripe.setAttribute('stroke', '#e0e0e0');
      stripe.setAttribute('stroke-width', stripeWidth);
      stripe.setAttribute('opacity', '0.8');
      stripe.setAttribute('stroke-linecap', 'square');
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