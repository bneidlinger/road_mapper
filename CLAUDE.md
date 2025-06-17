# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Road Mapper is a SaaS-ready web application for designing transportation networks with professional road drawing and intersection management capabilities.

## Commands

```bash
# Install dependencies
npm install

# Development server (Webpack)
npm run dev     # Runs on http://localhost:8080

# Build for production
npm run build   # Creates dist/ folder with production files

# Linting and formatting
npm run lint    # Run ESLint
npm run format  # Run Prettier
```

Note: While vite.config.js exists, the project currently uses Webpack. All npm scripts use webpack-dev-server.

## Architecture

### Core Systems
- **SVG-based Rendering**: Uses SVG elements (not Canvas) for crisp, scalable graphics
- **Event-Driven Architecture**: EventEmitter base class enables loose coupling between modules
- **Modular Structure**: Clear separation of concerns with single-responsibility modules

### Module Organization (/src/)

**Core Infrastructure**:
- `core/`: Constants, EventEmitter base class, Store for state management
- `app.js`: RoadMapperApp class - main application entry point

**Rendering Pipeline**:
- `modules/SVGRenderer.js`: Main rendering orchestrator
- `modules/SVGManager.js`: Manages SVG element creation and updates
- `modules/VisibilityManager.js`: Optimizes rendering based on viewport
- `modules/LODManager.js`: Level-of-detail rendering based on zoom
- `modules/effects/`: SVG filters, patterns, and animations

**Element System**:
- `modules/ElementManager.js`: Central manager for all map elements
- `modules/elements/Road.js`: Multi-point paths with type-based properties
- `modules/elements/Intersection.js`: Auto-detected connection points

**Viewport & Interaction**:
- `modules/viewport/SVGViewport.js`: Camera, zoom/pan, coordinate transformations
- `modules/grid/`: Grid rendering and snap-to-grid functionality
- `modules/BirdsEyeManager.js`: Special rendering mode at low zoom levels

**Tool System**:
- `modules/ToolManager.js`: Tool switching and keyboard shortcuts
- `modules/tools/BaseTool.js`: Abstract base class for all tools
- `modules/tools/`: SelectTool (V), RoadTool (R), IntersectionTool (I), DeleteTool (D), PanTool (Space)

**UI Components**:
- `components/Toolbar.js`: Tool selection interface
- `components/StatusBar.js`: Coordinates and status display

### Key Technical Details

**Coordinate Systems**:
- World coordinates: Actual map positions (stored in elements)
- Screen coordinates: Display positions (for rendering)
- SVGViewport handles all transformations between systems

**Rendering Features**:
- SVG-based for infinite zoom without pixelation
- Level-of-detail (LOD) system adapts rendering to zoom level
- Bird's eye view mode (B key) for overview visualization
- SVG filters and patterns for visual effects
- Optimized visibility culling

**Data Flow**:
1. User interaction → ToolManager → Active Tool
2. Tool modifies elements via ElementManager
3. ElementManager emits change events
4. SVGRenderer receives events and updates SVG DOM
5. VisibilityManager and LODManager optimize what's rendered

## Development Guidelines

**Adding New Tools**:
1. Extend `BaseTool` class in `modules/tools/`
2. Implement required methods: `onMouseDown`, `onMouseMove`, `onMouseUp`
3. Register in ToolManager with keyboard shortcut

**Adding Element Types**:
1. Create class in `modules/elements/`
2. Implement `draw()` method that returns SVG elements
3. Implement `hitTest()` for selection
4. Add to ElementManager's type handling

**Performance Considerations**:
- SVG elements are reused when possible
- Visibility culling removes off-screen elements
- LOD system reduces detail at low zoom levels
- Event batching prevents excessive updates

## File Format

`.roadmap` files are JSON with this structure:
```json
{
  "version": "1.0.0",
  "viewport": { "x": 0, "y": 0, "zoom": 1 },
  "elements": {
    "roads": [...],
    "intersections": [...]
  }
}
```