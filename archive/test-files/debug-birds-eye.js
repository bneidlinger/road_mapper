// Debug script for bird's eye view
// Paste this into the browser console when Road Mapper is loaded

window.debugBirdsEye = {
  checkRoads: function() {
    console.log('=== Checking Roads ===');
    const roads = document.querySelectorAll('.road-path');
    console.log(`Found ${roads.length} road paths in DOM`);
    
    roads.forEach((road, index) => {
      console.log(`Road ${index}:`, {
        stroke: road.getAttribute('stroke'),
        strokeWidth: road.getAttribute('stroke-width'),
        filter: road.style.filter,
        opacity: road.getAttribute('opacity'),
        display: road.style.display,
        parent: road.parentElement?.className
      });
    });
  },
  
  checkFilters: function() {
    console.log('=== Checking SVG Filters ===');
    const filters = document.querySelectorAll('filter');
    filters.forEach(filter => {
      console.log(`Filter: ${filter.id}`);
    });
  },
  
  forceUpdate: function() {
    console.log('=== Forcing Bird\'s Eye Update ===');
    if (!window.app) {
      console.error('App not found');
      return;
    }
    
    const zoom = window.app.svgRenderer.viewport.zoom;
    console.log('Current zoom:', zoom);
    
    // Get all road elements from the element manager
    const roads = window.app.elementManager.getRoads();
    console.log(`Found ${roads.length} roads in element manager`);
    
    // Force update each road
    window.app.svgRenderer.svgElements.forEach((element, id) => {
      if (element.updateDetailLevel) {
        console.log(`Updating element ${id}`);
        element.updateDetailLevel(zoom);
      }
    });
  },
  
  testBirdsEye: function() {
    console.log('=== Testing Bird\'s Eye View ===');
    
    // Add test roads if none exist
    if (window.app.elementManager.getRoads().length === 0) {
      console.log('Adding test roads...');
      const road1 = window.app.elementManager.createRoad('STREET');
      road1.addPoint(-200, 0);
      road1.addPoint(200, 0);
      road1.finalize();
      window.app.elementManager.addRoad(road1);
      
      const road2 = window.app.elementManager.createRoad('STREET');
      road2.addPoint(0, -150);
      road2.addPoint(0, 150);
      road2.finalize();
      window.app.elementManager.addRoad(road2);
    }
    
    // Set to bird's eye view
    console.log('Setting zoom to 0.15...');
    window.app.svgRenderer.viewport.setZoom(0.15);
    
    // Check results after a delay
    setTimeout(() => {
      this.checkRoads();
      this.checkFilters();
    }, 1000);
  },
  
  fixRoads: function() {
    console.log('=== Attempting to fix road colors ===');
    const roads = document.querySelectorAll('.road-path');
    const zoom = window.app?.svgRenderer?.viewport?.zoom || 1;
    const isBirdsEye = zoom < 0.2;
    
    roads.forEach((road, index) => {
      if (isBirdsEye) {
        console.log(`Fixing road ${index} to bird's eye style`);
        road.setAttribute('stroke', '#00ff88');
        road.setAttribute('stroke-width', '3');
        road.style.filter = 'url(#circuit-glow)';
      }
    });
    
    console.log('Fix applied. Check visual result.');
  }
};

console.log('Bird\'s Eye Debug Tools Loaded!');
console.log('Available commands:');
console.log('- debugBirdsEye.checkRoads() - Check current road styling');
console.log('- debugBirdsEye.checkFilters() - Check if filters are defined');
console.log('- debugBirdsEye.forceUpdate() - Force update all elements');
console.log('- debugBirdsEye.testBirdsEye() - Run full test');
console.log('- debugBirdsEye.fixRoads() - Manually fix road colors');