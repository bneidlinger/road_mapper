# Road Mapper Keyboard Shortcuts

## Tool Selection
- **V** - Select tool
- **R** - Road tool
- **I** - Intersection tool
- **D** - Delete tool
- **B** - Building tool
- **Space** - Pan tool (hold to temporarily activate)

## View Controls
- **E** - Toggle bird's eye view
- **3** - Toggle isometric 3D view
- **Ctrl/Cmd + =** or **Ctrl/Cmd + Plus** - Zoom in
- **Ctrl/Cmd + -** or **Ctrl/Cmd + Minus** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom to 100%

## File Operations
- **Ctrl/Cmd + N** - New project
- **Ctrl/Cmd + S** - Save project
- **Ctrl/Cmd + O** - Open/Load project
- **Ctrl/Cmd + Z** - Undo (not yet implemented)
- **Ctrl/Cmd + Y** - Redo (not yet implemented)

## Building Tool Specific
- **G** - Generate buildings in all detected city blocks
- **C** - Clear all buildings

## Mouse Controls
- **Left Click** - Primary action for current tool
- **Left Click + Drag** - Pan view (if tool is not actively using mouse)
- **Right Click** - Pan view
- **Mouse Wheel** - Zoom in/out

## Notes
- Building tool creates single buildings for small rectangles (<100x100) or generates multiple buildings for larger areas
- Minimum building size is 10x10 pixels
- Bird's eye view automatically activates when zoom < 25%
- Manual bird's eye toggle (E key) works at any zoom level