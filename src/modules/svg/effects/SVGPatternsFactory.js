import { ROAD_COLORS } from '../../../core/constants.js';

/**
 * Factory for creating SVG patterns
 */
export class SVGPatternsFactory {
  /**
   * Create asphalt texture pattern
   * @param {SVGManager} svgManager - SVG manager instance
   * @returns {SVGElement} Pattern element
   */
  static createAsphaltPattern(svgManager) {
    return svgManager.createPattern('asphalt-texture', 100, 100, (pattern) => {
      // Base color
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      rect.setAttribute('fill', ROAD_COLORS.asphalt);
      pattern.appendChild(rect);
      
      // Add more detailed texture spots for high zoom
      for (let i = 0; i < 30; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', Math.random() * 100);
        circle.setAttribute('cy', Math.random() * 100);
        circle.setAttribute('r', Math.random() * 2 + 0.5);
        circle.setAttribute('fill', ROAD_COLORS.asphaltLight);
        circle.setAttribute('opacity', '0.3');
        pattern.appendChild(circle);
      }
      
      // Add small cracks and imperfections
      for (let i = 0; i < 5; i++) {
        const crack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 20;
        const endY = startY + (Math.random() - 0.5) * 20;
        crack.setAttribute('d', `M ${startX} ${startY} L ${endX} ${endY}`);
        crack.setAttribute('stroke', '#222');
        crack.setAttribute('stroke-width', '0.5');
        crack.setAttribute('opacity', '0.4');
        pattern.appendChild(crack);
      }
    });
  }

  /**
   * Create fine grid pattern
   * @param {SVGManager} svgManager - SVG manager instance
   * @returns {SVGElement} Pattern element
   */
  static createFineGridPattern(svgManager) {
    return svgManager.createPattern('grid-fine', 5, 5, (pattern) => {
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', '0');
      line1.setAttribute('y1', '0');
      line1.setAttribute('x2', '5');
      line1.setAttribute('y2', '0');
      line1.setAttribute('stroke', 'rgba(255,255,255,0.1)');
      line1.setAttribute('stroke-width', '0.5');
      
      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', '0');
      line2.setAttribute('y1', '0');
      line2.setAttribute('x2', '0');
      line2.setAttribute('y2', '5');
      line2.setAttribute('stroke', 'rgba(255,255,255,0.1)');
      line2.setAttribute('stroke-width', '0.5');
      
      pattern.appendChild(line1);
      pattern.appendChild(line2);
    });
  }

  /**
   * Create medium grid pattern
   * @param {SVGManager} svgManager - SVG manager instance
   * @returns {SVGElement} Pattern element
   */
  static createMediumGridPattern(svgManager) {
    return svgManager.createPattern('grid-medium', 50, 50, (pattern) => {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '50');
      rect.setAttribute('height', '50');
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', 'rgba(255,255,255,0.15)');
      rect.setAttribute('stroke-width', '1');
      pattern.appendChild(rect);
    });
  }

  /**
   * Create concrete texture pattern
   * @param {SVGManager} svgManager - SVG manager instance
   * @returns {SVGElement} Pattern element
   */
  static createConcretePattern(svgManager) {
    return svgManager.createPattern('concrete-texture', 80, 80, (pattern) => {
      // Base color
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '80');
      rect.setAttribute('height', '80');
      rect.setAttribute('fill', '#cccccc');
      pattern.appendChild(rect);
      
      // Add texture
      for (let i = 0; i < 20; i++) {
        const spot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        spot.setAttribute('cx', Math.random() * 80);
        spot.setAttribute('cy', Math.random() * 80);
        spot.setAttribute('r', Math.random() * 1.5 + 0.5);
        spot.setAttribute('fill', '#999999');
        spot.setAttribute('opacity', '0.5');
        pattern.appendChild(spot);
      }
    });
  }

  /**
   * Create circuit board pattern for bird's eye view
   * @param {SVGManager} svgManager - SVG manager instance
   * @returns {SVGElement} Pattern element
   */
  static createCircuitBoardPattern(svgManager) {
    return svgManager.createPattern('circuit-board', 100, 100, (pattern) => {
      // Base dark background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100');
      rect.setAttribute('height', '100');
      rect.setAttribute('fill', '#0a0a0a');
      pattern.appendChild(rect);
      
      // Add circuit traces
      for (let i = 0; i < 5; i++) {
        const trace = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const isHorizontal = Math.random() > 0.5;
        
        if (isHorizontal) {
          trace.setAttribute('x1', '0');
          trace.setAttribute('y1', Math.random() * 100);
          trace.setAttribute('x2', '100');
          trace.setAttribute('y2', trace.getAttribute('y1'));
        } else {
          trace.setAttribute('x1', Math.random() * 100);
          trace.setAttribute('y1', '0');
          trace.setAttribute('x2', trace.getAttribute('x1'));
          trace.setAttribute('y2', '100');
        }
        
        trace.setAttribute('stroke', '#001100');
        trace.setAttribute('stroke-width', '0.5');
        trace.setAttribute('opacity', '0.5');
        pattern.appendChild(trace);
      }
      
      // Add solder points
      for (let i = 0; i < 8; i++) {
        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('cx', Math.random() * 100);
        point.setAttribute('cy', Math.random() * 100);
        point.setAttribute('r', '1');
        point.setAttribute('fill', '#003300');
        point.setAttribute('opacity', '0.6');
        pattern.appendChild(point);
      }
    });
  }
}