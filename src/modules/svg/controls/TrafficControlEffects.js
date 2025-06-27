/**
 * TrafficControlEffects - Manages all SVG effects, gradients, and filters for traffic controls
 */
export class TrafficControlEffects {
    /**
     * Create stop sign effects (gradients, filters, patterns)
     */
    static createStopSignEffects(uniqueId) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create gradient for sign face
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `${uniqueId}-gradient`);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ff0000');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#cc0000');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        
        // Create bevel filter for depth
        const bevelFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        bevelFilter.setAttribute('id', `${uniqueId}-bevel`);
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '0.5');
        feGaussianBlur.setAttribute('result', 'blur');
        
        const feSpecularLighting = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
        feSpecularLighting.setAttribute('result', 'specOut');
        feSpecularLighting.setAttribute('in', 'blur');
        feSpecularLighting.setAttribute('specularConstant', '5');
        feSpecularLighting.setAttribute('specularExponent', '20');
        feSpecularLighting.setAttribute('lighting-color', 'white');
        
        const fePointLight = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
        fePointLight.setAttribute('x', '-50');
        fePointLight.setAttribute('y', '30');
        fePointLight.setAttribute('z', '200');
        
        feSpecularLighting.appendChild(fePointLight);
        
        const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite.setAttribute('in', 'specOut');
        feComposite.setAttribute('in2', 'SourceAlpha');
        feComposite.setAttribute('operator', 'in');
        feComposite.setAttribute('result', 'specOut');
        
        const feComposite2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite2.setAttribute('in', 'SourceGraphic');
        feComposite2.setAttribute('in2', 'specOut');
        feComposite2.setAttribute('operator', 'arithmetic');
        feComposite2.setAttribute('k1', '0');
        feComposite2.setAttribute('k2', '1');
        feComposite2.setAttribute('k3', '1');
        feComposite2.setAttribute('k4', '0');
        
        bevelFilter.appendChild(feGaussianBlur);
        bevelFilter.appendChild(feSpecularLighting);
        bevelFilter.appendChild(feComposite);
        bevelFilter.appendChild(feComposite2);
        defs.appendChild(bevelFilter);
        
        // Create retroreflective pattern for realistic sign appearance
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', `${uniqueId}-retroreflective`);
        pattern.setAttribute('x', '0');
        pattern.setAttribute('y', '0');
        pattern.setAttribute('width', '2');
        pattern.setAttribute('height', '2');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        const patternRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        patternRect.setAttribute('x', '0');
        patternRect.setAttribute('y', '0');
        patternRect.setAttribute('width', '2');
        patternRect.setAttribute('height', '2');
        patternRect.setAttribute('fill', 'white');
        patternRect.setAttribute('opacity', '0.1');
        
        const patternCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        patternCircle.setAttribute('cx', '1');
        patternCircle.setAttribute('cy', '1');
        patternCircle.setAttribute('r', '0.3');
        patternCircle.setAttribute('fill', 'white');
        patternCircle.setAttribute('opacity', '0.2');
        
        pattern.appendChild(patternRect);
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
        metalStop1.setAttribute('stop-color', '#808080');
        
        const metalStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop2.setAttribute('offset', '50%');
        metalStop2.setAttribute('stop-color', '#c0c0c0');
        
        const metalStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop3.setAttribute('offset', '100%');
        metalStop3.setAttribute('stop-color', '#808080');
        
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
        
        const feGaussianBlurShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlurShadow.setAttribute('in', 'SourceAlpha');
        feGaussianBlurShadow.setAttribute('stdDeviation', '2');
        
        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('dx', '2');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetblur');
        
        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', '0.4');
        feComponentTransfer.appendChild(feFuncA);
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        
        shadowFilter.appendChild(feGaussianBlurShadow);
        shadowFilter.appendChild(feOffset);
        shadowFilter.appendChild(feComponentTransfer);
        shadowFilter.appendChild(feMerge);
        defs.appendChild(shadowFilter);
        
        return defs;
    }
    
    /**
     * Create yield sign effects
     */
    static createYieldSignEffects(uniqueId) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create gradient for sign face
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', `${uniqueId}-gradient`);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#ff0000');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#dd0000');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        
        // Create bevel filter (similar to stop sign)
        const bevelFilter = this.createBevelFilter(`${uniqueId}-bevel`);
        defs.appendChild(bevelFilter);
        
        // Create retroreflective pattern
        const pattern = this.createRetroreflectivePattern(`${uniqueId}-retroreflective`);
        defs.appendChild(pattern);
        
        // Create shadow filter
        const shadowFilter = this.createShadowFilter(`${uniqueId}-shadow`);
        defs.appendChild(shadowFilter);
        
        return defs;
    }
    
    /**
     * Create traffic light effects
     */
    static createTrafficLightEffects(uniqueId) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Create housing gradient
        const housingGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        housingGradient.setAttribute('id', `${uniqueId}-housing-gradient`);
        housingGradient.setAttribute('x1', '0%');
        housingGradient.setAttribute('y1', '0%');
        housingGradient.setAttribute('x2', '100%');
        housingGradient.setAttribute('y2', '0%');
        
        const housingStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        housingStop1.setAttribute('offset', '0%');
        housingStop1.setAttribute('stop-color', '#0a0a0a');
        
        const housingStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        housingStop2.setAttribute('offset', '20%');
        housingStop2.setAttribute('stop-color', '#2a2a2a');
        
        const housingStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        housingStop3.setAttribute('offset', '80%');
        housingStop3.setAttribute('stop-color', '#2a2a2a');
        
        const housingStop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        housingStop4.setAttribute('offset', '100%');
        housingStop4.setAttribute('stop-color', '#0a0a0a');
        
        housingGradient.appendChild(housingStop1);
        housingGradient.appendChild(housingStop2);
        housingGradient.appendChild(housingStop3);
        housingGradient.appendChild(housingStop4);
        defs.appendChild(housingGradient);
        
        // Create metallic gradient for pole
        const metalGradient = this.createMetalGradient(`${uniqueId}-metal-gradient`);
        defs.appendChild(metalGradient);
        
        // Create glow filters for each light color
        const colors = {
            red: { color: '#ff0000', intensity: '3' },
            yellow: { color: '#ffaa00', intensity: '3' },
            green: { color: '#00ff00', intensity: '3' }
        };
        
        Object.entries(colors).forEach(([name, config]) => {
            const filter = this.createGlowFilter(`${uniqueId}-${name}-glow`, config.color, config.intensity);
            defs.appendChild(filter);
        });
        
        return defs;
    }
    
    /**
     * Create a reusable bevel filter
     */
    static createBevelFilter(id) {
        const bevelFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        bevelFilter.setAttribute('id', id);
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '0.5');
        feGaussianBlur.setAttribute('result', 'blur');
        
        const feSpecularLighting = document.createElementNS('http://www.w3.org/2000/svg', 'feSpecularLighting');
        feSpecularLighting.setAttribute('result', 'specOut');
        feSpecularLighting.setAttribute('in', 'blur');
        feSpecularLighting.setAttribute('specularConstant', '5');
        feSpecularLighting.setAttribute('specularExponent', '20');
        feSpecularLighting.setAttribute('lighting-color', 'white');
        
        const fePointLight = document.createElementNS('http://www.w3.org/2000/svg', 'fePointLight');
        fePointLight.setAttribute('x', '-50');
        fePointLight.setAttribute('y', '30');
        fePointLight.setAttribute('z', '200');
        
        feSpecularLighting.appendChild(fePointLight);
        
        const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite.setAttribute('in', 'specOut');
        feComposite.setAttribute('in2', 'SourceAlpha');
        feComposite.setAttribute('operator', 'in');
        feComposite.setAttribute('result', 'specOut');
        
        const feComposite2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite2.setAttribute('in', 'SourceGraphic');
        feComposite2.setAttribute('in2', 'specOut');
        feComposite2.setAttribute('operator', 'arithmetic');
        feComposite2.setAttribute('k1', '0');
        feComposite2.setAttribute('k2', '1');
        feComposite2.setAttribute('k3', '1');
        feComposite2.setAttribute('k4', '0');
        
        bevelFilter.appendChild(feGaussianBlur);
        bevelFilter.appendChild(feSpecularLighting);
        bevelFilter.appendChild(feComposite);
        bevelFilter.appendChild(feComposite2);
        
        return bevelFilter;
    }
    
    /**
     * Create retroreflective pattern
     */
    static createRetroreflectivePattern(id) {
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', id);
        pattern.setAttribute('x', '0');
        pattern.setAttribute('y', '0');
        pattern.setAttribute('width', '2');
        pattern.setAttribute('height', '2');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        
        const patternRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        patternRect.setAttribute('x', '0');
        patternRect.setAttribute('y', '0');
        patternRect.setAttribute('width', '2');
        patternRect.setAttribute('height', '2');
        patternRect.setAttribute('fill', 'white');
        patternRect.setAttribute('opacity', '0.1');
        
        const patternCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        patternCircle.setAttribute('cx', '1');
        patternCircle.setAttribute('cy', '1');
        patternCircle.setAttribute('r', '0.3');
        patternCircle.setAttribute('fill', 'white');
        patternCircle.setAttribute('opacity', '0.2');
        
        pattern.appendChild(patternRect);
        pattern.appendChild(patternCircle);
        
        return pattern;
    }
    
    /**
     * Create shadow filter
     */
    static createShadowFilter(id) {
        const shadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        shadowFilter.setAttribute('id', id);
        shadowFilter.setAttribute('x', '-50%');
        shadowFilter.setAttribute('y', '-50%');
        shadowFilter.setAttribute('width', '200%');
        shadowFilter.setAttribute('height', '200%');
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('in', 'SourceAlpha');
        feGaussianBlur.setAttribute('stdDeviation', '2');
        
        const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
        feOffset.setAttribute('dx', '2');
        feOffset.setAttribute('dy', '2');
        feOffset.setAttribute('result', 'offsetblur');
        
        const feComponentTransfer = document.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer');
        const feFuncA = document.createElementNS('http://www.w3.org/2000/svg', 'feFuncA');
        feFuncA.setAttribute('type', 'linear');
        feFuncA.setAttribute('slope', '0.4');
        feComponentTransfer.appendChild(feFuncA);
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        
        shadowFilter.appendChild(feGaussianBlur);
        shadowFilter.appendChild(feOffset);
        shadowFilter.appendChild(feComponentTransfer);
        shadowFilter.appendChild(feMerge);
        
        return shadowFilter;
    }
    
    /**
     * Create metal gradient
     */
    static createMetalGradient(id) {
        const metalGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        metalGradient.setAttribute('id', id);
        metalGradient.setAttribute('x1', '0%');
        metalGradient.setAttribute('y1', '0%');
        metalGradient.setAttribute('x2', '100%');
        metalGradient.setAttribute('y2', '0%');
        
        const metalStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop1.setAttribute('offset', '0%');
        metalStop1.setAttribute('stop-color', '#606060');
        
        const metalStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop2.setAttribute('offset', '20%');
        metalStop2.setAttribute('stop-color', '#808080');
        
        const metalStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop3.setAttribute('offset', '50%');
        metalStop3.setAttribute('stop-color', '#a0a0a0');
        
        const metalStop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop4.setAttribute('offset', '80%');
        metalStop4.setAttribute('stop-color', '#808080');
        
        const metalStop5 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        metalStop5.setAttribute('offset', '100%');
        metalStop5.setAttribute('stop-color', '#606060');
        
        metalGradient.appendChild(metalStop1);
        metalGradient.appendChild(metalStop2);
        metalGradient.appendChild(metalStop3);
        metalGradient.appendChild(metalStop4);
        metalGradient.appendChild(metalStop5);
        
        return metalGradient;
    }
    
    /**
     * Create glow filter for traffic lights
     */
    static createGlowFilter(id, color, intensity = '2') {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', id);
        filter.setAttribute('x', '-100%');
        filter.setAttribute('y', '-100%');
        filter.setAttribute('width', '300%');
        filter.setAttribute('height', '300%');
        
        // Inner glow
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', intensity);
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        
        // Outer glow
        const feGaussianBlur2 = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur2.setAttribute('stdDeviation', (parseFloat(intensity) * 2).toString());
        feGaussianBlur2.setAttribute('result', 'coloredBlur2');
        
        const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
        feFlood.setAttribute('flood-color', color);
        feFlood.setAttribute('flood-opacity', '1');
        feFlood.setAttribute('result', 'glowColor');
        
        const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite.setAttribute('in', 'glowColor');
        feComposite.setAttribute('in2', 'coloredBlur');
        feComposite.setAttribute('operator', 'in');
        feComposite.setAttribute('result', 'softGlow');
        
        const feComposite2 = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
        feComposite2.setAttribute('in', 'glowColor');
        feComposite2.setAttribute('in2', 'coloredBlur2');
        feComposite2.setAttribute('operator', 'in');
        feComposite2.setAttribute('result', 'softGlow2');
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'softGlow2');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'softGlow');
        const feMergeNode3 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode3.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        feMerge.appendChild(feMergeNode3);
        
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feGaussianBlur2);
        filter.appendChild(feFlood);
        filter.appendChild(feComposite);
        filter.appendChild(feComposite2);
        filter.appendChild(feMerge);
        
        return filter;
    }
}