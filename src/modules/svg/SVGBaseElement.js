export class SVGBaseElement {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.group = null;
    this.selected = false;
    this.visible = true;
  }

  createElement(svgManager) {
    this.svgManager = svgManager;
    this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.group.setAttribute('id', this.id);
    this.group.setAttribute('class', `element ${this.type}-element`);
    this.group.setAttribute('data-element-id', this.id);
    this.group.setAttribute('data-element-type', this.type);
    
    this.render();
    return this.group;
  }

  render() {
    // Override in subclasses
  }

  update() {
    // Clear group and re-render
    while (this.group.firstChild) {
      this.group.removeChild(this.group.firstChild);
    }
    this.render();
  }

  setSelected(selected) {
    this.selected = selected;
    if (this.group) {
      if (selected) {
        this.group.classList.add('selected');
      } else {
        this.group.classList.remove('selected');
      }
      this.update();
    }
  }

  setVisible(visible) {
    this.visible = visible;
    if (this.group) {
      this.group.style.display = visible ? '' : 'none';
    }
  }

  remove() {
    if (this.group && this.group.parentNode) {
      this.group.parentNode.removeChild(this.group);
    }
  }

  // Helper methods for creating SVG elements
  createPath(d, attributes = {}) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    Object.entries(attributes).forEach(([key, value]) => {
      path.setAttribute(key, value);
    });
    return path;
  }

  createCircle(cx, cy, r, attributes = {}) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    Object.entries(attributes).forEach(([key, value]) => {
      circle.setAttribute(key, value);
    });
    return circle;
  }

  createRect(x, y, width, height, attributes = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    Object.entries(attributes).forEach(([key, value]) => {
      rect.setAttribute(key, value);
    });
    return rect;
  }

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

  createText(x, y, text, attributes = {}) {
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y);
    textElement.textContent = text;
    Object.entries(attributes).forEach(([key, value]) => {
      textElement.setAttribute(key, value);
    });
    return textElement;
  }
}