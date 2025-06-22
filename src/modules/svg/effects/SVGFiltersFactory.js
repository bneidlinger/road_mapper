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
   * Create building selection glow filter
   * @returns {SVGElement} Filter element
   */
  static createBuildingSelectionGlow() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'building-selection-glow');
    filter.setAttribute('width', '150%');
    filter.setAttribute('height', '150%');
    filter.setAttribute('x', '-25%');
    filter.setAttribute('y', '-25%');
    
    // Create a green glow effect
    const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    feColorMatrix.setAttribute('type', 'matrix');
    feColorMatrix.setAttribute('values', '0 0 0 0 0   0 1 0 0 0.5   0 0 0 0 0.5   0 0 0 1 0');
    feColorMatrix.setAttribute('result', 'greenGlow');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('in', 'greenGlow');
    feGaussianBlur.setAttribute('stdDeviation', '3');
    feGaussianBlur.setAttribute('result', 'coloredBlur');
    
    const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feColorMatrix);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    
    return filter;
  }

  /**
   * Create city light blur filter for building lights
   * @returns {SVGElement} Filter element
   */
  static createCityLightBlur() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'city-light-blur');
    filter.setAttribute('width', '300%');
    filter.setAttribute('height', '300%');
    filter.setAttribute('x', '-100%');
    filter.setAttribute('y', '-100%');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('in', 'SourceGraphic');
    feGaussianBlur.setAttribute('stdDeviation', '4');
    
    filter.appendChild(feGaussianBlur);
    
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

  /**
   * Create building shadow filters for different heights
   * @returns {Array<SVGElement>} Array of filter elements
   */
  static createBuildingShadowFilters() {
    const filters = [];
    
    // Small building shadow
    filters.push(this.createDropShadowFilter({
      id: 'building-shadow-small',
      dx: 2,
      dy: 2,
      stdDeviation: 1.5,
      opacity: 0.25
    }));
    
    // Medium building shadow
    filters.push(this.createDropShadowFilter({
      id: 'building-shadow-medium',
      dx: 3,
      dy: 3,
      stdDeviation: 2,
      opacity: 0.3
    }));
    
    // Large building shadow
    filters.push(this.createDropShadowFilter({
      id: 'building-shadow-large',
      dx: 4,
      dy: 4,
      stdDeviation: 3,
      opacity: 0.35
    }));
    
    // Tall building shadow
    filters.push(this.createDropShadowFilter({
      id: 'building-shadow-tall',
      dx: 6,
      dy: 6,
      stdDeviation: 4,
      opacity: 0.4
    }));
    
    return filters;
  }

  /**
   * Create building 3D effect filter
   * @returns {SVGElement} Filter element
   */
  static createBuilding3DEffect() {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'building-3d-effect');
    filter.setAttribute('width', '150%');
    filter.setAttribute('height', '150%');
    filter.setAttribute('x', '-25%');
    filter.setAttribute('y', '-25%');
    
    // Create lighting effect
    const feDiffuseLighting = document.createElementNS('http://www.w3.org/2000/svg', 'feDiffuseLighting');
    feDiffuseLighting.setAttribute('in', 'SourceGraphic');
    feDiffuseLighting.setAttribute('lighting-color', 'white');
    feDiffuseLighting.setAttribute('surfaceScale', '2');
    
    const feDistantLight = document.createElementNS('http://www.w3.org/2000/svg', 'feDistantLight');
    feDistantLight.setAttribute('azimuth', '45');
    feDistantLight.setAttribute('elevation', '45');
    
    feDiffuseLighting.appendChild(feDistantLight);
    
    const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    feComposite.setAttribute('operator', 'arithmetic');
    feComposite.setAttribute('k1', '0');
    feComposite.setAttribute('k2', '0.8');
    feComposite.setAttribute('k3', '0.2');
    feComposite.setAttribute('k4', '0');
    feComposite.setAttribute('in2', 'SourceGraphic');
    
    filter.appendChild(feDiffuseLighting);
    filter.appendChild(feComposite);
    
    return filter;
  }
}