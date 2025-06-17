import { SVGAnimationBuilder, AnimationPresets, createDesyncDelay } from './SVGAnimationBuilder.js';
import { ANIMATION, COLORS, FILTERS, ZOOM_THRESHOLDS } from './EffectConstants.js';

/**
 * Handles all bird's eye view animations and effects
 */
export class BirdsEyeAnimations {
  /**
   * Create animated intersection for bird's eye view
   * @param {Object} intersection - Intersection data with x, y coordinates
   * @param {number} zoom - Current zoom level
   * @returns {SVGElement} Animated SVG group
   */
  static createIntersectionAnimation(intersection, zoom = 0.1) {
    const ledGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ledGroup.setAttribute('class', 'birds-eye-intersection');
    
    // Calculate base size based on zoom
    const baseSize = Math.max(10, Math.min(25, 2 / zoom));
    
    
    // Create unique animation delay for this intersection
    const animationDelay = createDesyncDelay(intersection.x, intersection.y, ANIMATION.PULSE_DURATION);
    
    // Build the layered LED effect
    const layers = this.createIntersectionLayers(intersection, baseSize);
    
    // Apply animations to each layer
    this.animateIntersectionLayers(layers, animationDelay);
    
    // Append all layers to the group
    Object.values(layers).forEach(layer => ledGroup.appendChild(layer));
    
    return ledGroup;
  }

  /**
   * Create the visual layers for an intersection
   */
  static createIntersectionLayers(intersection, baseSize) {
    const { x, y } = intersection;
    const { INTERSECTION: config } = ANIMATION.BIRDS_EYE;
    const colors = COLORS.INTERSECTION;
    
    return {
      outerGlow: this.createCircle(x, y, baseSize * config.BASE_SIZE_MULTIPLIER.OUTER, {
        fill: colors.RED_DARK,
        opacity: String(config.OUTER_OPACITY[0]),
        filter: `blur(${FILTERS.BLUR.HEAVY}px)`
      }),
      
      glowCircle: this.createCircle(x, y, baseSize * config.BASE_SIZE_MULTIPLIER.GLOW, {
        fill: colors.RED_DARK,
        opacity: String(config.GLOW_OPACITY[0]),
        filter: `url(#${FILTERS.CIRCUIT_GLOW.id})`
      }),
      
      middleCircle: this.createCircle(x, y, baseSize * config.BASE_SIZE_MULTIPLIER.MIDDLE, {
        fill: colors.RED_MEDIUM,
        opacity: 0.6
      }),
      
      coreCircle: this.createCircle(x, y, baseSize * config.BASE_SIZE_MULTIPLIER.CORE, {
        fill: colors.RED_LIGHT,
        opacity: '1',
        stroke: '#ff0000',
        'stroke-width': '2'
      }),
      
      innerCore: this.createCircle(x, y, baseSize * config.BASE_SIZE_MULTIPLIER.INNER, {
        fill: colors.RED_PALE,
        opacity: 1
      })
    };
  }

  /**
   * Apply animations to intersection layers
   */
  static animateIntersectionLayers(layers, delay) {
    const { INTERSECTION: config } = ANIMATION.BIRDS_EYE;
    const duration = ANIMATION.PULSE_DURATION;
    
    // Animate outer glow - expanding radius and fading
    AnimationPresets.grow(layers.outerGlow, {
      startScale: config.BASE_SIZE_MULTIPLIER.OUTER,
      endScale: config.BASE_SIZE_MULTIPLIER.OUTER * 1.33, // 2/1.5 = 1.33
      duration,
      delay
    }).build();
    
    // Also animate opacity for outer glow (using first and second values as min/max)
    AnimationPresets.pulse(layers.outerGlow, {
      attribute: 'opacity',
      minValue: config.OUTER_OPACITY[1], // 0.1
      maxValue: config.OUTER_OPACITY[0], // 0.2 
      duration,
      delay
    }).build();
    
    // Animate glow circle - opacity pulse
    AnimationPresets.pulse(layers.glowCircle, {
      attribute: 'opacity',
      minValue: config.GLOW_OPACITY[0], // 0.4
      maxValue: config.GLOW_OPACITY[1], // 0.6
      duration,
      delay
    }).build();
    
    // Animate core - color shifting
    AnimationPresets.colorShift(layers.coreCircle, {
      colors: config.CORE_COLORS,
      duration,
      delay
    }).build();
  }

  /**
   * Create road bird's eye effect (static styling, no animation)
   */
  static applyRoadBirdsEyeStyle(pathElement) {
    const { ROAD } = ANIMATION.BIRDS_EYE;
    
    // Apply bird's eye styling
    pathElement.style.cssText = `
      stroke: ${ROAD.COLOR} !important;
      stroke-width: ${ROAD.STROKE_WIDTH}px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      stroke-opacity: 1 !important;
      fill: none !important;
    `;
    
    // Note: Glow filter can be re-enabled once confirmed working
    // pathElement.style.filter = `url(#${ROAD.GLOW_FILTER})`;
    
    return pathElement;
  }

  /**
   * Remove bird's eye styling from road
   */
  static removeRoadBirdsEyeStyle(pathElement) {
    // Clear inline styles
    pathElement.style.cssText = '';
    pathElement.style.stroke = '';
    pathElement.style.strokeWidth = '';
    
    return pathElement;
  }

  /**
   * Helper to create a circle element
   */
  static createCircle(cx, cy, r, attributes = {}) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'filter') {
        // Handle both style filters (blur) and SVG filters (url)
        if (value.startsWith('url(')) {
          circle.setAttribute('filter', value);
        } else {
          circle.style.filter = value;
        }
      } else {
        circle.setAttribute(key, value);
      }
    });
    
    
    return circle;
  }

  /**
   * Check if zoom level is in bird's eye range
   */
  static isBirdsEyeZoom(zoom) {
    return zoom < ZOOM_THRESHOLDS.BIRDS_EYE;
  }
}