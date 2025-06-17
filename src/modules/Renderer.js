export class Renderer {
  constructor(canvas, viewport, grid, elementManager, toolManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.viewport = viewport;
    this.grid = grid;
    this.elementManager = elementManager;
    this.toolManager = toolManager;
    
    this.setupCanvas();
    this.bindEvents();
  }

  setupCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.render();
  }

  bindEvents() {
    this.viewport.on('change', () => this.render());
    this.elementManager.on('roadAdded', () => this.render());
    this.elementManager.on('roadRemoved', () => this.render());
    this.elementManager.on('intersectionAdded', () => this.render());
    this.elementManager.on('intersectionRemoved', () => this.render());
    this.elementManager.on('cleared', () => this.render());
    this.toolManager.on('redraw', () => this.render());
  }

  render() {
    const { width, height } = this.canvas;
    
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    this.grid.draw(this.ctx, this.viewport);
    
    // Draw elements
    const roads = this.elementManager.getRoads();
    const intersections = this.elementManager.getIntersections();
    
    // Draw roads first
    for (const road of roads) {
      road.draw(this.ctx, this.viewport);
    }
    
    // Draw intersections on top
    for (const intersection of intersections) {
      intersection.draw(this.ctx, this.viewport);
    }
    
    // Draw active tool overlay
    const activeTool = this.toolManager.tools[this.toolManager.activeTool];
    if (activeTool && activeTool.draw) {
      activeTool.draw(this.ctx);
    }
  }
}