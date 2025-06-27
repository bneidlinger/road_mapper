# Road Mapper Refactoring Plan

## Overview
This document outlines the refactoring plan for large files in the Road Mapper codebase to improve maintainability, performance, and code organization. The goal is to keep all files under 500 lines while maintaining logical separation of concerns.

## Priority 1: Critical Files (Over 1000 lines)

### 1. SVGBuildingElement.js (1,196 lines)
**Target: Split into 5 modules**

#### New Module Structure:
```
src/modules/svg/elements/building/
├── SVGBuildingElement.js (main class, ~200 lines)
├── BuildingDetailsRenderer.js (~300 lines)
├── IsometricBuildingRenderer.js (~400 lines)
├── BuildingEffectsManager.js (~200 lines)
└── BuildingStyleManager.js (~100 lines)
```

#### Module Responsibilities:
- **SVGBuildingElement.js**: Core building element class, orchestrates other modules
- **BuildingDetailsRenderer.js**: Type-specific details (residential, commercial, office, industrial)
- **IsometricBuildingRenderer.js**: All isometric rendering logic including faces, windows, type details
- **BuildingEffectsManager.js**: City lights, shadows, hover effects, animations
- **BuildingStyleManager.js**: Colors, gradients, style utilities

#### Refactoring Steps:
1. Create new directory structure
2. Extract style utilities first (least dependencies)
3. Extract effects management
4. Extract isometric rendering
5. Extract detail rendering
6. Update main class to use extracted modules
7. Update all imports

### 2. RealisticControlsRenderer.js (1,045 lines)
**Target: Split into 4 modules**

#### New Module Structure:
```
src/modules/svg/controls/
├── RealisticControlsRenderer.js (main class, ~100 lines)
├── TrafficSignRenderer.js (~300 lines)
├── TrafficLightRenderer.js (~300 lines)
├── TrafficControlEffects.js (~300 lines)
└── TrafficLightAnimator.js (~150 lines)
```

#### Module Responsibilities:
- **RealisticControlsRenderer.js**: Main orchestrator, delegates to specific renderers
- **TrafficSignRenderer.js**: Stop signs, yield signs, and related rendering
- **TrafficLightRenderer.js**: Traffic light creation, housing, poles
- **TrafficControlEffects.js**: All SVG effects, gradients, filters, shadows
- **TrafficLightAnimator.js**: Animation logic and state management for traffic lights

#### Refactoring Steps:
1. Create new directory structure
2. Extract effects and gradients first
3. Extract animation logic
4. Split sign and light rendering
5. Update main class as coordinator
6. Update imports in intersection renderers

## Priority 2: Large UI Component (600+ lines)

### 3. IntersectionPropertiesPanel.js (674 lines)
**Target: Split into 5 modules**

#### New Module Structure:
```
src/components/intersection/
├── IntersectionPropertiesPanel.js (main class, ~150 lines)
├── IntersectionControlsUI.js (~200 lines)
├── StopSignConfigurator.js (~150 lines)
├── TrafficLightConfigurator.js (~100 lines)
└── IntersectionDiagramRenderer.js (~100 lines)
```

#### Module Responsibilities:
- **IntersectionPropertiesPanel.js**: Main panel orchestrator, event handling
- **IntersectionControlsUI.js**: Control type buttons, basic UI elements
- **StopSignConfigurator.js**: Stop sign position selector and logic
- **TrafficLightConfigurator.js**: Traffic light timing configuration
- **IntersectionDiagramRenderer.js**: SVG diagram rendering for intersection preview

#### Refactoring Steps:
1. Create new directory structure
2. Extract diagram rendering logic
3. Extract traffic light configuration
4. Extract stop sign configuration
5. Extract control UI elements
6. Update main panel class
7. Update app.js imports

## Priority 3: Files to Monitor (Approaching 500 lines)

### Files requiring future attention:
1. **BuildingGenerator.js** (493 lines) - Consider splitting generation strategies
2. **SVGFiltersFactory.js** (373 lines) - May need categorization by effect type
3. **SVGRoadElement.js** (386 lines) - Could separate rendering modes
4. **SVGIntersectionElement.js** (367 lines) - Could separate control rendering

## Implementation Strategy

### Phase 1: Setup (Week 1)
- [ ] Create new directory structures
- [ ] Set up base classes for each refactor
- [ ] Create integration tests to ensure functionality

### Phase 2: SVGBuildingElement Refactor (Week 1-2)
- [ ] Extract BuildingStyleManager
- [ ] Extract BuildingEffectsManager
- [ ] Extract IsometricBuildingRenderer
- [ ] Extract BuildingDetailsRenderer
- [ ] Update and test

### Phase 3: RealisticControlsRenderer Refactor (Week 2)
- [ ] Extract TrafficControlEffects
- [ ] Extract TrafficLightAnimator
- [ ] Split into TrafficSignRenderer and TrafficLightRenderer
- [ ] Update and test

### Phase 4: IntersectionPropertiesPanel Refactor (Week 3)
- [ ] Extract IntersectionDiagramRenderer
- [ ] Extract configurator components
- [ ] Extract UI components
- [ ] Update and test

### Phase 5: Cleanup and Optimization (Week 3)
- [ ] Update all imports across the codebase
- [ ] Remove any dead code
- [ ] Optimize module boundaries
- [ ] Update documentation

## Success Metrics
- All files under 500 lines
- No functionality regression
- Improved load time for large modules
- Easier navigation and maintenance
- Clear separation of concerns

## Testing Strategy
1. Create snapshot tests before refactoring
2. Test each module in isolation after extraction
3. Integration tests for full functionality
4. Performance benchmarks before/after

## Notes
- Maintain backward compatibility during refactor
- Use ES6 modules consistently
- Keep related functionality together
- Document module interfaces clearly
- Consider future extensibility in design