import { EventEmitter } from '../core/EventEmitter.js';
import { BUILDING_TYPES, DEBUG } from '../core/constants.js';

export class BuildingPropertiesPanel extends EventEmitter {
    constructor() {
        super();
        this.element = null;
        this.currentBuilding = null;
        this.createPanel();
    }

    createPanel() {
        this.element = document.createElement('div');
        this.element.className = 'properties-panel building-properties';
        this.element.innerHTML = `
            <div class="properties-header">
                <h3>Building Properties</h3>
                <button class="close-btn" title="Close">×</button>
            </div>
            <div class="properties-content">
                <div class="property-group">
                    <label>Building ID</label>
                    <input type="text" class="building-id" readonly>
                </div>
                
                <div class="property-group">
                    <label>Type</label>
                    <select class="building-type">
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="office">Office</option>
                    </select>
                </div>
                
                <div class="property-group">
                    <label>Floors</label>
                    <input type="number" class="building-floors" min="1" max="50" value="1">
                </div>
                
                <div class="property-group">
                    <label>Roof Type</label>
                    <select class="building-roof-type">
                        <option value="flat">Flat</option>
                        <option value="gabled">Gabled</option>
                        <option value="hipped">Hipped</option>
                        <option value="shed">Shed</option>
                        <option value="mansard">Mansard</option>
                    </select>
                </div>
                
                <div class="property-group">
                    <label>Rotation</label>
                    <div class="input-group">
                        <input type="range" class="building-rotation" min="-180" max="180" value="0" step="5">
                        <span class="rotation-value">0°</span>
                    </div>
                </div>
                
                <!-- Type-specific properties -->
                <div class="type-specific-properties">
                    <!-- Residential properties -->
                    <div class="residential-properties property-section" style="display: none;">
                        <h4>Residential Options</h4>
                        <div class="property-group">
                            <label>Style</label>
                            <select class="residential-style">
                                <option value="single-family">Single Family</option>
                                <option value="townhouse">Townhouse</option>
                                <option value="apartment">Apartment</option>
                                <option value="condo">Condominium</option>
                            </select>
                        </div>
                        <div class="property-group">
                            <label>Units</label>
                            <input type="number" class="residential-units" min="1" max="200" value="1">
                        </div>
                    </div>
                    
                    <!-- Commercial properties -->
                    <div class="commercial-properties property-section" style="display: none;">
                        <h4>Commercial Options</h4>
                        <div class="property-group">
                            <label>Business Type</label>
                            <select class="commercial-business">
                                <option value="retail">Retail Store</option>
                                <option value="restaurant">Restaurant</option>
                                <option value="grocery">Grocery Store</option>
                                <option value="bank">Bank</option>
                                <option value="hotel">Hotel</option>
                            </select>
                        </div>
                        <div class="property-group">
                            <label>Parking Spaces</label>
                            <input type="number" class="commercial-parking" min="0" max="500" value="10">
                        </div>
                    </div>
                    
                    <!-- Industrial properties -->
                    <div class="industrial-properties property-section" style="display: none;">
                        <h4>Industrial Options</h4>
                        <div class="property-group">
                            <label>Facility Type</label>
                            <select class="industrial-facility">
                                <option value="warehouse">Warehouse</option>
                                <option value="factory">Factory</option>
                                <option value="distribution">Distribution Center</option>
                                <option value="storage">Storage Facility</option>
                            </select>
                        </div>
                        <div class="property-group">
                            <label>Loading Docks</label>
                            <input type="number" class="industrial-docks" min="0" max="20" value="2">
                        </div>
                    </div>
                    
                    <!-- Office properties -->
                    <div class="office-properties property-section" style="display: none;">
                        <h4>Office Options</h4>
                        <div class="property-group">
                            <label>Office Type</label>
                            <select class="office-type">
                                <option value="corporate">Corporate HQ</option>
                                <option value="professional">Professional Building</option>
                                <option value="medical">Medical Office</option>
                                <option value="tech">Tech Campus</option>
                            </select>
                        </div>
                        <div class="property-group">
                            <label>Occupancy</label>
                            <input type="number" class="office-occupancy" min="10" max="5000" value="100" step="10">
                        </div>
                    </div>
                </div>
                
                <div class="property-group">
                    <label>Color Override</label>
                    <div class="input-group">
                        <input type="checkbox" class="use-custom-color" id="use-custom-color">
                        <label for="use-custom-color">Use custom color</label>
                    </div>
                    <input type="color" class="building-color" disabled>
                </div>
                
                <div class="properties-actions">
                    <button class="apply-btn">Apply Changes</button>
                    <button class="delete-btn">Delete Building</button>
                </div>
            </div>
        `;

        this.element.style.display = 'none';
        this.attachEventListeners();
    }

