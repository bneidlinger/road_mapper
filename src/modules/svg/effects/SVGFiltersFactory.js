/**
 * Factory for creating SVG filters
 */
export class SVGFiltersFactory {
  /**
   * Create standard glow filter for selection highlights
   * @returns {SVGElement} Filter element
   */
  static createGlowFilter() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    
    return filter;
  }

  /**
   * Create circuit board glow filter for bird's eye view
   * @returns {SVGElement} Filter element
   */
  static createCircuitGlowFilter() {
    const circuitGlow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    circuitGlow.setAttribute('id', 'circuit-glow');
    circuitGlow.setAttribute('width', '200%');
    circuitGlow.setAttribute('height', '200%');
    circuitGlow.setAttribute('x', '-50%');
    circuitGlow.setAttribute('y', '-50%');
    
    // Amplify the color to make it brighter
    const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    colorMatrix.setAttribute('type', 'matrix');
    colorMatrix.setAttribute('values', '0 0 0 0 0   0 1.5 0 0 0   0 0 0 0 0.5   0 0 0 1 0');
    colorMatrix.setAttribute('result', 'brightened');
    
    const circuitBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    circuitBlur.setAttribute('in', 'brightened');
    circuitBlur.setAttribute('stdDeviation', '1');
    circuitBlur.setAttribute('result', 'coloredBlur');
    
    const circuitMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const circuitMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    circuitMergeNode1.setAttribute('in', 'coloredBlur');
    const circuitMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    circuitMergeNode2.setAttribute('in', 'SourceGraphic');
    
    circuitMerge.appendChild(circuitMergeNode1);
    circuitMerge.appendChild(circuitMergeNode2);
    circuitGlow.appendChild(colorMatrix);
    circuitGlow.appendChild(circuitBlur);
    circuitGlow.appendChild(circuitMerge);
    
    return circuitGlow;
  }

  /**
   * Create drop shadow filter
   * @param {Object} options - Shadow options
   * @returns {SVGElement} Filter element
   */
  static createDropShadowFilter(options = {}) {
    const {
      id = 'drop-shadow',
      dx = 2,
      dy = 2,
      stdDeviation = 2,
      opacity = 0.3
    } = options;
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('width', '150%');
    filter.setAttribute('height', '150%');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('in', 'SourceAlpha');
    feGaussianBlur.setAttribute('stdDeviation', stdDeviation);
    
    const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
    feOffset.setAttribute('dx', dx);
    feOffset.setAttribute('dy', dy);
    feOffset.setAttribute('result', 'offsetblur');
    
    const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
    feFlood.setAttribute('flood-color', '#000000');
    feFlood.setAttribute('flood-opacity', opacity);
    
    const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite.setAttribute('in2', 'offsetblur');
    feComposite.setAttribute('operator', 'in');
    
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feOffset);
    filter.appendChild(feFlood);
    filter.appendChild(feComposite);
    filter.appendChild(feMerge);
    
    return filter;
  }
}