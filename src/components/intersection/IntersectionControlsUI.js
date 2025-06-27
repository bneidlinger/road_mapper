/**
 * IntersectionControlsUI - Manages control type buttons and basic UI elements
 */
export class IntersectionControlsUI {
    constructor() {
        this.activeControlType = 'stop_sign';
        this.onControlTypeChange = null;
    }
    
    /**
     * Create the control type selection UI
     */
    createControlTypeUI() {
        const container = document.createElement('div');
        container.className = 'property-group';
        
        const label = document.createElement('label');
        label.textContent = 'Control Type';
        container.appendChild(label);
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'control-type-buttons';
        buttonsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
            margin-top: 0.5rem;
        `;
        
        const controlTypes = [
            {
                type: 'none',
                title: 'No control',
                icon: this.createNoControlIcon()
            },
            {
                type: 'stop_sign',
                title: 'Stop sign',
                icon: this.createStopSignIcon()
            },
            {
                type: 'traffic_light',
                title: 'Traffic light',
                icon: this.createTrafficLightIcon()
            },
            {
                type: 'yield',
                title: 'Yield sign',
                icon: this.createYieldSignIcon()
            }
        ];
        
        controlTypes.forEach(control => {
            const button = this.createControlButton(control);
            buttonsContainer.appendChild(button);
        });
        
        container.appendChild(buttonsContainer);
        return container;
    }
    
    /**
     * Create individual control button
     */
    createControlButton(control) {
        const button = document.createElement('button');
        button.className = 'control-type-btn';
        button.setAttribute('data-type', control.type);
        button.setAttribute('title', control.title);
        
        if (control.type === this.activeControlType) {
            button.classList.add('active');
        }
        
        button.style.cssText = `
            padding: 0.75rem;
            background: ${control.type === this.activeControlType ? '#3a3a4a' : '#2a2a3a'};
            border: 1px solid ${control.type === this.activeControlType ? '#00ff88' : '#3a3a4a'};
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        button.appendChild(control.icon);
        
        // Add hover effects
        button.addEventListener('mouseenter', () => {
            if (!button.classList.contains('active')) {
                button.style.background = '#3a3a4a';
                button.style.borderColor = '#4a4a5a';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                button.style.background = '#2a2a3a';
                button.style.borderColor = '#3a3a4a';
            }
        });
        
        // Add click handler
        button.addEventListener('click', () => {
            this.setActiveControlType(control.type);
        });
        
        return button;
    }
    
    /**
     * Create panel header
     */
    createPanelHeader() {
        const header = document.createElement('div');
        header.className = 'properties-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #2a2a3a;
        `;
        
        const title = document.createElement('h3');
        title.style.cssText = 'margin: 0; font-size: 1rem; font-weight: 500;';
        title.textContent = 'Intersection Properties';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.id = 'close-properties';
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #a0a0b8;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
        `;
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#e8e8ec';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = '#a0a0b8';
        });
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        return header;
    }
    
    /**
     * Create action buttons (Apply/Cancel)
     */
    createActionButtons() {
        const container = document.createElement('div');
        container.className = 'property-actions';
        container.style.cssText = `
            display: flex;
            gap: 0.75rem;
            padding: 1.25rem;
            border-top: 1px solid #2a2a3a;
        `;
        
        const applyBtn = document.createElement('button');
        applyBtn.className = 'apply-btn';
        applyBtn.textContent = 'Apply Changes';
        applyBtn.style.cssText = `
            flex: 1;
            padding: 0.625rem 1rem;
            background: #00ff88;
            color: #0a0a0f;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = `
            flex: 1;
            padding: 0.625rem 1rem;
            background: transparent;
            color: #a0a0b8;
            border: 1px solid #3a3a4a;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        // Add hover effects
        applyBtn.addEventListener('mouseenter', () => {
            applyBtn.style.background = '#00dd77';
        });
        
        applyBtn.addEventListener('mouseleave', () => {
            applyBtn.style.background = '#00ff88';
        });
        
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#2a2a3a';
            cancelBtn.style.color = '#e8e8ec';
        });
        
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'transparent';
            cancelBtn.style.color = '#a0a0b8';
        });
        
        container.appendChild(applyBtn);
        container.appendChild(cancelBtn);
        
        return container;
    }
    
    /**
     * Set active control type
     */
    setActiveControlType(type) {
        this.activeControlType = type;
        
        // Update button states
        const buttons = document.querySelectorAll('.control-type-btn');
        buttons.forEach(btn => {
            const btnType = btn.getAttribute('data-type');
            if (btnType === type) {
                btn.classList.add('active');
                btn.style.background = '#3a3a4a';
                btn.style.borderColor = '#00ff88';
            } else {
                btn.classList.remove('active');
                btn.style.background = '#2a2a3a';
                btn.style.borderColor = '#3a3a4a';
            }
        });
        
        if (this.onControlTypeChange) {
            this.onControlTypeChange(type);
        }
    }
    
    /**
     * Create SVG icons
     */
    createNoControlIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '4.93');
        line.setAttribute('y1', '4.93');
        line.setAttribute('x2', '19.07');
        line.setAttribute('y2', '19.07');
        
        svg.appendChild(circle);
        svg.appendChild(line);
        
        return svg;
    }
    
    createStopSignIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '12');
        text.setAttribute('y', '16');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '10');
        text.setAttribute('fill', 'currentColor');
        text.textContent = 'STOP';
        
        svg.appendChild(polygon);
        svg.appendChild(text);
        
        return svg;
    }
    
    createTrafficLightIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '8');
        rect.setAttribute('y', '2');
        rect.setAttribute('width', '8');
        rect.setAttribute('height', '20');
        rect.setAttribute('rx', '1');
        
        const lights = [
            { cy: '7', fill: '#ff4444' },
            { cy: '12', fill: '#ffaa00' },
            { cy: '17', fill: '#44ff44' }
        ];
        
        svg.appendChild(rect);
        
        lights.forEach(light => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '12');
            circle.setAttribute('cy', light.cy);
            circle.setAttribute('r', '2');
            circle.setAttribute('fill', light.fill);
            svg.appendChild(circle);
        });
        
        return svg;
    }
    
    createYieldSignIcon() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '12,4 22,20 2,20');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '12');
        text.setAttribute('y', '17');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '8');
        text.setAttribute('fill', 'currentColor');
        text.textContent = 'YIELD';
        
        svg.appendChild(polygon);
        svg.appendChild(text);
        
        return svg;
    }
}