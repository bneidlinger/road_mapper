import { Building } from '../elements/Building.js';

/**
 * BuildingVarietyGenerator - Generates varied and realistic building configurations
 */
export class BuildingVarietyGenerator {
    constructor() {
        // Building configuration presets by type
        this.buildingPresets = {
            residential: {
                small: {
                    minWidth: 20, maxWidth: 35,
                    minHeight: 25, maxHeight: 40,
                    minFloors: 1, maxFloors: 2,
                    styles: ['victorian', 'colonial', 'modern', 'cottage', 'craftsman'],
                    roofTypes: ['gabled', 'hipped', 'flat', 'shed'],
                    colors: ['#E8D4B0', '#D4C5A0', '#C8B890', '#DCC9A0', '#E0D0A8']
                },
                medium: {
                    minWidth: 35, maxWidth: 60,
                    minHeight: 40, maxHeight: 70,
                    minFloors: 2, maxFloors: 4,
                    styles: ['townhouse', 'duplex', 'rowhouse', 'apartment'],
                    roofTypes: ['flat', 'mansard', 'gabled'],
                    colors: ['#E0CDB0', '#D8C0A0', '#CCB590', '#D4BCA0']
                },
                large: {
                    minWidth: 60, maxWidth: 100,
                    minHeight: 60, maxHeight: 100,
                    minFloors: 3, maxFloors: 8,
                    styles: ['apartment-complex', 'condo', 'high-rise-residential'],
                    roofTypes: ['flat', 'terrace'],
                    colors: ['#D8C8B8', '#C8B8A8', '#B8A898', '#C0B0A0']
                }
            },
            commercial: {
                small: {
                    minWidth: 30, maxWidth: 50,
                    minHeight: 30, maxHeight: 50,
                    minFloors: 1, maxFloors: 2,
                    styles: ['retail', 'restaurant', 'boutique', 'cafe'],
                    roofTypes: ['flat', 'false-front', 'awning'],
                    colors: ['#C5B8A5', '#B8AA98', '#C0B0A0', '#BCAC9C']
                },
                medium: {
                    minWidth: 50, maxWidth: 80,
                    minHeight: 40, maxHeight: 70,
                    minFloors: 2, maxFloors: 4,
                    styles: ['department-store', 'shopping-center', 'mixed-use'],
                    roofTypes: ['flat', 'parapet'],
                    colors: ['#B8ACA0', '#ACA098', '#B0A498', '#A89C90']
                },
                large: {
                    minWidth: 80, maxWidth: 120,
                    minHeight: 60, maxHeight: 100,
                    minFloors: 2, maxFloors: 5,
                    styles: ['mall', 'big-box', 'shopping-complex'],
                    roofTypes: ['flat', 'barrel', 'sawtooth'],
                    colors: ['#A8A0A0', '#989090', '#A09898', '#908888']
                }
            },
            office: {
                small: {
                    minWidth: 30, maxWidth: 50,
                    minHeight: 30, maxHeight: 50,
                    minFloors: 2, maxFloors: 4,
                    styles: ['professional', 'medical', 'suburban-office'],
                    roofTypes: ['flat', 'low-slope'],
                    colors: ['#A0B5C8', '#98ADC0', '#90A5B8', '#88A0B0']
                },
                medium: {
                    minWidth: 50, maxWidth: 80,
                    minHeight: 50, maxHeight: 80,
                    minFloors: 4, maxFloors: 12,
                    styles: ['corporate', 'mid-rise', 'tech-campus'],
                    roofTypes: ['flat', 'mechanical-penthouse'],
                    colors: ['#90A8C0', '#88A0B8', '#809AB0', '#7890A8']
                },
                large: {
                    minWidth: 70, maxWidth: 120,
                    minHeight: 70, maxHeight: 120,
                    minFloors: 10, maxFloors: 30,
                    styles: ['tower', 'skyscraper', 'high-rise'],
                    roofTypes: ['flat', 'architectural-crown', 'spire'],
                    colors: ['#7890A8', '#708AA0', '#688498', '#607C90']
                }
            },
            industrial: {
                small: {
                    minWidth: 40, maxWidth: 70,
                    minHeight: 40, maxHeight: 70,
                    minFloors: 1, maxFloors: 2,
                    styles: ['workshop', 'storage', 'light-industrial'],
                    roofTypes: ['flat', 'shed', 'monitor'],
                    colors: ['#B0B0B0', '#A8A8A8', '#A0A0A0', '#989898']
                },
                medium: {
                    minWidth: 70, maxWidth: 120,
                    minHeight: 60, maxHeight: 100,
                    minFloors: 1, maxFloors: 3,
                    styles: ['factory', 'warehouse', 'distribution'],
                    roofTypes: ['flat', 'sawtooth', 'barrel'],
                    colors: ['#989898', '#909090', '#888888', '#808080']
                },
                large: {
                    minWidth: 100, maxWidth: 200,
                    minHeight: 80, maxHeight: 150,
                    minFloors: 1, maxFloors: 4,
                    styles: ['plant', 'heavy-industry', 'manufacturing'],
                    roofTypes: ['flat', 'multi-span', 'monitor'],
                    colors: ['#808080', '#787878', '#707070', '#686868']
                }
            }
        };
        
        // Facade features by style
        this.facadeFeatures = {
            victorian: ['bay-windows', 'turret', 'gingerbread-trim', 'porch'],
            colonial: ['symmetric-windows', 'shutters', 'columns', 'pediment'],
            modern: ['large-windows', 'clean-lines', 'balconies', 'glass-facade'],
            craftsman: ['exposed-beams', 'stone-accents', 'wide-porch', 'brackets'],
            retail: ['storefront', 'signage', 'awning', 'display-windows'],
            corporate: ['glass-curtain-wall', 'lobby', 'setbacks', 'plaza'],
            factory: ['loading-docks', 'skylights', 'vents', 'service-doors']
        };
    }
    
