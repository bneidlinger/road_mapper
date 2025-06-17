export class RealisticControlsRenderer {
  constructor() {
    // Stop sign colors and dimensions
    this.stopSign = {
      postColor: '#808080',
      signColor: '#dd0000',
      textColor: '#ffffff',
      size: 8, // Sign size
      postHeight: 20,
      postWidth: 2
    };
    
    // Traffic light colors and dimensions
    this.trafficLight = {
      poleColor: '#404040',
      housingColor: '#1a1a1a',
      visorColor: '#0a0a0a',
      redLight: '#ff0000',
      yellowLight: '#ffaa00',
      greenLight: '#00ff00',
      offLight: '#333333',
      poleWidth: 3,
      poleHeight: 25,
      housingWidth: 10,
      housingHeight: 24
    };
    
    // Yield sign properties
    this.yieldSign = {
      postColor: '#808080',
      signColor: '#ff0000',
      innerColor: '#ffffff',
      textColor: '#ff0000',
      size: 10,
      postHeight: 18,
      postWidth: 2
    };
  }

  /**
   * Creates a realistic isometric stop sign
   */
  createStopSign(center, angle, roadWidth) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'stop-sign-group');
    
    // Position the sign offset from the road edge
    const distance = roadWidth * 0.6;
    const offsetAngle = angle - Math.PI / 4; // 45 degree offset for better visibility
    
    const signPos = {
      x: center.x + Math.cos(angle) * distance + Math.cos(offsetAngle) * 8,
      y: center.y + Math.sin(angle) * distance + Math.sin(offsetAngle) * 8
    };
    
    // Create post (with perspective)
    const post = this.createPost(signPos, this.stopSign.postHeight, this.stopSign.postWidth, this.stopSign.postColor);
    group.appendChild(post);
    
    // Create octagonal stop sign
    const sign = this.createOctagonalSign(signPos, this.stopSign.size);
    group.appendChild(sign);
    
    // Add "STOP" text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', signPos.x);
    text.setAttribute('y', signPos.y - this.stopSign.postHeight + 1);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', this.stopSign.textColor);
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '5');
    text.textContent = 'STOP';
    group.appendChild(text);
    
    // Add shadow for depth
    const shadow = this.createSignShadow(signPos, this.stopSign.size);
    group.insertBefore(shadow, post);
    
    return group;
  }

  /**
   * Creates an octagonal stop sign shape
   */
  createOctagonalSign(pos, size) {
    const sign = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Calculate octagon vertices
    const vertices = [];
    const angleStep = Math.PI / 4; // 45 degrees
    const startAngle = Math.PI / 8; // Start at 22.5 degrees for proper orientation
    
    for (let i = 0; i < 8; i++) {
      const angle = startAngle + i * angleStep;
      vertices.push({
        x: pos.x + Math.cos(angle) * size,
        y: pos.y - this.stopSign.postHeight + Math.sin(angle) * size
      });
    }
    
    // Create the octagon
    const octagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = vertices.map(v => `${v.x},${v.y}`).join(' ');
    octagon.setAttribute('points', points);
    octagon.setAttribute('fill', this.stopSign.signColor);
    octagon.setAttribute('stroke', '#aa0000');
    octagon.setAttribute('stroke-width', '0.5');
    
    // Add white border
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const borderVertices = [];
    for (let i = 0; i < 8; i++) {
      const angle = startAngle + i * angleStep;
      borderVertices.push({
        x: pos.x + Math.cos(angle) * (size - 1),
        y: pos.y - this.stopSign.postHeight + Math.sin(angle) * (size - 1)
      });
    }
    const borderPoints = borderVertices.map(v => `${v.x},${v.y}`).join(' ');
    border.setAttribute('points', borderPoints);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', this.stopSign.textColor);
    border.setAttribute('stroke-width', '0.8');
    
    sign.appendChild(octagon);
    sign.appendChild(border);
    
    return sign;
  }

  /**
   * Creates a realistic traffic light
   */
  createTrafficLight(center, angle, roadWidth, state = 'green') {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'traffic-light-group');
    
    // Position the traffic light
    const distance = roadWidth * 0.8;
    const offsetAngle = angle - Math.PI / 6; // 30 degree offset
    
    const lightPos = {
      x: center.x + Math.cos(angle) * distance + Math.cos(offsetAngle) * 10,
      y: center.y + Math.sin(angle) * distance + Math.sin(offsetAngle) * 10
    };
    
    // Create pole
    const pole = this.createPost(lightPos, this.trafficLight.poleHeight, this.trafficLight.poleWidth, this.trafficLight.poleColor);
    group.appendChild(pole);
    
    // Create arm extending over the road
    const armLength = roadWidth * 0.6;
    const arm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arm.setAttribute('x1', lightPos.x);
    arm.setAttribute('y1', lightPos.y - this.trafficLight.poleHeight);
    arm.setAttribute('x2', lightPos.x + Math.cos(angle + Math.PI) * armLength);
    arm.setAttribute('y2', lightPos.y - this.trafficLight.poleHeight);
    arm.setAttribute('stroke', this.trafficLight.poleColor);
    arm.setAttribute('stroke-width', this.trafficLight.poleWidth);
    arm.setAttribute('stroke-linecap', 'round');
    group.appendChild(arm);
    
    // Create traffic light housing at end of arm
    const housingPos = {
      x: lightPos.x + Math.cos(angle + Math.PI) * armLength,
      y: lightPos.y - this.trafficLight.poleHeight
    };
    
    const housing = this.createTrafficLightHousing(housingPos, state);
    group.appendChild(housing);
    
    // Add shadow
    const shadow = this.createPoleShadow(lightPos, this.trafficLight.poleHeight);
    group.insertBefore(shadow, pole);
    
    return group;
  }

  /**
   * Creates the traffic light housing with lights
   */
  createTrafficLightHousing(pos, state) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Main housing
    const housing = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    housing.setAttribute('x', pos.x - this.trafficLight.housingWidth / 2);
    housing.setAttribute('y', pos.y);
    housing.setAttribute('width', this.trafficLight.housingWidth);
    housing.setAttribute('height', this.trafficLight.housingHeight);
    housing.setAttribute('rx', '2');
    housing.setAttribute('fill', this.trafficLight.housingColor);
    housing.setAttribute('stroke', '#000000');
    housing.setAttribute('stroke-width', '0.5');
    group.appendChild(housing);
    
    // Add visor
    const visor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    visor.setAttribute('x', pos.x - this.trafficLight.housingWidth / 2 - 1);
    visor.setAttribute('y', pos.y - 1);
    visor.setAttribute('width', this.trafficLight.housingWidth + 2);
    visor.setAttribute('height', this.trafficLight.housingHeight + 2);
    visor.setAttribute('rx', '2');
    visor.setAttribute('fill', 'none');
    visor.setAttribute('stroke', this.trafficLight.visorColor);
    visor.setAttribute('stroke-width', '1');
    group.appendChild(visor);
    
    // Add lights
    const lightRadius = 3;
    const lightSpacing = this.trafficLight.housingHeight / 3;
    
    // Red light
    const redLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    redLight.setAttribute('cx', pos.x);
    redLight.setAttribute('cy', pos.y + lightSpacing / 2);
    redLight.setAttribute('r', lightRadius);
    redLight.setAttribute('fill', state === 'red' ? this.trafficLight.redLight : this.trafficLight.offLight);
    if (state === 'red') {
      redLight.setAttribute('filter', 'url(#glow-red)');
    }
    group.appendChild(redLight);
    
    // Yellow light
    const yellowLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    yellowLight.setAttribute('cx', pos.x);
    yellowLight.setAttribute('cy', pos.y + lightSpacing * 1.5);
    yellowLight.setAttribute('r', lightRadius);
    yellowLight.setAttribute('fill', state === 'yellow' ? this.trafficLight.yellowLight : this.trafficLight.offLight);
    if (state === 'yellow') {
      yellowLight.setAttribute('filter', 'url(#glow-yellow)');
    }
    group.appendChild(yellowLight);
    
    // Green light
    const greenLight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    greenLight.setAttribute('cx', pos.x);
    greenLight.setAttribute('cy', pos.y + lightSpacing * 2.5);
    greenLight.setAttribute('r', lightRadius);
    greenLight.setAttribute('fill', state === 'green' ? this.trafficLight.greenLight : this.trafficLight.offLight);
    if (state === 'green') {
      greenLight.setAttribute('filter', 'url(#glow-green)');
    }
    group.appendChild(greenLight);
    
    return group;
  }

  /**
   * Creates a yield sign
   */
  createYieldSign(center, angle, roadWidth) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'yield-sign-group');
    
    // Position the sign
    const distance = roadWidth * 0.6;
    const offsetAngle = angle - Math.PI / 4;
    
    const signPos = {
      x: center.x + Math.cos(angle) * distance + Math.cos(offsetAngle) * 8,
      y: center.y + Math.sin(angle) * distance + Math.sin(offsetAngle) * 8
    };
    
    // Create post
    const post = this.createPost(signPos, this.yieldSign.postHeight, this.yieldSign.postWidth, this.yieldSign.postColor);
    group.appendChild(post);
    
    // Create triangular yield sign
    const signY = signPos.y - this.yieldSign.postHeight;
    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const size = this.yieldSign.size;
    const points = `
      ${signPos.x},${signY - size * 0.6}
      ${signPos.x - size * 0.5},${signY + size * 0.4}
      ${signPos.x + size * 0.5},${signY + size * 0.4}
    `;
    triangle.setAttribute('points', points);
    triangle.setAttribute('fill', this.yieldSign.signColor);
    triangle.setAttribute('stroke', '#cc0000');
    triangle.setAttribute('stroke-width', '0.5');
    group.appendChild(triangle);
    
    // Add inner white triangle
    const innerTriangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const innerSize = size * 0.8;
    const innerPoints = `
      ${signPos.x},${signY - innerSize * 0.6}
      ${signPos.x - innerSize * 0.5},${signY + innerSize * 0.4}
      ${signPos.x + innerSize * 0.5},${signY + innerSize * 0.4}
    `;
    innerTriangle.setAttribute('points', innerPoints);
    innerTriangle.setAttribute('fill', this.yieldSign.innerColor);
    group.appendChild(innerTriangle);
    
    // Add "YIELD" text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', signPos.x);
    text.setAttribute('y', signY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', this.yieldSign.textColor);
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '4');
    text.textContent = 'YIELD';
    group.appendChild(text);
    
    // Add shadow
    const shadow = this.createSignShadow(signPos, size);
    group.insertBefore(shadow, post);
    
    return group;
  }

  /**
   * Creates a post with isometric perspective
   */
  createPost(pos, height, width, color) {
    const post = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    post.setAttribute('x1', pos.x);
    post.setAttribute('y1', pos.y);
    post.setAttribute('x2', pos.x);
    post.setAttribute('y2', pos.y - height);
    post.setAttribute('stroke', color);
    post.setAttribute('stroke-width', width);
    post.setAttribute('stroke-linecap', 'round');
    post.setAttribute('class', 'sign-post');
    return post;
  }

  /**
   * Creates a shadow for signs
   */
  createSignShadow(pos, size) {
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shadow.setAttribute('cx', pos.x + 2);
    shadow.setAttribute('cy', pos.y + 1);
    shadow.setAttribute('rx', size * 0.4);
    shadow.setAttribute('ry', size * 0.2);
    shadow.setAttribute('fill', '#000000');
    shadow.setAttribute('opacity', '0.2');
    shadow.setAttribute('class', 'sign-shadow');
    return shadow;
  }

  /**
   * Creates a shadow for poles
   */
  createPoleShadow(pos, height) {
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    shadow.setAttribute('x1', pos.x + 1);
    shadow.setAttribute('y1', pos.y);
    shadow.setAttribute('x2', pos.x + height * 0.3);
    shadow.setAttribute('y2', pos.y - height * 0.7);
    shadow.setAttribute('stroke', '#000000');
    shadow.setAttribute('stroke-width', '2');
    shadow.setAttribute('opacity', '0.15');
    shadow.setAttribute('class', 'pole-shadow');
    return shadow;
  }

  /**
   * Creates glow filters for traffic lights
   */
  createGlowFilters() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Red glow
    const redFilter = this.createGlowFilter('glow-red', '#ff0000');
    defs.appendChild(redFilter);
    
    // Yellow glow
    const yellowFilter = this.createGlowFilter('glow-yellow', '#ffaa00');
    defs.appendChild(yellowFilter);
    
    // Green glow
    const greenFilter = this.createGlowFilter('glow-green', '#00ff00');
    defs.appendChild(greenFilter);
    
    return defs;
  }

  /**
   * Creates a single glow filter
   */
  createGlowFilter(id, color) {
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', id);
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    feGaussianBlur.setAttribute('stdDeviation', '2');
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
}