    attachEventListeners() {
        const closeBtn = this.element.querySelector('.close-btn');
        const applyBtn = this.element.querySelector('.apply-btn');
        const deleteBtn = this.element.querySelector('.delete-btn');
        const typeSelect = this.element.querySelector('.building-type');
        const rotationSlider = this.element.querySelector('.building-rotation');
        const rotationValue = this.element.querySelector('.rotation-value');
        const useCustomColor = this.element.querySelector('.use-custom-color');
        const colorInput = this.element.querySelector('.building-color');

        closeBtn.addEventListener('click', () => this.hide());
        
        applyBtn.addEventListener('click', () => this.applyChanges());
        
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this building?')) {
                this.emit('delete-building', this.currentBuilding);
                this.hide();
            }
        });

        typeSelect.addEventListener('change', (e) => {
            this.showTypeSpecificProperties(e.target.value);
        });

        rotationSlider.addEventListener('input', (e) => {
            rotationValue.textContent = `${e.target.value}°`;
        });

        useCustomColor.addEventListener('change', (e) => {
            colorInput.disabled = !e.target.checked;
        });
    }

    showTypeSpecificProperties(type) {
        // Hide all type-specific sections
        const sections = this.element.querySelectorAll('.property-section');
        sections.forEach(section => section.style.display = 'none');

        // Show the relevant section
        const sectionClass = `.${type}-properties`;
        const section = this.element.querySelector(sectionClass);
        if (section) {
            section.style.display = 'block';
        }
    }

    show(building) {
        if (DEBUG) console.log('BuildingPropertiesPanel.show called with:', building);
        if (!building) return;
        
        this.currentBuilding = building;
        this.element.style.display = 'block';
        // Add debug styles temporarily
        this.element.style.backgroundColor = '#333';
        this.element.style.border = '2px solid red';
        this.element.style.zIndex = '999999';
        this.element.style.position = 'fixed';
        this.element.style.top = '100px';
        this.element.style.right = '20px';
        if (DEBUG) console.log('BuildingPropertiesPanel display set to block');
        if (DEBUG) console.log('Panel element:', this.element);
        if (DEBUG) console.log('Panel parent:', this.element.parentElement);
        if (DEBUG) console.log('Panel computed style:', window.getComputedStyle(this.element).display);
        if (DEBUG) console.log('Panel offsetWidth:', this.element.offsetWidth);
        if (DEBUG) console.log('Panel offsetHeight:', this.element.offsetHeight);

        // Update UI with building data
        this.element.querySelector('.building-id').value = building.id;
        this.element.querySelector('.building-type').value = building.type;
        this.element.querySelector('.building-floors').value = building.floors || 1;
        this.element.querySelector('.building-roof-type').value = building.roofType || 'flat';
        this.element.querySelector('.building-rotation').value = building.rotation || 0;
        this.element.querySelector('.rotation-value').textContent = `${building.rotation || 0}°`;

        // Show type-specific properties
        this.showTypeSpecificProperties(building.type);

        // Update type-specific values if they exist
        if (building.properties) {
            this.updateTypeSpecificValues(building.type, building.properties);
        }

        // Handle custom color
        if (building.customColor) {
            this.element.querySelector('.use-custom-color').checked = true;
            this.element.querySelector('.building-color').disabled = false;
            this.element.querySelector('.building-color').value = building.customColor;
        } else {
            this.element.querySelector('.use-custom-color').checked = false;
            this.element.querySelector('.building-color').disabled = true;
            this.element.querySelector('.building-color').value = building.color || '#000000';
        }
    }

    updateTypeSpecificValues(type, properties) {
        switch (type) {
            case 'residential':
                if (properties.style) {
                    this.element.querySelector('.residential-style').value = properties.style;
                }
                if (properties.units !== undefined) {
                    this.element.querySelector('.residential-units').value = properties.units;
                }
                break;
            case 'commercial':
                if (properties.businessType) {
                    this.element.querySelector('.commercial-business').value = properties.businessType;
                }
                if (properties.parkingSpaces !== undefined) {
                    this.element.querySelector('.commercial-parking').value = properties.parkingSpaces;
                }
                break;
            case 'industrial':
                if (properties.facilityType) {
                    this.element.querySelector('.industrial-facility').value = properties.facilityType;
                }
                if (properties.loadingDocks !== undefined) {
                    this.element.querySelector('.industrial-docks').value = properties.loadingDocks;
                }
                break;
            case 'office':
                if (properties.officeType) {
                    this.element.querySelector('.office-type').value = properties.officeType;
                }
                if (properties.occupancy !== undefined) {
                    this.element.querySelector('.office-occupancy').value = properties.occupancy;
                }
                break;
        }
    }

    hide() {
        this.element.style.display = 'none';
        this.currentBuilding = null;
    }

    applyChanges() {
        if (!this.currentBuilding) return;

        const changes = {
            type: this.element.querySelector('.building-type').value,
            floors: parseInt(this.element.querySelector('.building-floors').value),
            roofType: this.element.querySelector('.building-roof-type').value,
            rotation: parseFloat(this.element.querySelector('.building-rotation').value),
            properties: {}
        };

        // Get type-specific properties
        switch (changes.type) {
            case 'residential':
                changes.properties.style = this.element.querySelector('.residential-style').value;
                changes.properties.units = parseInt(this.element.querySelector('.residential-units').value);
                break;
            case 'commercial':
                changes.properties.businessType = this.element.querySelector('.commercial-business').value;
                changes.properties.parkingSpaces = parseInt(this.element.querySelector('.commercial-parking').value);
                break;
            case 'industrial':
                changes.properties.facilityType = this.element.querySelector('.industrial-facility').value;
                changes.properties.loadingDocks = parseInt(this.element.querySelector('.industrial-docks').value);
                break;
            case 'office':
                changes.properties.officeType = this.element.querySelector('.office-type').value;
                changes.properties.occupancy = parseInt(this.element.querySelector('.office-occupancy').value);
                break;
        }

        // Handle custom color
        if (this.element.querySelector('.use-custom-color').checked) {
            changes.customColor = this.element.querySelector('.building-color').value;
        } else {
            changes.customColor = null;
        }

        this.emit('update-building', { building: this.currentBuilding, changes });
    }

    getElement() {
        return this.element;
    }
}