    /**
     * Generate a varied building for a lot
     */
    generateVariedBuilding(lot, context = {}) {
        // Determine building size category based on lot
        const lotArea = lot.width * lot.height;
        const sizeCategory = this.determineSizeCategory(lotArea);
        
        // Determine building type based on context
        const type = this.determineBuildingType(lot, context);
        
        // Get preset for this type and size
        const preset = this.buildingPresets[type][sizeCategory];
        
        // Generate building dimensions with variety
        const dimensions = this.generateBuildingDimensions(lot, preset);
        
        // Select architectural style
        const style = this.selectStyle(preset.styles);
        
        // Generate building ID
        const buildingId = `building_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create base building
        const building = new Building(
            buildingId,
            dimensions.x,
            dimensions.y,
            dimensions.width,
            dimensions.height,
            type
        );
        
        // Add variety attributes
        building.floors = this.randomInRange(preset.minFloors, preset.maxFloors);
        building.style = style;
        building.roofType = this.selectRandom(preset.roofTypes);
        building.color = this.selectRandom(preset.colors);
        building.customColor = this.addColorVariation(building.color);
        
        // Add facade features
        building.facadeFeatures = this.generateFacadeFeatures(style);
        
        // Add subtle rotation for organic feel
        building.rotation = (Math.random() - 0.5) * 4; // -2 to 2 degrees
        
        // Add building metadata
        building.metadata = {
            sizeCategory,
            yearBuilt: this.generateYearBuilt(style),
            condition: this.selectRandom(['excellent', 'good', 'fair']),
            materials: this.generateMaterials(type, style)
        };
        
        return building;
    }
    
    /**
     * Determine size category based on lot area
     */
    determineSizeCategory(area) {
        if (area < 2000) return 'small';
        if (area < 5000) return 'medium';
        return 'large';
    }
    
    /**
     * Determine building type based on lot and context
     */
    determineBuildingType(lot, context) {
        const area = lot.width * lot.height;
        
        // If context provides district type, use it
        if (context.district) {
            switch (context.district) {
                case 'downtown':
                    return Math.random() < 0.6 ? 'office' : 'commercial';
                case 'industrial':
                    return 'industrial';
                case 'suburban':
                    return Math.random() < 0.7 ? 'residential' : 'commercial';
                case 'mixed-use': {
                    const rand = Math.random();
                    if (rand < 0.4) return 'residential';
                    if (rand < 0.7) return 'commercial';
                    return 'office';
                }
            }
        }
        
        // Default logic based on lot size
        if (area < 2000) {
            return Math.random() < 0.8 ? 'residential' : 'commercial';
        } else if (area < 5000) {
            const rand = Math.random();
            if (rand < 0.4) return 'residential';
            if (rand < 0.7) return 'commercial';
            return 'office';
        } else {
            const rand = Math.random();
            if (rand < 0.3) return 'commercial';
            if (rand < 0.6) return 'office';
            return 'industrial';
        }
    }
    
    generateBuildingDimensions(lot, preset) {
        // Calculate setbacks based on building type
        const frontSetback = this.randomInRange(5, 15);
        const sideSetback = this.randomInRange(3, 8);
        const rearSetback = this.randomInRange(5, 10);
        
        // Maximum possible dimensions
        const maxWidth = lot.width - (sideSetback * 2);
        const maxHeight = lot.height - frontSetback - rearSetback;
        
        // Generate dimensions within preset ranges
        let width = this.randomInRange(preset.minWidth, preset.maxWidth);
        let height = this.randomInRange(preset.minHeight, preset.maxHeight);
        
        // Ensure building fits in lot
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
        
        // Position building with variation
        const xVariation = Math.random() * (maxWidth - width);
        const yVariation = Math.random() * (maxHeight - height) * 0.5; // Less Y variation
        
        return {
            x: lot.x + sideSetback + xVariation,
            y: lot.y + frontSetback + yVariation,
            width,
            height
        };
    }
    
    /**
     * Generate facade features based on style
     */
    generateFacadeFeatures(style) {
        const features = [];
        const availableFeatures = this.facadeFeatures[style] || [];
        
        // Select random features
        const numFeatures = this.randomInRange(1, Math.min(3, availableFeatures.length));
        for (let i = 0; i < numFeatures; i++) {
            const feature = this.selectRandom(availableFeatures);
            if (!features.includes(feature)) {
                features.push(feature);
            }
        }
        
        return features;
    }
    
    /**
     * Generate year built based on style
     */
    generateYearBuilt(style) {
        const styleRanges = {
            victorian: [1880, 1920],
            colonial: [1900, 1960],
            craftsman: [1905, 1940],
            modern: [1990, 2024],
            corporate: [1970, 2024],
            industrial: [1940, 2000]
        };
        
        const range = styleRanges[style] || [1950, 2024];
        return this.randomInRange(range[0], range[1]);
    }
    
    /**
     * Generate building materials based on type and style
     */
    generateMaterials(type) {
        const materials = {
            residential: ['brick', 'wood-siding', 'stucco', 'stone-veneer'],
            commercial: ['glass', 'concrete', 'metal-panel', 'brick'],
            office: ['glass-curtain-wall', 'precast-concrete', 'steel', 'granite'],
            industrial: ['corrugated-metal', 'concrete-block', 'steel-frame', 'brick']
        };
        
        return this.selectRandom(materials[type] || ['concrete']);
    }
    
    /**
     * Add subtle color variation
     */
    addColorVariation(baseColor) {
        // Parse hex color
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        
        // Add random variation (-10 to +10)
        const variation = 10;
        const newR = Math.max(0, Math.min(255, r + this.randomInRange(-variation, variation)));
        const newG = Math.max(0, Math.min(255, g + this.randomInRange(-variation, variation)));
        const newB = Math.max(0, Math.min(255, b + this.randomInRange(-variation, variation)));
        
        // Convert back to hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    /**
     * Helper functions
     */
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    selectRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    selectStyle(styles) {
        return this.selectRandom(styles);
    }
}