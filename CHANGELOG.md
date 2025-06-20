# Changelog

All notable changes to Road Mapper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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