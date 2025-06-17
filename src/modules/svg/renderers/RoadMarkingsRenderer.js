import { ROAD_COLORS } from '../../../core/constants.js';

/**
 * Handles rendering of road markings including edge lines, lane dividers, and center lines
 */
export class RoadMarkingsRenderer {
  constructor() {
    this.markingsGroup = null;
  }

  /**
   * Render all road markings for a road
   * @param {Object} road - Road object with points array
   * @param {string} pathData - SVG path data string
   * @param {Object} properties - Road properties (width, lanes, etc)
   * @returns {SVGElement} Group containing all markings
   */
  renderMarkings(road, pathData, properties) {
    this.markingsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.markingsGroup.setAttribute('class', 'lane-markings');

    // Edge lines
    this.renderEdgeLines(road, properties);

    // Lane dividers
    if (properties.lanes > 1) {
      this.renderLaneDividers(road, properties);
    }

    // Center line
    if (properties.lanes > 1) {
      this.renderCenterLine(road, pathData, properties);
    }

    return this.markingsGroup;
  }

  /**
   * Render edge lines along the road
   */
  renderEdgeLines(road, properties) {
    const edgeOffset = properties.width / 2 - 0.2;
    
    // Create offset paths for edge lines
    road.points.forEach((point, i) => {
      if (i === 0) return;
      
      const prev = road.points[i - 1];
      const curr = point;
      
      // Calculate perpendicular vector
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / length;
      const ny = dx / length;
      
      // Left edge line
      const leftLine = this.createLine(
        prev.x + nx * edgeOffset,
        prev.y + ny * edgeOffset,
        curr.x + nx * edgeOffset,
        curr.y + ny * edgeOffset,
        {
          'stroke': ROAD_COLORS.laneMarking,
          'stroke-width': 0.2,
          'class': 'edge-line left'
        }
      );
      
      // Right edge line
      const rightLine = this.createLine(
        prev.x - nx * edgeOffset,
        prev.y - ny * edgeOffset,
        curr.x - nx * edgeOffset,
        curr.y - ny * edgeOffset,
        {
          'stroke': ROAD_COLORS.laneMarking,
          'stroke-width': 0.2,
          'class': 'edge-line right'
        }
      );
      
      this.markingsGroup.appendChild(leftLine);
      this.markingsGroup.appendChild(rightLine);
    });
  }

  /**
   * Render lane divider lines
   */
  renderLaneDividers(road, properties) {
    const laneCount = properties.lanes;
    const laneWidth = properties.laneWidth;
    
    for (let i = 1; i < laneCount; i++) {
      const offset = (i - laneCount / 2) * laneWidth;
      
      road.points.forEach((point, idx) => {
        if (idx === 0) return;
        
        const prev = road.points[idx - 1];
        const curr = point;
        
        // Calculate perpendicular vector
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / length;
        const ny = dx / length;
        
        const line = this.createLine(
          prev.x + nx * offset,
          prev.y + ny * offset,
          curr.x + nx * offset,
          curr.y + ny * offset,
          {
            'stroke': ROAD_COLORS.laneMarking,
            'stroke-width': 0.15,
            'stroke-dasharray': '3 9',
            'class': 'lane-divider'
          }
        );
        
        this.markingsGroup.appendChild(line);
      });
    }
  }

  /**
   * Render center line(s)
   */
  renderCenterLine(road, pathData, properties) {
    const centerLine = this.createPath(pathData, {
      'stroke': ROAD_COLORS.laneMarkingYellow,
      'stroke-width': 0.15,
      'fill': 'none',
      'class': 'center-line'
    });

    // Double yellow for highways and arterials
    if (road.type === 'HIGHWAY' || road.type === 'ARTERIAL') {
      centerLine.setAttribute('stroke-dasharray', 'none');
      
      // Add second line
      const centerLine2 = this.createPath(pathData, {
        'stroke': ROAD_COLORS.laneMarkingYellow,
        'stroke-width': 0.15,
        'fill': 'none',
        'class': 'center-line',
        'transform': 'translate(0.3, 0)'
      });
      
      this.markingsGroup.appendChild(centerLine);
      this.markingsGroup.appendChild(centerLine2);
    } else {
      centerLine.setAttribute('stroke-dasharray', '10 10');
      this.markingsGroup.appendChild(centerLine);
    }
  }

  /**
   * Create SVG line element
   */
  createLine(x1, y1, x2, y2, attributes = {}) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    
    Object.entries(attributes).forEach(([key, value]) => {
      line.setAttribute(key, value);
    });
    
    return line;
  }

  /**
   * Create SVG path element
   */
  createPath(d, attributes = {}) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    
    Object.entries(attributes).forEach(([key, value]) => {
      path.setAttribute(key, value);
    });
    
    return path;
  }

  /**
   * Update visibility based on zoom level
   * @param {number} zoom - Current zoom level
   * @param {boolean} isBirdsEye - Whether in bird's eye view
   */
  updateVisibility(zoom, isBirdsEye) {
    if (this.markingsGroup) {
      this.markingsGroup.style.display = (zoom >= 0.5 && !isBirdsEye) ? 'block' : 'none';
    }
  }
}