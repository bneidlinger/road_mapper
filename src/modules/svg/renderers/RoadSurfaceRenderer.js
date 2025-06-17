import { ROAD_COLORS } from '../../../core/constants.js';

/**
 * Handles rendering of road surfaces including sidewalks, curbs, shoulders, and asphalt
 */
export class RoadSurfaceRenderer {
  constructor() {
    this.elements = {
      sidewalks: null,
      curbs: null,
      shoulders: null,
      mainPath: null
    };
  }

  /**
   * Render sidewalks
   * @param {string} pathData - SVG path data
   * @param {Object} properties - Road properties
   * @returns {SVGElement} Sidewalk group
   */
  renderSidewalks(pathData, properties) {
    if (properties.sidewalkWidth <= 0) return null;
    
    const sidewalkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    sidewalkGroup.setAttribute('class', 'sidewalks');

    const totalWidth = properties.width + properties.sidewalkWidth * 2;
    
    const sidewalk = this.createPath(pathData, {
      'stroke': ROAD_COLORS.sidewalk,
      'stroke-width': totalWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'fill': 'none',
      'class': 'sidewalk-path'
    });

    sidewalkGroup.appendChild(sidewalk);
    this.elements.sidewalks = sidewalkGroup;
    return sidewalkGroup;
  }

  /**
   * Render curbs
   * @param {string} pathData - SVG path data
   * @param {Object} properties - Road properties
   * @returns {SVGElement} Curbs group
   */
  renderCurbs(pathData, properties) {
    const curbsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    curbsGroup.setAttribute('class', 'curbs');

    const curbWidth = properties.width + 1;
    
    const curb = this.createPath(pathData, {
      'stroke': ROAD_COLORS.curb,
      'stroke-width': curbWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'fill': 'none',
      'class': 'curb-path'
    });

    curbsGroup.appendChild(curb);
    this.elements.curbs = curbsGroup;
    return curbsGroup;
  }

  /**
   * Render main road surface
   * @param {string} pathData - SVG path data
   * @param {Object} properties - Road properties
   * @param {string} roadType - Type of road (STREET, ARTERIAL, etc)
   * @returns {SVGElement} Surface group
   */
  renderRoadSurface(pathData, properties, roadType) {
    const surfaceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    surfaceGroup.setAttribute('class', 'road-surface');

    const mainPath = this.createPath(pathData, {
      'stroke': ROAD_COLORS.asphalt,
      'stroke-width': properties.width,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'fill': 'none',
      'class': 'road-path',
      'data-road-type': roadType
    });

    surfaceGroup.appendChild(mainPath);
    this.elements.mainPath = mainPath;
    return surfaceGroup;
  }

  /**
   * Render shoulders
   * @param {string} pathData - SVG path data
   * @param {Object} properties - Road properties
   * @returns {SVGElement} Shoulders group
   */
  renderShoulders(pathData, properties) {
    if (properties.shoulderWidth <= 0) return null;
    
    const shouldersGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    shouldersGroup.setAttribute('class', 'shoulders');

    const shoulderWidth = properties.width - properties.shoulderWidth * 2;
    
    const shoulder = this.createPath(pathData, {
      'stroke': ROAD_COLORS.shoulder,
      'stroke-width': shoulderWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'fill': 'none',
      'class': 'shoulder-path'
    });

    shouldersGroup.appendChild(shoulder);
    this.elements.shoulders = shouldersGroup;
    return shouldersGroup;
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
   * Get the main path element
   */
  getMainPath() {
    return this.elements.mainPath;
  }

  /**
   * Update visibility based on zoom level
   * @param {number} zoom - Current zoom level
   * @param {boolean} isBirdsEye - Whether in bird's eye view
   */
  updateVisibility(zoom, isBirdsEye) {
    // Hide sidewalks in bird's eye view
    if (this.elements.sidewalks) {
      this.elements.sidewalks.style.display = isBirdsEye ? 'none' : 'block';
    }
    
    // Hide/show curbs based on view
    if (this.elements.curbs) {
      this.elements.curbs.style.display = isBirdsEye ? 'none' : 'block';
    }
    
    // Show/hide shoulders based on zoom
    if (this.elements.shoulders) {
      this.elements.shoulders.style.display = (zoom >= 1.5 && !isBirdsEye) ? 'block' : 'none';
    }
  }
}