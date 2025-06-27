import { TrafficControlEffects } from './TrafficControlEffects.js';

/**
 * TrafficSignRenderer - Renders stop signs, yield signs, and other traffic signs
 */
export class TrafficSignRenderer {
    constructor() {
        // Stop sign configuration
        this.stopSign = {
            postColor: '#707080',
            signColor: '#cc0000',
            textColor: '#ffffff',
            size: 4.5, // Sign size (reduced by 25%)
            postHeight: 16,
            postWidth: 1.5
        };
        
        // Yield sign configuration
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
     * Create a realistic stop sign
     */
    createStopSign(center, angle, roadWidth) {
        // Create unique ID for this sign's gradients and filters
        const uniqueId = `stop-sign-${Math.random().toString(36).substr(2, 9)}`;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'stop-sign-group');
        
        // Create defs for gradients and filters specific to this sign
        const defs = TrafficControlEffects.createStopSignEffects(uniqueId);
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
        const textGroup = this.createStopSignText(signPos, uniqueId);
        group.appendChild(textGroup);
        
        // Add enhanced shadow
        const shadow = this.createEnhancedSignShadow(signPos, this.stopSign.size);
        group.insertBefore(shadow, post);
        
        return group;
    }
    
    /**
     * Create octagonal stop sign shape
     */
    createOctagonalSign(pos, size, uniqueId) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Create octagon vertices
        const vertices = [];
        const angleStep = Math.PI / 4; // 45 degrees
        for (let i = 0; i < 8; i++) {
            const angle = i * angleStep - Math.PI / 8; // Rotate to have flat top
            vertices.push({
                x: pos.x + Math.cos(angle) * size,
                y: pos.y - this.stopSign.postHeight + Math.sin(angle) * size
            });
        }
        
        // Main octagon
        const octagon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = vertices.map(v => `${v.x},${v.y}`).join(' ');
        octagon.setAttribute('points', points);
        octagon.setAttribute('fill', `url(#${uniqueId}-gradient)`);
        octagon.setAttribute('stroke', '#ffffff');
        octagon.setAttribute('stroke-width', '0.8');
        octagon.setAttribute('filter', `url(#${uniqueId}-bevel)`);
        
        // Add retroreflective texture overlay
        const textureOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        textureOverlay.setAttribute('points', points);
        textureOverlay.setAttribute('fill', `url(#${uniqueId}-retroreflective)`);
        textureOverlay.setAttribute('opacity', '0.5');
        
        // White border (inner)
        const borderVertices = [];
        for (let i = 0; i < 8; i++) {
            const angle = i * angleStep - Math.PI / 8;
            borderVertices.push({
                x: pos.x + Math.cos(angle) * (size * 0.85),
                y: pos.y - this.stopSign.postHeight + Math.sin(angle) * (size * 0.85)
            });
        }
        const borderPoints = borderVertices.map(v => `${v.x},${v.y}`).join(' ');
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        border.setAttribute('points', borderPoints);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', '#ffffff');
        border.setAttribute('stroke-width', '0.5');
        border.setAttribute('opacity', '0.9');
        
        group.appendChild(octagon);
        group.appendChild(textureOverlay);
        group.appendChild(border);
        
