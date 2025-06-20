export class RealisticControlsRenderer {
  constructor() {
    // Stop sign colors and dimensions
    this.stopSign = {
      postColor: '#707080',
      signColor: '#cc0000',
      textColor: '#ffffff',
      size: 4.5, // Sign size (reduced by 25%)
      postHeight: 16,
      postWidth: 1.5
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
      postColor: '#707080',
      signColor: '#ff0000',
      innerColor: '#ffffff',
      textColor: '#ff0000',
      size: 7.5, // Reduced by 25% to match stop sign scaling
      postHeight: 16,
      postWidth: 1.5
    };
  }

  /**
   * Creates a realistic isometric stop sign
   */
  createStopSign(center, angle, roadWidth) {
    // Create unique IDs for this sign's gradients and filters
    const uniqueId = `stop-sign-${Math.random().toString(36).substr(2, 9)}`;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'stop-sign-group');
    
    // Create defs for gradients and filters specific to this sign
    const defs = this.createStopSignEffects(uniqueId);
    group.appendChild(defs);
    
    // Use approach angle to position sign on the correct side
    const approachAngle = angle + Math.PI;
    
    // Position the sign offset from the road edge
    const distance = roadWidth * 0.9; // Further increased distance from center
    const offsetAngle = approachAngle - Math.PI / 2; // 90 degree offset to position at side of road
    
    const signPos = {
      x: center.x + Math.cos(approachAngle) * distance + Math.cos(offsetAngle) * (roadWidth * 0.6),
      y: center.y + Math.sin(approachAngle) * distance + Math.sin(offsetAngle) * (roadWidth * 0.6)
    };
    
    // Create post with metallic effect
    const post = this.createMetallicPost(signPos, this.stopSign.postHeight, this.stopSign.postWidth, uniqueId);
    group.appendChild(post);
    
    // Create octagonal stop sign with effects
    const sign = this.createOctagonalSign(signPos, this.stopSign.size, uniqueId);
    group.appendChild(sign);
    
    // Add "STOP" text with shadow
    const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Text shadow
    const textShadow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textShadow.setAttribute('x', signPos.x + 0.2);
    textShadow.setAttribute('y', signPos.y - this.stopSign.postHeight + 1.2);
    textShadow.setAttribute('text-anchor', 'middle');
    textShadow.setAttribute('dominant-baseline', 'middle');
    textShadow.setAttribute('fill', '#000000');
    textShadow.setAttribute('opacity', '0.3');
    textShadow.setAttribute('font-family', 'Arial, sans-serif');
    textShadow.setAttribute('font-weight', 'bold');
    textShadow.setAttribute('font-size', '2.2');
    textShadow.textContent = 'STOP';
    textGroup.appendChild(textShadow);
    
    // Main text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', signPos.x);
    text.setAttribute('y', signPos.y - this.stopSign.postHeight + 1);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', this.stopSign.textColor);
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '2.2');
    text.setAttribute('letter-spacing', '0.05');
    text.textContent = 'STOP';
    textGroup.appendChild(text);
    
    group.appendChild(textGroup);
    
    // Add enhanced shadow with blur
    const shadow = this.createEnhancedSignShadow(signPos, this.stopSign.size, uniqueId);
    group.insertBefore(shadow, post);
    
    return group;
  }

  /**
   * Creates an octagonal stop sign shape with professional effects
   */
  createOctagonalSign(pos, size, uniqueId) {
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
    
    // Create the octagon with gradient
    const octagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const points = vertices.map(v => `${v.x},${v.y}`).join(' ');
    octagon.setAttribute('points', points);
    octagon.setAttribute('fill', `url(#${uniqueId}-gradient)`);
    octagon.setAttribute('stroke', '#8a0000');
    octagon.setAttribute('stroke-width', '0.3');
    octagon.setAttribute('filter', `url(#${uniqueId}-bevel)`);
    
    // Add retroreflective texture overlay
    const textureOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    textureOverlay.setAttribute('points', points);
    textureOverlay.setAttribute('fill', `url(#${uniqueId}-retroreflective)`);
    textureOverlay.setAttribute('opacity', '0.3');
    
    // Add white border with enhanced styling
    const border = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const borderVertices = [];
    for (let i = 0; i < 8; i++) {
      const angle = startAngle + i * angleStep;
      borderVertices.push({
        x: pos.x + Math.cos(angle) * (size - 0.7),
        y: pos.y - this.stopSign.postHeight + Math.sin(angle) * (size - 0.7)
      });
    }
    const borderPoints = borderVertices.map(v => `${v.x},${v.y}`).join(' ');
    border.setAttribute('points', borderPoints);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', '#ffffff');
    border.setAttribute('stroke-width', '0.6');
    border.setAttribute('stroke-linejoin', 'miter');
    border.setAttribute('opacity', '0.95');
    
    sign.appendChild(octagon);
    sign.appendChild(textureOverlay);
    sign.appendChild(border);
    
    return sign;
  }

  /**
   * Creates a realistic traffic light
   */
  createTrafficLight(center, angle, roadWidth, state = 'green') {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'traffic-light-group');
    
    // Use approach angle to position traffic light on the correct side
    const approachAngle = angle + Math.PI;
    
    // Position the traffic light
    const distance = roadWidth * 0.8;
    const offsetAngle = approachAngle - Math.PI / 6; // 30 degree offset
    
    const lightPos = {
      x: center.x + Math.cos(approachAngle) * distance + Math.cos(offsetAngle) * 10,
      y: center.y + Math.sin(approachAngle) * distance + Math.sin(offsetAngle) * 10
    };
    
    // Create pole
    const pole = this.createPost(lightPos, this.trafficLight.poleHeight, this.trafficLight.poleWidth, this.trafficLight.poleColor);
    group.appendChild(pole);
    
    // Create arm extending over the road
    const armLength = roadWidth * 0.6;
    const arm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    arm.setAttribute('x1', lightPos.x);
    arm.setAttribute('y1', lightPos.y - this.trafficLight.poleHeight);
    arm.setAttribute('x2', lightPos.x + Math.cos(angle) * armLength);
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
   * Creates a professional yield sign with enhanced visual effects
   */
  createYieldSign(center, angle, roadWidth) {
    // Create unique IDs for this sign's gradients and filters
    const uniqueId = `yield-sign-${Math.random().toString(36).substr(2, 9)}`;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'yield-sign-group');
    
    // Create defs for gradients and filters specific to this sign
    const defs = this.createYieldSignEffects(uniqueId);
    group.appendChild(defs);
    
    // Use approach angle to position sign on the correct side
    const approachAngle = angle + Math.PI;
    
    // Position the sign to match stop sign positioning
    const distance = roadWidth * 0.9;
    const offsetAngle = approachAngle - Math.PI / 2;
    
    const signPos = {
      x: center.x + Math.cos(approachAngle) * distance + Math.cos(offsetAngle) * (roadWidth * 0.6),
      y: center.y + Math.sin(approachAngle) * distance + Math.sin(offsetAngle) * (roadWidth * 0.6)
    };
    
    // Create post with metallic effect
    const post = this.createMetallicPost(signPos, this.yieldSign.postHeight, this.yieldSign.postWidth, uniqueId);
    group.appendChild(post);
    
    // Create triangular yield sign with gradient and effects
    const signY = signPos.y - this.yieldSign.postHeight;
    const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const size = this.yieldSign.size;
    const points = `${signPos.x},${signY - size * 0.6} ${signPos.x - size * 0.5},${signY + size * 0.4} ${signPos.x + size * 0.5},${signY + size * 0.4}`;
    triangle.setAttribute('points', points);
    triangle.setAttribute('fill', `url(#${uniqueId}-gradient)`);
    triangle.setAttribute('stroke', '#8a0000');
    triangle.setAttribute('stroke-width', '0.3');
    triangle.setAttribute('filter', `url(#${uniqueId}-bevel)`);
    group.appendChild(triangle);
    
    // Add retroreflective texture overlay
    const textureOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    textureOverlay.setAttribute('points', points);
    textureOverlay.setAttribute('fill', `url(#${uniqueId}-retroreflective)`);
    textureOverlay.setAttribute('opacity', '0.3');
    group.appendChild(textureOverlay);
    
    // Add inner white triangle with enhanced styling
    const innerTriangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    const innerSize = size * 0.85;
    const innerPoints = `${signPos.x},${signY - innerSize * 0.6} ${signPos.x - innerSize * 0.5},${signY + innerSize * 0.4} ${signPos.x + innerSize * 0.5},${signY + innerSize * 0.4}`;
    innerTriangle.setAttribute('points', innerPoints);
    innerTriangle.setAttribute('fill', this.yieldSign.innerColor);
    innerTriangle.setAttribute('opacity', '0.95');
    group.appendChild(innerTriangle);
    
    // Add "YIELD" text with shadow
    const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Text shadow
    const textShadow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textShadow.setAttribute('x', signPos.x + 0.2);
    textShadow.setAttribute('y', signY + 0.2);
    textShadow.setAttribute('text-anchor', 'middle');
    textShadow.setAttribute('dominant-baseline', 'middle');
    textShadow.setAttribute('fill', '#000000');
    textShadow.setAttribute('opacity', '0.3');
    textShadow.setAttribute('font-family', 'Arial, sans-serif');
    textShadow.setAttribute('font-weight', 'bold');
    textShadow.setAttribute('font-size', '3');
    textShadow.textContent = 'YIELD';
    textGroup.appendChild(textShadow);
    
    // Main text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', signPos.x);
    text.setAttribute('y', signY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', this.yieldSign.textColor);
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '3');
    text.setAttribute('letter-spacing', '0.05');
    text.textContent = 'YIELD';
    textGroup.appendChild(text);
    
    group.appendChild(textGroup);
    
    // Add enhanced shadow with blur
    const shadow = this.createEnhancedSignShadow(signPos, size * 0.8, uniqueId);
    group.insertBefore(shadow, post);
    
    return group;
  }

  /**
   * Creates yield sign-specific effects (gradients, filters, patterns)
   */
  createYieldSignEffects(uniqueId) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create radial gradient for the yield sign
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', `${uniqueId}-gradient`);
    gradient.setAttribute('cx', '50%');
    gradient.setAttribute('cy', '30%');
    gradient.setAttribute('r', '70%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ff1a1a');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#cc0000');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    
    // Create bevel filter for 3D effect
    const bevelFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    bevelFilter.setAttribute('id', `${uniqueId}-bevel`);
    
    const bevelBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    bevelBlur.setAttribute('in', 'SourceAlpha');
    bevelBlur.setAttribute('stdDeviation', '0.3');
    bevelBlur.setAttribute('result', 'blur');
    
    const bevelSpecular = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
    bevelSpecular.setAttribute('in', 'blur');
    bevelSpecular.setAttribute('surfaceScale', '3');
    bevelSpecular.setAttribute('specularConstant', '0.75');
    bevelSpecular.setAttribute('specularExponent', '20');
    bevelSpecular.setAttribute('lighting-color', '#white');
    bevelSpecular.setAttribute('result', 'specOut');
    
    const bevelLight = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
    bevelLight.setAttribute('x', '-50');
    bevelLight.setAttribute('y', '30');
    bevelLight.setAttribute('z', '100');
    bevelSpecular.appendChild(bevelLight);
    
    const bevelComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    bevelComposite.setAttribute('in', 'specOut');
    bevelComposite.setAttribute('in2', 'SourceAlpha');
    bevelComposite.setAttribute('operator', 'in');
    bevelComposite.setAttribute('result', 'specOut2');
    
    const bevelMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const bevelMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    bevelMergeNode1.setAttribute('in', 'SourceGraphic');
    const bevelMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    bevelMergeNode2.setAttribute('in', 'specOut2');
    bevelMerge.appendChild(bevelMergeNode1);
    bevelMerge.appendChild(bevelMergeNode2);
    
    bevelFilter.appendChild(bevelBlur);
    bevelFilter.appendChild(bevelSpecular);
    bevelFilter.appendChild(bevelComposite);
    bevelFilter.appendChild(bevelMerge);
    defs.appendChild(bevelFilter);
    
    // Create retroreflective pattern
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', `${uniqueId}-retroreflective`);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '2');
    pattern.setAttribute('height', '2');
    
    const patternCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    patternCircle.setAttribute('cx', '1');
    patternCircle.setAttribute('cy', '1');
    patternCircle.setAttribute('r', '0.5');
    patternCircle.setAttribute('fill', '#ffffff');
    patternCircle.setAttribute('opacity', '0.3');
    
    pattern.appendChild(patternCircle);
    defs.appendChild(pattern);
    
    // Create shadow filter
    const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    shadowFilter.setAttribute('id', `${uniqueId}-shadow`);
    shadowFilter.setAttribute('x', '-50%');
    shadowFilter.setAttribute('y', '-50%');
    shadowFilter.setAttribute('width', '200%');
    shadowFilter.setAttribute('height', '200%');
    
    const shadowBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    shadowBlur.setAttribute('in', 'SourceGraphic');
    shadowBlur.setAttribute('stdDeviation', '1');
    
    shadowFilter.appendChild(shadowBlur);
    defs.appendChild(shadowFilter);
    
    return defs;
  }

  /**
   * Creates stop sign-specific effects (gradients, filters, patterns)
   */
  createStopSignEffects(uniqueId) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Create radial gradient for the stop sign
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradient.setAttribute('id', `${uniqueId}-gradient`);
    gradient.setAttribute('cx', '40%');
    gradient.setAttribute('cy', '40%');
    gradient.setAttribute('r', '60%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ff0000');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#cc0000');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    
    // Create bevel filter for 3D effect
    const bevelFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    bevelFilter.setAttribute('id', `${uniqueId}-bevel`);
    
    const bevelBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    bevelBlur.setAttribute('in', 'SourceAlpha');
    bevelBlur.setAttribute('stdDeviation', '0.3');
    bevelBlur.setAttribute('result', 'blur');
    
    const bevelSpecular = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
    bevelSpecular.setAttribute('in', 'blur');
    bevelSpecular.setAttribute('surfaceScale', '3');
    bevelSpecular.setAttribute('specularConstant', '0.75');
    bevelSpecular.setAttribute('specularExponent', '20');
    bevelSpecular.setAttribute('lighting-color', '#white');
    bevelSpecular.setAttribute('result', 'specOut');
    
    const bevelLight = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
    bevelLight.setAttribute('x', '-50');
    bevelLight.setAttribute('y', '30');
    bevelLight.setAttribute('z', '100');
    bevelSpecular.appendChild(bevelLight);
    
    const bevelComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
    bevelComposite.setAttribute('in', 'specOut');
    bevelComposite.setAttribute('in2', 'SourceAlpha');
    bevelComposite.setAttribute('operator', 'in');
    bevelComposite.setAttribute('result', 'specOut2');
    
    const bevelMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const bevelMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    bevelMergeNode1.setAttribute('in', 'SourceGraphic');
    const bevelMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    bevelMergeNode2.setAttribute('in', 'specOut2');
    bevelMerge.appendChild(bevelMergeNode1);
    bevelMerge.appendChild(bevelMergeNode2);
    
    bevelFilter.appendChild(bevelBlur);
    bevelFilter.appendChild(bevelSpecular);
    bevelFilter.appendChild(bevelComposite);
    bevelFilter.appendChild(bevelMerge);
    defs.appendChild(bevelFilter);
    
    // Create retroreflective pattern
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', `${uniqueId}-retroreflective`);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    pattern.setAttribute('width', '2');
    pattern.setAttribute('height', '2');
    
    const patternCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    patternCircle.setAttribute('cx', '1');
    patternCircle.setAttribute('cy', '1');
    patternCircle.setAttribute('r', '0.5');
    patternCircle.setAttribute('fill', '#ffffff');
    patternCircle.setAttribute('opacity', '0.3');
    
    pattern.appendChild(patternCircle);
    defs.appendChild(pattern);
    
    // Create metallic gradient for post
    const metalGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    metalGradient.setAttribute('id', `${uniqueId}-metal`);
    metalGradient.setAttribute('x1', '0%');
    metalGradient.setAttribute('y1', '0%');
    metalGradient.setAttribute('x2', '100%');
    metalGradient.setAttribute('y2', '0%');
    
    const metalStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    metalStop1.setAttribute('offset', '0%');
    metalStop1.setAttribute('stop-color', '#606060');
    
    const metalStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    metalStop2.setAttribute('offset', '50%');
    metalStop2.setAttribute('stop-color', '#909090');
    
    const metalStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    metalStop3.setAttribute('offset', '100%');
    metalStop3.setAttribute('stop-color', '#606060');
    
    metalGradient.appendChild(metalStop1);
    metalGradient.appendChild(metalStop2);
    metalGradient.appendChild(metalStop3);
    defs.appendChild(metalGradient);
    
    // Create shadow filter
    const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    shadowFilter.setAttribute('id', `${uniqueId}-shadow`);
    shadowFilter.setAttribute('x', '-50%');
    shadowFilter.setAttribute('y', '-50%');
    shadowFilter.setAttribute('width', '200%');
    shadowFilter.setAttribute('height', '200%');
    
    const shadowBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    shadowBlur.setAttribute('in', 'SourceGraphic');
    shadowBlur.setAttribute('stdDeviation', '1');
    
    shadowFilter.appendChild(shadowBlur);
    defs.appendChild(shadowFilter);
    
    return defs;
  }

  /**
   * Creates a metallic post with gradient
   */
  createMetallicPost(pos, height, width, uniqueId) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Create main post with solid color as fallback
    const post = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    post.setAttribute('x1', pos.x);
    post.setAttribute('y1', pos.y);
    post.setAttribute('x2', pos.x);
    post.setAttribute('y2', pos.y - height);
    post.setAttribute('stroke', '#707080');
    post.setAttribute('stroke-width', width);
    post.setAttribute('stroke-linecap', 'round');
    post.setAttribute('class', 'sign-post');
    group.appendChild(post);
    
    // Add metallic highlight strip
    const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    highlight.setAttribute('x1', pos.x - width * 0.2);
    highlight.setAttribute('y1', pos.y);
    highlight.setAttribute('x2', pos.x - width * 0.2);
    highlight.setAttribute('y2', pos.y - height);
    highlight.setAttribute('stroke', '#a0a0a0');
    highlight.setAttribute('stroke-width', width * 0.3);
    highlight.setAttribute('stroke-linecap', 'round');
    highlight.setAttribute('opacity', '0.7');
    group.appendChild(highlight);
    
    return group;
  }

  /**
   * Creates an enhanced shadow with blur
   */
  createEnhancedSignShadow(pos, size, uniqueId) {
    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shadow.setAttribute('cx', pos.x + 3);
    shadow.setAttribute('cy', pos.y + 2);
    shadow.setAttribute('rx', size * 0.6);
    shadow.setAttribute('ry', size * 0.3);
    shadow.setAttribute('fill', '#000000');
    shadow.setAttribute('opacity', '0.15');
    shadow.setAttribute('filter', `url(#${uniqueId}-shadow)`);
    shadow.setAttribute('class', 'sign-shadow');
    return shadow;
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
    shadow.setAttribute('opacity', '0.1');
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
    shadow.setAttribute('opacity', '0.08');
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