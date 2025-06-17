# 🛣️ Road Mapper

<div align="center">
  
  ![Road Mapper](https://img.shields.io/badge/Road%20Mapper-v1.0.0-00ff88?style=for-the-badge)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
  
  **Professional transportation network design in your browser**
  
  [Demo](#) • [Documentation](#documentation) • [Contributing](#contributing) • [License](#license)
  
</div>

---

## ✨ Features

Road Mapper is a powerful, browser-based application for designing transportation networks with professional-grade tools and an intuitive interface.

### 🎯 Core Capabilities

- **🖊️ Smart Road Drawing** - Multi-point path creation with automatic curve smoothing
- **🔀 Auto-Intersection Detection** - Intelligently creates intersections where roads meet
- **📐 Grid & Snap System** - Precision placement with configurable grid sizes
- **🛠️ Professional Tools** - Select, draw, delete, and pan with keyboard shortcuts
- **💾 Project Management** - Save and load your designs in portable .roadmap format
- **🎨 Dark Theme UI** - Easy on the eyes for extended design sessions
- **⚡ Zero Dependencies** - Pure vanilla JavaScript for maximum performance

### 🚀 Coming Soon

- [ ] SVG/PNG export functionality
- [ ] Undo/redo system
- [ ] Road templates and presets
- [ ] Traffic flow simulation
- [ ] Collaborative editing
- [ ] Mobile touch support

## 🏁 Quick Start

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

The application will open at `http://localhost:3000`

### Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Select tool |
| `R` | Road drawing tool |
| `I` | Intersection tool |
| `D` | Delete tool |
| `Space` | Pan tool |
| `Left Click + Drag` | Pan view (in any tool) |
| `Right Click + Drag` | Pan view |
| `Ctrl/Cmd + N` | New project |
| `Ctrl/Cmd + S` | Save project |
| `Ctrl/Cmd + O` | Open project |

### Drawing Roads

1. Select the Road tool (`R` key)
2. Click to place the first point
3. Click to add additional points along the path
4. Double-click to finish the road
5. Roads automatically connect when they intersect!

## 🏗️ Architecture

Road Mapper follows a modular, event-driven architecture for maintainability and extensibility.

```
src/
├── core/           # Core utilities (EventEmitter, Store, Constants)
├── modules/        # Main application logic
│   ├── viewport/   # Camera and coordinate system
│   ├── grid/       # Grid rendering and snapping
│   ├── elements/   # Road and Intersection classes
│   └── tools/      # Tool implementations
├── components/     # UI components
└── styles/         # CSS styling
```

### Key Design Patterns

- **Event-Driven Architecture** - Loose coupling between modules
- **Tool System** - Extensible tool framework with base class
- **World/Screen Coordinates** - Clean separation of coordinate spaces
- **Single Responsibility** - Each module handles one concern

## 📖 Documentation

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
  
  draw(ctx, viewport) {
    // Custom drawing logic
  }
  
  hitTest(x, y) {
    // Collision detection
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📊 Performance

Road Mapper is optimized for handling large transportation networks:

- Canvas-based rendering for smooth performance
- Efficient spatial indexing for element selection
- Minimal redraws using dirty rectangle tracking
- Lightweight with zero runtime dependencies

## 🛡️ Security

- No external dependencies reduces attack surface
- Client-side only - your designs never leave your device
- Content Security Policy ready
- Regular security audits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by SimCity's road tools
- Built with modern web standards
- Developed with ❤️ for urban planners and game developers

---

<div align="center">
  
  **[Report Bug](https://github.com/yourusername/road-mapper/issues) • [Request Feature](https://github.com/yourusername/road-mapper/issues)**
  
  Made with ☕ and 🎵
  
</div>