        return group;
    }
    
    /**
     * Create STOP text for stop sign
     */
    createStopSignText(signPos, uniqueId) {
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
        text.textContent = 'STOP';
        textGroup.appendChild(text);
        
        return textGroup;
    }
    
    /**
     * Create a realistic yield sign
     */
    createYieldSign(center, angle, roadWidth) {
        // Create unique ID for this sign's gradients and filters
        const uniqueId = `yield-sign-${Math.random().toString(36).substr(2, 9)}`;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'yield-sign-group');
        
        // Create defs for gradients and filters
        const defs = TrafficControlEffects.createYieldSignEffects(uniqueId);
        group.appendChild(defs);
        
        // Use approach angle to position sign on the correct side
        const approachAngle = angle + Math.PI;
        
        // Position the sign offset from the road edge
        const distance = roadWidth * 0.9;
        const offsetAngle = approachAngle - Math.PI / 2;
        
        const signPos = {
            x: center.x + Math.cos(approachAngle) * distance + Math.cos(offsetAngle) * (roadWidth * 0.6),
            y: center.y + Math.sin(approachAngle) * distance + Math.sin(offsetAngle) * (roadWidth * 0.6)
        };
        
        // Create post
        const post = this.createMetallicPost(signPos, this.yieldSign.postHeight, this.yieldSign.postWidth, uniqueId);
        group.appendChild(post);
        
        // Create triangular yield sign
        const sign = this.createTriangularSign(signPos, this.yieldSign.size, uniqueId);
        group.appendChild(sign);
        
        // Add "YIELD" text
        const textGroup = this.createYieldSignText(signPos, uniqueId);
        group.appendChild(textGroup);
        
        // Add shadow
        const shadow = this.createEnhancedSignShadow(signPos, this.yieldSign.size);
        group.insertBefore(shadow, post);
        
        return group;
    }
    
    /**
     * Create triangular yield sign shape
     */
    createTriangularSign(pos, size, uniqueId) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const signY = pos.y - this.yieldSign.postHeight;
        
        // Main triangle (pointing down)
        const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = `${pos.x},${signY - size * 0.6} ${pos.x - size * 0.5},${signY + size * 0.4} ${pos.x + size * 0.5},${signY + size * 0.4}`;
        triangle.setAttribute('points', points);
        triangle.setAttribute('fill', `url(#${uniqueId}-gradient)`);
        triangle.setAttribute('stroke', '#ffffff');
        triangle.setAttribute('stroke-width', '0.8');
        triangle.setAttribute('filter', `url(#${uniqueId}-bevel)`);
        
        // Add retroreflective texture
        const textureOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        textureOverlay.setAttribute('points', points);
        textureOverlay.setAttribute('fill', `url(#${uniqueId}-retroreflective)`);
        textureOverlay.setAttribute('opacity', '0.5');
        
        // White inner triangle
        const innerSize = size * 0.8;
        const innerPoints = `${pos.x},${signY - innerSize * 0.6} ${pos.x - innerSize * 0.5},${signY + innerSize * 0.4} ${pos.x + innerSize * 0.5},${signY + innerSize * 0.4}`;
        const innerTriangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        innerTriangle.setAttribute('points', innerPoints);
        innerTriangle.setAttribute('fill', this.yieldSign.innerColor);
        innerTriangle.setAttribute('stroke', 'none');
        
        group.appendChild(triangle);
        group.appendChild(textureOverlay);
        group.appendChild(innerTriangle);
        
        return group;
    }
    
    /**
     * Create YIELD text for yield sign
     */
    createYieldSignText(signPos, uniqueId) {
        const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const textY = signPos.y - this.yieldSign.postHeight;
        
        // Text shadow
        const textShadow = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textShadow.setAttribute('x', signPos.x + 0.15);
        textShadow.setAttribute('y', textY + 0.15);
        textShadow.setAttribute('text-anchor', 'middle');
        textShadow.setAttribute('dominant-baseline', 'middle');
        textShadow.setAttribute('fill', '#000000');
        textShadow.setAttribute('opacity', '0.3');
        textShadow.setAttribute('font-family', 'Arial, sans-serif');
        textShadow.setAttribute('font-weight', 'bold');
        textShadow.setAttribute('font-size', '2.8');
        textShadow.textContent = 'YIELD';
        textGroup.appendChild(textShadow);
        
        // Main text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', signPos.x);
        text.setAttribute('y', textY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', this.yieldSign.textColor);
        text.setAttribute('font-family', 'Arial, sans-serif');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('font-size', '2.8');
        text.textContent = 'YIELD';
        textGroup.appendChild(text);
        
        return textGroup;
    }
    
    /**
     * Create metallic post for signs
     */
    createMetallicPost(pos, height, width, uniqueId) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Main post
        const post = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        post.setAttribute('x', pos.x - width / 2);
        post.setAttribute('y', pos.y - height);
        post.setAttribute('width', width);
        post.setAttribute('height', height);
        post.setAttribute('fill', `url(#${uniqueId}-metal)`);
        post.setAttribute('stroke', '#505050');
        post.setAttribute('stroke-width', '0.2');
        
        // Post cap
        const cap = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        cap.setAttribute('x', pos.x - width / 2 - 0.2);
        cap.setAttribute('y', pos.y - height - 0.5);
        cap.setAttribute('width', width + 0.4);
        cap.setAttribute('height', 1);
        cap.setAttribute('fill', '#606060');
        cap.setAttribute('rx', '0.2');
        
        // Base plate
        const base = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        base.setAttribute('cx', pos.x);
        base.setAttribute('cy', pos.y);
        base.setAttribute('rx', width);
        base.setAttribute('ry', width * 0.5);
        base.setAttribute('fill', '#505050');
        base.setAttribute('opacity', '0.8');
        
        group.appendChild(base);
        group.appendChild(post);
        group.appendChild(cap);
        
        return group;
    }
    
    /**
     * Create enhanced shadow for signs
     */
    createEnhancedSignShadow(pos, size) {
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        shadow.setAttribute('cx', pos.x + 2);
        shadow.setAttribute('cy', pos.y + 1);
        shadow.setAttribute('rx', size * 0.8);
        shadow.setAttribute('ry', size * 0.4);
        shadow.setAttribute('fill', '#000000');
        shadow.setAttribute('opacity', '0.2');
        shadow.setAttribute('filter', 'blur(2px)');
        
        return shadow;
    }
}