// Fluent API for building SVG animations

export class SVGAnimationBuilder {
  constructor(element) {
    this.element = element;
    this.animations = [];
  }

  // Static factory method
  static create(element) {
    return new SVGAnimationBuilder(element);
  }

  // Animate a specific attribute
  animate(attributeName) {
    const animation = new AnimationConfig(attributeName);
    this.animations.push(animation);
    return animation;
  }

  // Apply all animations to the element
  build() {
    this.animations.forEach(animConfig => {
      const animElement = this.createAnimateElement(animConfig);
      this.element.appendChild(animElement);
    });
    return this.element;
  }

  createAnimateElement(config) {
    const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    
    animate.setAttribute('attributeName', config.attributeName);
    animate.setAttribute('values', config.values.join(';'));
    animate.setAttribute('dur', `${config.duration}ms`);
    animate.setAttribute('repeatCount', config.repeatCount);
    
    if (config.begin) {
      animate.setAttribute('begin', `${config.begin}ms`);
    }
    
    if (config.keyTimes) {
      animate.setAttribute('keyTimes', config.keyTimes.join(';'));
    }
    
    if (config.calcMode) {
      animate.setAttribute('calcMode', config.calcMode);
    }
    
    return animate;
  }
}

// Configuration class for individual animations
class AnimationConfig {
  constructor(attributeName) {
    this.attributeName = attributeName;
    this.values = [];
    this.duration = 1000;
    this.repeatCount = 'indefinite';
    this.begin = 0;
    this.keyTimes = null;
    this.calcMode = null;
  }

  // Set values to animate between
  between(...values) {
    this.values = values;
    return this;
  }

  // Set duration in milliseconds
  lasting(ms) {
    this.duration = ms;
    return this;
  }

  // Set repeat count
  repeating(count = 'indefinite') {
    this.repeatCount = count;
    return this;
  }

  // Set animation delay
  delayedBy(ms) {
    this.begin = ms;
    return this;
  }

  // Set key times for more control
  withKeyTimes(...times) {
    this.keyTimes = times;
    return this;
  }

  // Set calculation mode
  withMode(mode) {
    this.calcMode = mode;
    return this;
  }
}

// Preset animation factories
export class AnimationPresets {
  // Create a pulsing animation
  static pulse(element, { 
    attribute = 'opacity',
    minValue = 0.4,
    maxValue = 1,
    duration = 2000,
    delay = 0
  } = {}) {
    const builder = SVGAnimationBuilder.create(element);
    builder.animate(attribute)
      .between(minValue, maxValue, minValue)
      .lasting(duration)
      .delayedBy(delay);
    return builder;
  }

  // Create a growing/shrinking animation
  static grow(element, {
    attribute = 'r',
    startScale = 1,
    endScale = 1.5,
    duration = 3000,
    delay = 0
  } = {}) {
    const baseValue = parseFloat(element.getAttribute(attribute)) || 10;
    const builder = SVGAnimationBuilder.create(element);
    builder.animate(attribute)
      .between(
        baseValue * startScale,
        baseValue * endScale,
        baseValue * startScale
      )
      .lasting(duration)
      .delayedBy(delay);
    return builder;
  }

  // Create a color shift animation
  static colorShift(element, {
    colors = ['#ff0000', '#ff00ff', '#ff0000'],
    duration = 3000,
    delay = 0
  } = {}) {
    const builder = SVGAnimationBuilder.create(element);
    builder.animate('fill')
      .between(...colors)
      .lasting(duration)
      .delayedBy(delay);
    return builder;
  }

  // Create a fade in/out animation
  static fade(element, {
    fadeIn = true,
    duration = 500,
    delay = 0,
    finalOpacity = 1
  } = {}) {
    const startOpacity = fadeIn ? 0 : finalOpacity;
    const endOpacity = fadeIn ? finalOpacity : 0;
    
    const builder = SVGAnimationBuilder.create(element);
    builder.animate('opacity')
      .between(startOpacity, endOpacity)
      .lasting(duration)
      .delayedBy(delay)
      .repeating(1);
    return builder;
  }
}

// Utility to create desynchronized animations for multiple elements
export function createDesyncDelay(x, y, maxDelay = 3000) {
  // Use prime numbers to create pseudo-random distribution
  return (x * 7 + y * 13) % maxDelay;
}