const { fabric } = window;

let canvas;
let imageEditMenu;

export function initializeImageEditMenu(fabricCanvas) {
    canvas = fabricCanvas;
    imageEditMenu = document.getElementById('imageEditMenu');

    // Set up event listeners for menu buttons
    document.getElementById('rotateLeftBtn').addEventListener('click', () => rotateObject(-90));
    document.getElementById('rotateRightBtn').addEventListener('click', () => rotateObject(90));
    document.getElementById('flipHorizontalBtn').addEventListener('click', flipObjectHorizontal);
    document.getElementById('flipVerticalBtn').addEventListener('click', flipObjectVertical);
    document.getElementById('cropBtn').addEventListener('click', cropObject);
    document.getElementById('opacitySlider').addEventListener('input', updateOpacity);
    document.getElementById('bringForwardBtn').addEventListener('click', bringForward);
    document.getElementById('sendBackwardBtn').addEventListener('click', sendBackward);
    document.getElementById('deleteObjectBtn').addEventListener('click', deleteObject);

    // New color picker for shapes
    document.getElementById('objectColorPicker').addEventListener('change', updateObjectColor);

    // Set up canvas event listeners
    canvas.on('selection:created', showImageEditMenu);
    canvas.on('selection:updated', showImageEditMenu);
    canvas.on('selection:cleared', hideImageEditMenu);
}

function showImageEditMenu(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'image' || activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle')) {
        const zoom = canvas.getZoom();
        const objRect = activeObject.getBoundingRect();
        
        imageEditMenu.style.display = 'block';
        imageEditMenu.style.left = `${(objRect.left * zoom) + canvas.viewportTransform[4]}px`;
        imageEditMenu.style.top = `${(objRect.top * zoom) + canvas.viewportTransform[5] - imageEditMenu.offsetHeight - 10}px`;

        // Show/hide specific controls based on object type
        document.getElementById('cropBtn').style.display = activeObject.type === 'image' ? 'inline-block' : 'none';
        document.getElementById('objectColorPicker').style.display = activeObject.type !== 'image' ? 'inline-block' : 'none';

        // Update color picker for shapes
        if (activeObject.type !== 'image') {
            document.getElementById('objectColorPicker').value = activeObject.fill;
        }
    } else {
        hideImageEditMenu();
    }
}

function hideImageEditMenu() {
    imageEditMenu.style.display = 'none';
}

function rotateObject(angle) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.rotate(activeObject.angle + angle);
        canvas.renderAll();
    }
}

function flipObjectHorizontal() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('flipX', !activeObject.flipX);
        canvas.renderAll();
    }
}

function flipObjectVertical() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('flipY', !activeObject.flipY);
        canvas.renderAll();
    }
}

function cropObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
        // Implement image cropping functionality
        console.log('Crop image functionality to be implemented');
    }
}


function updateOpacity(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('opacity', event.target.value / 100);
        canvas.renderAll();
    }
}

function updateObjectColor(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type !== 'image') {
        activeObject.set('fill', event.target.value);
        canvas.renderAll();
    }
}

function bringForward() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringForward(activeObject);
        canvas.renderAll();
    }
}

function sendBackward() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendBackwards(activeObject);
        canvas.renderAll();
    }
}

function deleteObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        hideImageEditMenu();
    }
}

export { showImageEditMenu, hideImageEditMenu };