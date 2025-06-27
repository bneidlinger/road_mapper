// Debug script for road naming input issues
// Run this in the browser console after selecting a road

console.log('=== Road Naming Debug ===');

// Check if properties panel exists
const panel = document.querySelector('.road-properties');
console.log('Properties panel found:', !!panel);
console.log('Panel visible:', panel?.classList.contains('visible'));

// Check road name input
const nameInput = document.querySelector('.road-properties .road-name');
if (nameInput) {
    console.log('\nRoad name input found!');
    console.log('Input properties:');
    console.log('- Value:', nameInput.value);
    console.log('- Disabled:', nameInput.disabled);
    console.log('- ReadOnly:', nameInput.readOnly);
    console.log('- Type:', nameInput.type);
    console.log('- Placeholder:', nameInput.placeholder);
    
    const computed = window.getComputedStyle(nameInput);
    console.log('\nComputed styles:');
    console.log('- Display:', computed.display);
    console.log('- Visibility:', computed.visibility);
    console.log('- Pointer Events:', computed.pointerEvents);
    console.log('- Z-Index:', computed.zIndex);
    console.log('- Position:', computed.position);
    console.log('- Opacity:', computed.opacity);
    console.log('- User Select:', computed.userSelect);
    
    const rect = nameInput.getBoundingClientRect();
    console.log('\nBounding rect:');
    console.log('- Position:', `${rect.x}, ${rect.y}`);
    console.log('- Size:', `${rect.width}x${rect.height}`);
    console.log('- Visible:', rect.width > 0 && rect.height > 0);
    
    // Check what's at the input's position
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const elementsAtPoint = document.elementsFromPoint(centerX, centerY);
    console.log('\nElements at input center:');
    elementsAtPoint.forEach((el, i) => {
        console.log(`${i}: ${el.tagName}${el.className ? '.' + el.className : ''}`);
    });
    
    // Test if we can focus it
    console.log('\nTrying to focus input...');
    nameInput.focus();
    console.log('Active element:', document.activeElement === nameInput ? 'Input is focused!' : 'Could not focus');
    
    // Check event listeners
    console.log('\nChecking for blocking overlays...');
    const overlays = document.querySelectorAll('[style*="z-index"]');
    overlays.forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        if (zIndex && parseInt(zIndex) > 1000) {
            console.log('High z-index element found:', el, 'z-index:', zIndex);
        }
    });
    
} else {
    console.log('Road name input NOT FOUND!');
    console.log('Available inputs in panel:', 
        Array.from(document.querySelectorAll('.road-properties input')).map(i => i.className)
    );
}

// Check if there's a blocking element
console.log('\nChecking for modal or overlay elements...');
const modals = document.querySelectorAll('.modal, .overlay, [class*="modal"], [class*="overlay"]');
console.log('Found potential blocking elements:', modals.length);

// Test programmatic input
if (nameInput) {
    console.log('\nTesting programmatic input change...');
    const testValue = 'Test Road Name';
    nameInput.value = testValue;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('Set value to:', testValue);
    console.log('Current value:', nameInput.value);
}

console.log('\n=== End Debug ===');