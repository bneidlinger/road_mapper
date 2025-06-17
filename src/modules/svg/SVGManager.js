import { EventEmitter } from '../../core/EventEmitter.js';

export class SVGManager extends EventEmitter {
  constructor(containerId) {
    super();
    this.container = document.getElementById(containerId);
    this.svg = null;
    this.layers = {};
    this.defs = null;
    this.initialize();
  }

  initialize() {
    // Create main SVG element
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.background = '#0a0a0a';
    
    // Set initial viewBox
    this.setViewBox(0, 0, this.container.offsetWidth, this.container.offsetHeight);
    
    // Create defs for patterns, gradients, etc.
    this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.svg.appendChild(this.defs);
    
    // Create layer groups
    this.createLayers();
    
    // Add to container
    this.container.appendChild(this.svg);
    
    // Setup resize observer
    this.setupResizeObserver();
  }

  createLayers() {
    const layerNames = [
      'grid',           // Grid layer (bottom)
      'underground',    // Tunnels, subways
      'ground',         // Roads, intersections
      'markings',       // Lane markings, crosswalks
      'elevated',       // Bridges, overpasses
      'overlay',        // Selection highlights, previews
      'ui'             // UI elements (top)
    ];

    layerNames.forEach(name => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('id', `layer-${name}`);
      group.setAttribute('class', `layer ${name}-layer`);
      this.layers[name] = group;
      this.svg.appendChild(group);
    });
  }

  setupResizeObserver() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.emit('resize', { width, height });
      }
    });
    
    resizeObserver.observe(this.container);
  }

  setViewBox(x, y, width, height) {
    this.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  }

  getViewBox() {
    const viewBox = this.svg.getAttribute('viewBox').split(' ').map(Number);
    return {
      x: viewBox[0],
      y: viewBox[1],
      width: viewBox[2],
      height: viewBox[3]
    };
  }

  addToLayer(layerName, element) {
    if (this.layers[layerName]) {
      this.layers[layerName].appendChild(element);
    }
  }

  removeFromLayer(layerName, element) {
    if (this.layers[layerName] && element.parentNode === this.layers[layerName]) {
      this.layers[layerName].removeChild(element);
    }
  }

  clearLayer(layerName) {
    if (this.layers[layerName]) {
      while (this.layers[layerName].firstChild) {
        this.layers[layerName].removeChild(this.layers[layerName].firstChild);
      }
    }
  }

  addDef(def) {
    this.defs.appendChild(def);
  }

  createPattern(id, width, height, content) {
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', id);
    pattern.setAttribute('width', width);
    pattern.setAttribute('height', height);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    if (typeof content === 'function') {
      content(pattern);
    } else if (content instanceof Element) {
      pattern.appendChild(content);
    }
    
    this.addDef(pattern);
    return pattern;
  }

  createGradient(id, type = 'linear', stops = []) {
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 
      type === 'radial' ? 'radialGradient' : 'linearGradient'
    );
    gradient.setAttribute('id', id);
    
    stops.forEach(({ offset, color, opacity = 1 }) => {
      const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      stop.setAttribute('stop-opacity', opacity);
      gradient.appendChild(stop);
    });
    
    this.addDef(gradient);
    return gradient;
  }

  screenToSVG(x, y) {
    const pt = this.svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(this.svg.getScreenCTM().inverse());
  }

  svgToScreen(x, y) {
    const pt = this.svg.createSVGPoint();
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(this.svg.getScreenCTM());
  }
}