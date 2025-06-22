# Changelog

All notable changes to Road Mapper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0-alpha] - 2025-06-22

### Added

#### Isometric 3D View System
- Implemented full isometric 3D rendering mode for buildings (toggle with '3' key)
- Buildings now properly display floor count with 12px height per floor
- Added proper face rendering with shading (top, right, front faces)
- Implemented dynamic shadows that scale with building height
- Added floor line indicators showing individual floors in isometric view
- Type-specific isometric details:
  - Residential: Windows on each floor and entrance doors
  - Commercial: Large glass storefronts with window dividers  
  - Office: Grid pattern windows across all floors
  - Industrial: Loading docks and high windows
- Fixed isometric building offset to properly align with tile positions

#### Building Visual Enhancements
- Added type-specific details for all building types:
  - Industrial: Smoke stacks and ventilation units
  - Office: Rooftop HVAC units and antennas for tall buildings
  - Commercial: Glass storefronts with awnings
  - Residential: Chimneys for houses, window patterns for apartments
- Enhanced shadow system with filter-based dynamic shadows
- Added subtle 3D highlights for depth perception
- Details appear/disappear based on zoom level for performance

#### Bird's Eye View Enhancement
- Buildings now transition to glowing city lights effect in bird's eye view
- Type-specific light colors (residential warm, commercial cool, etc.)
- Smooth fade transitions between view modes

#### Building Properties Panel
- Created comprehensive building properties panel with professional UI
- Added building type selection: Residential, Commercial, Industrial, Office
- Implemented type-specific customization options:
  - Residential: Style (single-family, townhouse, apartment, condo) and unit count
  - Commercial: Business type (retail, restaurant, grocery, bank, hotel) and parking spaces
  - Industrial: Facility type (warehouse, factory, distribution center) and loading docks
  - Office: Office type (corporate HQ, professional, medical, tech campus) and occupancy
- Added building customization controls:
  - Floors adjustment (1-50)
  - Rotation control with visual slider (-180° to +180°)
  - Custom color override option with color picker
- Implemented building selection with visual feedback (green outline with glow effect)
- Added delete building functionality from properties panel
- Buildings can now be moved by dragging when selected

### Fixed
- Fixed webpack/babel configuration to support optional chaining syntax (`?.`)
- Fixed building placement logic preventing buildings from being placed when roads exist
- Corrected intersection bounds format mismatch (was returning {x,y,width,height} instead of {minX,minY,maxX,maxY})
- Fixed mouse interaction bug where first click with building tool didn't respond properly
- Resolved properties panel visibility issue by creating separate containers for each panel type
- Fixed intersection properties panel not showing after building UI implementation

### Technical
- Added babel-loader with @babel/preset-env for modern JavaScript syntax support
- Created SVGBuildingElement class following the same architectural pattern as roads/intersections
- Implemented proper bounds overlap detection for building placement constraints
- Added building selection glow filter to SVG filters factory
- Updated Building class to support custom properties and color overrides
- Created IsometricRenderer module for 3D coordinate transformations
- Implemented dual rendering modes (standard and isometric) in SVGBuildingElement
- Added multiple shadow filters for different building heights
- Organized test/development files into archive folders

## [0.2.0-alpha] - 2025-01-20

### Added

#### Traffic Control Enhancements
- Implemented professional-quality yield signs with 3D effects and metallic posts
- Enhanced stop signs with realistic textures, gradients, and depth effects
- Added traffic light animations with configurable green/yellow/red timing
- Traffic lights now feature coordinated cycles (opposite directions synchronized)
- All control elements scaled consistently for visual harmony

#### Intersection Configuration
- Added yield sign placement interface in properties panel
- Implemented traffic light timing configuration with real-time cycle calculation
- Enhanced visual quality of all traffic control elements with shadows and glows

#### GitHub Pages Deployment
- Created complete deployment infrastructure for GitHub Pages
- Added GitHub Actions workflow for automatic deployment on push
- Configured webpack for production builds with correct subdirectory paths
- Created deployment documentation and scripts

### Changed
- Traffic lights reduced in scale to match stop/yield sign proportions
- All traffic control elements now use enhanced metallic posts with gradients
- Improved shadow and depth effects across all control elements

### Fixed
- GitHub Actions workflow updated to use non-deprecated action versions
- Production build now correctly handles assets for GitHub Pages subdirectory

## [0.1.0-alpha] - 2024-01-19

### Added

#### Building System
- Implemented click-and-drag building placement tool
- Added procedural building generation for large areas
- Fixed building tool controls for consistent click-hold-drag-release behavior
- Added `isUsingMouse()` to prevent pan tool interference during building placement
- Keyboard shortcuts: `G` to generate buildings in city blocks, `C` to clear all buildings

#### Intersection Management
- Created intersection properties panel with SaaS-quality UI
- Added control type selection: None, Stop Sign, Traffic Light, Yield
- Implemented visual stop sign placement interface with clickable positions
- Added Apply/Cancel workflow for intersection configuration changes
- Fixed intersection selection to prevent dragging (intersections are fixed at road connections)
- Implemented proper event routing for immediate visual updates

#### Road Markings & Graphics
- Fixed stop line orientation to be perpendicular to road direction
- Fixed crosswalk orientation for traffic light intersections
- Implemented approach-side placement for all control elements (stop signs, traffic lights)
- Removed debug red circles and development artifacts
- Added professional intersection graphics with subtle colors and shadows
- Stop lines only appear where stop signs are configured
- Crosswalks only appear at traffic light intersections

#### UI/UX Improvements
- Changed default intersection control type from 'stop_sign' to 'none'
- Fixed road preview brightness issue during drawing
- Added hover effects and professional styling to properties panel buttons
- Improved visual feedback for all tools

### Fixed
- Building tool no longer allows drawing without mouse button held
- Stop signs and traffic lights now positioned on approach side of intersection
- Properties panel changes now apply immediately without requiring additional clicks
- Fixed null reference error when applying intersection changes
- Corrected perpendicular angle calculations for road markings

### Technical
- Migrated from Vite to Webpack 5 for build tooling
- Implemented deep copying for intersection configuration arrays
- Added proper event emission chain: elementUpdated → intersectionUpdated → render
- Improved coordinate system handling for consistent rendering

### Documentation
- Updated README.md to reflect Webpack usage and current features
- Added detailed intersection management instructions
- Documented all keyboard shortcuts and workflows

## [Unreleased]

### Planned
- SVG/PNG export functionality
- Undo/redo system
- Road templates and presets
- Traffic flow simulation
- Collaborative editing
- Mobile touch support