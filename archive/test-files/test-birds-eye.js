// Test Bird's Eye View
// Run this in the browser console after Road Mapper loads

function testBirdsEyeView() {
    console.log('=== Testing Bird\'s Eye View ===');
    
    // Check if app is loaded
    if (!window.app) {
        console.error('App not loaded yet!');
        return;
    }
    
    // Add test roads if none exist
    const roads = app.elementManager.getRoads();
    if (roads.length === 0) {
        console.log('No roads found, adding test data...');
        addTestRoads();
        
        // Wait for roads to be rendered
        setTimeout(() => {
            console.log('Test roads added, switching to bird\'s eye view...');
            activateBirdsEyeView();
        }, 100);
    } else {
        console.log(`Found ${roads.length} roads, switching to bird\'s eye view...`);
        activateBirdsEyeView();
    }
}

function activateBirdsEyeView() {
    // Set zoom to bird's eye level
    app.svgRenderer.viewport.setZoom(0.15);
    
    // Force update visibility
    setTimeout(() => {
        app.svgRenderer.updateVisibility();
        
        // Check results
        setTimeout(() => {
            checkBirdsEyeStyles();
        }, 100);
    }, 50);
}

function checkBirdsEyeStyles() {
    console.log('\n=== Checking Bird\'s Eye Styles ===');
    console.log('Current zoom:', app.svgRenderer.viewport.zoom);
    console.log('Is bird\'s eye:', app.svgRenderer.viewport.zoom < 0.2);
    
    // Check roads
    const roadPaths = document.querySelectorAll('.road-path');
    console.log(`\nRoad paths found: ${roadPaths.length}`);
    
    let correctRoads = 0;
    roadPaths.forEach((path, i) => {
        const stroke = path.getAttribute('stroke');
        const width = path.getAttribute('stroke-width');
        const filter = path.style.filter;
        const isCorrect = stroke === '#00ff88' && width === '3' && filter.includes('circuit-glow');
        
        if (isCorrect) correctRoads++;
        
        console.log(`Road ${i}: ${isCorrect ? '✓' : '✗'} stroke=${stroke}, width=${width}, filter=${filter}`);
    });
    
    // Check intersections
    const birdsEyeIntersections = document.querySelectorAll('.birds-eye-intersection');
    console.log(`\nBird's eye intersections found: ${birdsEyeIntersections.length}`);
    
    // Summary
    console.log('\n=== Summary ===');
    console.log(`Roads styled correctly: ${correctRoads}/${roadPaths.length}`);
    console.log(`Bird's eye intersections: ${birdsEyeIntersections.length}`);
    
    if (correctRoads === roadPaths.length && birdsEyeIntersections.length > 0) {
        console.log('✓ Bird\'s eye view is working correctly!');
    } else {
        console.log('✗ Bird\'s eye view has issues. Attempting manual fix...');
        manuallyFixBirdsEye();
    }
}

function manuallyFixBirdsEye() {
    console.log('\n=== Applying Manual Fix ===');
    
    // Fix roads
    app.svgRenderer.svgElements.forEach((element) => {
        if (element.constructor.name === 'SVGRoadElement') {
            // Ensure references are set
            element.storeElementReferences();
            // Force update
            element.updateDetailLevel(app.svgRenderer.viewport.zoom);
        }
    });
    
    // Check again after fix
    setTimeout(() => {
        const roadPaths = document.querySelectorAll('.road-path');
        let fixed = 0;
        roadPaths.forEach(path => {
            if (path.getAttribute('stroke') === '#00ff88') fixed++;
        });
        console.log(`Fixed ${fixed}/${roadPaths.length} roads`);
    }, 100);
}

// Helper function to add test roads (if needed)
function addTestRoads() {
    const roads = [
        {
            points: [
                { x: -300, y: 0 },
                { x: 300, y: 0 }
            ],
            type: 'ARTERIAL'
        },
        {
            points: [
                { x: 0, y: -200 },
                { x: 0, y: 200 }
            ],
            type: 'STREET'
        },
        {
            points: [
                { x: -150, y: -150 },
                { x: 150, y: 150 }
            ],
            type: 'STREET'
        }
    ];
    
    roads.forEach(roadData => {
        const road = app.elementManager.createRoad(roadData.type);
        roadData.points.forEach(point => {
            road.addPoint(point.x, point.y);
        });
        road.finalize();
        app.elementManager.addRoad(road);
    });
}

// Run the test
console.log('Bird\'s Eye View Test Loaded!');
console.log('Run testBirdsEyeView() to test');
console.log('Or press B key to jump to bird\'s eye view');

// Auto-run if requested
if (typeof AUTO_TEST_BIRDS_EYE !== 'undefined' && AUTO_TEST_BIRDS_EYE) {
    testBirdsEyeView();
}