// Test data generator for Road Mapper
// Run this in the browser console after the app loads

function addTestRoads() {
    if (!window.app || !window.app.elementManager) {
        console.error('App not loaded yet');
        return;
    }
    
    // Clear existing data
    app.elementManager.clear();
    
    // Create some test roads
    const roads = [
        // Main horizontal avenue
        {
            points: [
                { x: -400, y: 0 },
                { x: 400, y: 0 }
            ],
            type: 'ARTERIAL'
        },
        // Main vertical street
        {
            points: [
                { x: 0, y: -300 },
                { x: 0, y: 300 }
            ],
            type: 'STREET'
        },
        // Diagonal road 1
        {
            points: [
                { x: -200, y: -200 },
                { x: 200, y: 200 }
            ],
            type: 'STREET'
        },
        // Diagonal road 2
        {
            points: [
                { x: 200, y: -200 },
                { x: -200, y: 200 }
            ],
            type: 'STREET'
        },
        // Side streets
        {
            points: [
                { x: -300, y: -150 },
                { x: -300, y: 150 }
            ],
            type: 'STREET'
        },
        {
            points: [
                { x: 300, y: -150 },
                { x: 300, y: 150 }
            ],
            type: 'STREET'
        },
        // Connecting roads
        {
            points: [
                { x: -300, y: 150 },
                { x: -100, y: 150 },
                { x: -100, y: 250 },
                { x: 100, y: 250 },
                { x: 100, y: 150 },
                { x: 300, y: 150 }
            ],
            type: 'STREET'
        }
    ];
    
    // Add roads using the tool
    roads.forEach(roadData => {
        const road = app.elementManager.createRoad(roadData.type);
        roadData.points.forEach(point => {
            road.addPoint(point.x, point.y);
        });
        road.finalize();
        app.elementManager.addRoad(road);
    });
    
    // The intersections should be created automatically
    console.log('Test data added successfully');
    console.log('Roads:', app.elementManager.getRoads().length);
    console.log('Intersections:', app.elementManager.getIntersections().length);
    
    // Switch to bird's eye view
    console.log('Switching to bird\'s eye view...');
    app.svgRenderer.viewport.setZoom(0.15);
}

// Also add a function to test different zoom levels
function testZoomLevels() {
    const levels = [0.1, 0.15, 0.2, 0.3, 0.5, 1, 2, 4];
    let index = 0;
    
    const interval = setInterval(() => {
        if (index >= levels.length) {
            clearInterval(interval);
            console.log('Zoom test complete');
            return;
        }
        
        const zoom = levels[index];
        console.log(`Setting zoom to ${zoom}x (${zoom < 0.2 ? 'Bird\'s Eye' : 'Normal'})`);
        app.svgRenderer.viewport.setZoom(zoom);
        index++;
    }, 2000);
}

// Log instructions
console.log('Test data functions loaded!');
console.log('Call addTestRoads() to add test road network');
console.log('Call testZoomLevels() to cycle through zoom levels');
console.log('Press B to jump to bird\'s eye view');