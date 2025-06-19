# Road Mapper

<div align="center">
  
  ![Road Mapper](https://img.shields.io/badge/Road%20Mapper-v1.0.0-00ff88?style=for-the-badge)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![Webpack](https://img.shields.io/badge/Webpack-5-8DD6F9?style=for-the-badge&logo=webpack&logoColor=black)
  ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
  
  **Professional transportation network design in your browser**
  
  [Demo](#) • [Documentation](#documentation) • [Contributing](#contributing) • [License](#license)
  
</div>

---

## Features

Road Mapper is a powerful, browser-based application for designing transportation networks with professional-grade tools and an intuitive interface.

### Core Capabilities

- **Smart Road Drawing** - Multi-point path creation with automatic intersection detection
- **Intersection Management** - Configure stop signs, traffic lights, and intersection controls
- **Procedural Building Generation** - Click-drag to place buildings or auto-generate in city blocks
- **Grid & Snap System** - Precision placement with configurable grid (toggle with grid button)
- **Professional Tools** - Select, road, intersection, delete, building, and pan tools
- **Bird's Eye View Mode** - Special visualization mode for city-scale planning (Hold B)
- **Project Management** - Save/load your designs in portable .roadmap JSON format
- **SVG-Based Rendering** - Infinite zoom without pixelation, crisp graphics at any scale
- **Dark Theme UI** - Professional SaaS-quality interface design

### Advanced Features

- **Intersection Properties Panel** - Configure control types with Apply/Cancel workflow
- **Smart Stop Sign Placement** - Visual placement of stop signs at specific approaches
- **Realistic Road Markings** - Stop lines and crosswalks rendered based on control type
- **Level-of-Detail System** - Automatic detail adjustment based on zoom level
- **Visibility Culling** - Optimized rendering for large transportation networks
- **Professional Graphics** - Stop signs, traffic lights, road markings, and building shadows
- **Event-Driven Architecture** - Extensible and modular codebase

### Coming Soon

- [ ] SVG/PNG export functionality
- [ ] Undo/redo system
- [ ] Road templates and presets
- [ ] Traffic flow simulation
- [ ] Collaborative editing
- [ ] Mobile touch support

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/road-mapper.git
cd road-mapper

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at `http://localhost:8080`

### Building for Production

```bash
# Create optimized build
npm run build

# The built files will be in the dist/ directory
# Deploy the contents of dist/ to your web server
```

### Other Commands

```bash
# Run ESLint
npm run lint

# Run Prettier formatting
npm run format
```

## Usage

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `R` | Road drawing tool |
| `D` | Delete tool |
| `B` | Building tool |
| `G` | Generate buildings in all city blocks |
| `C` | Clear all buildings |
| `Space` | Pan tool |
| `Left Click + Drag` | Pan view (when not drawing) |
| `Right Click + Drag` | Pan view |
| `Ctrl/Cmd + N` | New project |
| `Ctrl/Cmd + S` | Save project |
| `Ctrl/Cmd + O` | Open project |
| `B` (hold) | Bird's eye view mode |

### Drawing Roads

1. Select the Road tool (`R` key)
2. Click to place the first point
3. Click to add additional points along the path
4. Double-click or press Enter to finish the road
5. Intersections are automatically created where roads meet!

### Managing Intersections

1. Select an intersection with the Select tool (`V` key)
2. The Intersection Properties panel will appear
3. Choose control type: None, Stop Sign, Traffic Light, or Yield
4. For stop signs, click the red circles to place signs at specific approaches
5. Click Apply to save changes or Cancel to discard
6. Intersections cannot be moved - they're fixed at road connections

### Creating Buildings

1. Select the Building tool (`B` key)
2. Click and drag to define a rectangular area
3. Release to generate buildings:
   - Small areas (< 100x100) create single buildings
   - Large areas generate multiple buildings procedurally
4. Use `G` to auto-generate buildings in all detected city blocks
5. Use `C` to clear all buildings

## Architecture

Road Mapper follows a modular, event-driven architecture for maintainability and extensibility.

```
src/
├── core/           # Core utilities (EventEmitter, Store, Constants)
├── modules/        # Main application logic
│   ├── svg/        # SVG rendering pipeline
│   │   ├── SVGRenderer.js      # Main rendering orchestrator
│   │   ├── SVGManager.js       # SVG element management
│   │   └── rendering/          # Visibility and LOD management
│   ├── viewport/   # Camera and coordinate system
│   ├── grid/       # Grid rendering and snapping
│   ├── elements/   # Road, Intersection, and Building classes
│   ├── tools/      # Tool implementations
│   └── effects/    # Visual effects and patterns
├── components/     # UI components
└── styles/         # CSS styling
```

### Key Design Patterns

- **Event-Driven Architecture** - Loose coupling between modules
- **Tool System** - Extensible tool framework with base class
- **World/Screen Coordinates** - Clean separation of coordinate spaces
- **Single Responsibility** - Each module handles one concern
- **SVG-Based Rendering** - Scalable vector graphics for infinite zoom
- **Level-of-Detail (LOD)** - Adaptive rendering based on zoom level
- **Visibility Management** - Efficient culling of off-screen elements

## Documentation

### Creating Custom Tools

Extend the `BaseTool` class to create new tools:

```javascript
import { BaseTool } from './BaseTool.js';

export class MyCustomTool extends BaseTool {
  onMouseDown(event, worldPos) {
    // Handle mouse down
  }
  
  onMouseMove(event, worldPos) {
    // Handle mouse move
  }
}
```

### Adding New Element Types

Create new elements by following the pattern in `modules/elements/`:

```javascript
export class Bridge {
  constructor(id, startPoint, endPoint) {
    this.id = id;
    this.start = startPoint;
    this.end = endPoint;
  }
  
  draw() {
    // Return SVG element(s)
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // Add SVG elements to group
    return group;
  }
  
  hitTest(worldPos) {
    // Collision detection in world coordinates
  }
  
  updateDetailLevel(zoom) {
    // Adjust rendering based on zoom level
  }
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Technical Stack

- **Build Tool**: Webpack 5 with hot module replacement
- **Rendering**: Pure SVG with no canvas elements
- **Styling**: Custom CSS with CSS variables for theming
- **Architecture**: Vanilla JavaScript with ES6 modules
- **State Management**: Event-driven with custom EventEmitter
- **No Dependencies**: Zero external runtime dependencies

## Performance

Road Mapper is optimized for handling large transportation networks:

- SVG-based rendering with hardware acceleration
- Visibility culling removes off-screen elements
- Level-of-detail system reduces complexity at low zoom
- Event batching prevents excessive updates
- Efficient element reuse and caching
- Smart rendering updates only affected elements

## Security

- No external dependencies reduces attack surface
- Client-side only - your designs never leave your device
- Content Security Policy ready
- Regular security audits

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by SimCity's road tools
- Built with modern web standards
- Developed for urban planners and game developers

---

<div align="center">
  
  **[Report Bug](https://github.com/yourusername/road-mapper/issues) • [Request Feature](https://github.com/yourusername/road-mapper/issues)**
  
  Built with modern web technologies
  
</div>