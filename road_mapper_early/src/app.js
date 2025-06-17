import { initCanvas } from './modules/canvas/renderer.js';
import { setupInteraction } from './modules/canvas/interaction.js';
import { mapState } from './modules/settings/state.js';

/**
 * Entry point for Road Mapper
 */
function init() {
  initCanvas();
  setupInteraction();
  console.log('Road Mapper initialized', mapState);
}

window.addEventListener('DOMContentLoaded', init);