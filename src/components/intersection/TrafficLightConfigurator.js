import { IntersectionDiagramRenderer } from './IntersectionDiagramRenderer.js';

/**
 * TrafficLightConfigurator - Manages traffic light timing configuration
 */
export class TrafficLightConfigurator {
    constructor() {
        this.diagramRenderer = new IntersectionDiagramRenderer();
        this.timing = {
            greenTime: 25,
            yellowTime: 3,
            redTime: 28,
            totalCycleTime: 56
        };
        this.onChangeCallback = null;
    }
    
    /**
     * Create the traffic light configuration UI
     */
    createUI(initialTiming = {}) {
        // Merge with defaults
        this.timing = { ...this.timing, ...initialTiming };
        
        const container = document.createElement('div');
        container.className = 'property-group';
        container.id = 'traffic-light-config';
        
        const label = document.createElement('label');
        label.textContent = 'Traffic Light Timing';
        container.appendChild(label);
        
        // Timing diagram
        const diagramContainer = document.createElement('div');
        diagramContainer.className = 'timing-diagram';
        diagramContainer.style.cssText = 'margin-bottom: 1rem;';
        const diagram = this.diagramRenderer.createTrafficLightDiagram();
        diagramContainer.appendChild(diagram);
        container.appendChild(diagramContainer);
        
        // Timing inputs
        const timingInputs = this.createTimingInputs();
        container.appendChild(timingInputs);
        
        // Preset buttons
        const presets = this.createPresetButtons();
        container.appendChild(presets);
        
        return container;
    }
    
    /**
     * Create timing input controls
     */
    createTimingInputs() {
        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'timing-inputs';
        inputsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';
        
        // Green time
        const greenControl = this.createTimingControl('Green Time', 'greenTime', 5, 60, this.timing.greenTime);
        inputsContainer.appendChild(greenControl);
        
        // Yellow time
        const yellowControl = this.createTimingControl('Yellow Time', 'yellowTime', 3, 6, this.timing.yellowTime);
        inputsContainer.appendChild(yellowControl);
        
        // Red time (read-only, calculated)
        const redControl = this.createTimingControl('Red Time', 'redTime', 0, 100, this.timing.redTime, true);
        inputsContainer.appendChild(redControl);
        
        // Total cycle time
        const cycleControl = this.createTimingControl('Total Cycle', 'totalCycleTime', 30, 120, this.timing.totalCycleTime);
        inputsContainer.appendChild(cycleControl);
        
        // Add update listeners
        this.attachUpdateListeners(inputsContainer);
        
        return inputsContainer;
    }
    
    /**
     * Create individual timing control
     */
    createTimingControl(label, id, min, max, value, readOnly = false) {
        const control = document.createElement('div');
        control.className = 'timing-control';
        control.style.cssText = 'display: flex; align-items: center; gap: 0.75rem;';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.cssText = 'flex: 1; font-size: 0.875rem; color: #a0a0b8;';
        control.appendChild(labelEl);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.min = min;
        input.max = max;
        input.value = value;
        input.readOnly = readOnly;
        input.style.cssText = `
            width: 60px;
            padding: 0.375rem;
            background: ${readOnly ? '#1a1a23' : '#2a2a3a'};
            border: 1px solid #3a3a4a;
            color: #e8e8ec;
            border-radius: 4px;
            text-align: center;
            font-size: 0.875rem;
        `;
        control.appendChild(input);
        
        const unit = document.createElement('span');
        unit.textContent = 's';
        unit.style.cssText = 'color: #6a6a7a; font-size: 0.875rem;';
        control.appendChild(unit);
        
        return control;
    }
    
    /**
     * Create preset timing buttons
     */
    createPresetButtons() {
        const presetsContainer = document.createElement('div');
        presetsContainer.className = 'timing-presets';
        presetsContainer.style.cssText = `
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #3a3a4a;
        `;
        
        const presetsLabel = document.createElement('label');
        presetsLabel.textContent = 'Presets';
        presetsLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-size: 0.875rem;';
        presetsContainer.appendChild(presetsLabel);
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = 'display: flex; gap: 0.5rem;';
        
        const presets = [
            { name: 'Low Traffic', green: 30, yellow: 3, total: 45 },
            { name: 'Standard', green: 25, yellow: 3, total: 56 },
            { name: 'High Traffic', green: 40, yellow: 4, total: 88 }
        ];
        
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.textContent = preset.name;
            btn.style.cssText = `
                flex: 1;
                padding: 0.375rem;
                background: #2a2a3a;
                border: 1px solid #3a3a4a;
                color: #a0a0b8;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.75rem;
                transition: all 0.2s ease;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = '#3a3a4a';
                btn.style.color = '#e8e8ec';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.background = '#2a2a3a';
                btn.style.color = '#a0a0b8';
            });
            
            btn.addEventListener('click', () => {
                this.applyPreset(preset);
            });
            
            buttonsDiv.appendChild(btn);
        });
        
        presetsContainer.appendChild(buttonsDiv);
        return presetsContainer;
    }
    
    /**
     * Attach update listeners to inputs
     */
    attachUpdateListeners(container) {
        const greenInput = container.querySelector('#greenTime');
        const yellowInput = container.querySelector('#yellowTime');
        const redInput = container.querySelector('#redTime');
        const totalInput = container.querySelector('#totalCycleTime');
        
        const updateCycleTime = () => {
            const green = parseInt(greenInput.value) || 0;
            const yellow = parseInt(yellowInput.value) || 0;
            const red = parseInt(redInput.value) || 0;
            const total = parseInt(totalInput.value) || 0;
            
            // Calculate red time
            const calculatedRed = total - green - yellow;
            if (calculatedRed > 0) {
                redInput.value = calculatedRed;
                this.timing = {
                    greenTime: green,
                    yellowTime: yellow,
                    redTime: calculatedRed,
                    totalCycleTime: total
                };
                
                if (this.onChangeCallback) {
                    this.onChangeCallback(this.timing);
                }
            }
        };
        
        greenInput.addEventListener('input', updateCycleTime);
        yellowInput.addEventListener('input', updateCycleTime);
        totalInput.addEventListener('input', updateCycleTime);
    }
    
    /**
     * Apply preset timing
     */
    applyPreset(preset) {
        const greenInput = document.querySelector('#greenTime');
        const yellowInput = document.querySelector('#yellowTime');
        const totalInput = document.querySelector('#totalCycleTime');
        
        if (greenInput && yellowInput && totalInput) {
            greenInput.value = preset.green;
            yellowInput.value = preset.yellow;
            totalInput.value = preset.total;
            
            // Trigger update
            greenInput.dispatchEvent(new Event('input'));
        }
    }
    
    /**
     * Set change callback
     */
    onChange(callback) {
        this.onChangeCallback = callback;
    }
    
    /**
     * Get current timing
     */
    getTiming() {
        return { ...this.timing };
    }
    
    /**
     * Set timing
     */
    setTiming(timing) {
        this.timing = { ...this.timing, ...timing };
        // Update UI if it exists
        const greenInput = document.querySelector('#greenTime');
        const yellowInput = document.querySelector('#yellowTime');
        const totalInput = document.querySelector('#totalCycleTime');
        
        if (greenInput && yellowInput && totalInput) {
            greenInput.value = this.timing.greenTime;
            yellowInput.value = this.timing.yellowTime;
            totalInput.value = this.timing.totalCycleTime;
            greenInput.dispatchEvent(new Event('input'));
        }
    }
}