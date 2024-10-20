let canvas;
let shapeEditMenu;

export function initializeShapeEditMenu(fabricCanvas) {
    canvas = fabricCanvas;
    shapeEditMenu = document.getElementById('shapeEditMenu');

    // Set up event listeners for menu buttons
    document.getElementById('shapeColorBtn').addEventListener('click', () => document.getElementById('shapeColorPicker').click());
    document.getElementById('shapeColorPicker').addEventListener('change', updateShapeColor);
    document.getElementById('shapeOutlineColorBtn').addEventListener('click', () => document.getElementById('shapeOutlineColorPicker').click());
    document.getElementById('shapeOutlineColorPicker').addEventListener('change', updateShapeOutlineColor);
    document.getElementById('shapeOutlineWidth').addEventListener('input', updateShapeOutlineWidth);
    document.getElementById('bringForwardShapeBtn').addEventListener('click', bringForward);
    document.getElementById('sendBackwardShapeBtn').addEventListener('click', sendBackward);
    document.getElementById('deleteShapeBtn').addEventListener('click', deleteShape);

    // Set up canvas event listeners
    canvas.on('selection:created', showShapeEditMenu);
    canvas.on('selection:updated', showShapeEditMenu);
    canvas.on('selection:cleared', hideShapeEditMenu);
}

function showShapeEditMenu(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle')) {
        const zoom = canvas.getZoom();
        const objRect = activeObject.getBoundingRect();
        
        shapeEditMenu.style.display = 'block';
        shapeEditMenu.style.left = `${(objRect.left * zoom) + canvas.viewportTransform[4]}px`;
        shapeEditMenu.style.top = `${(objRect.top * zoom) + canvas.viewportTransform[5] - shapeEditMenu.offsetHeight - 10}px`;

        // Update menu to reflect current shape styles
        updateMenuState(activeObject);
    } else {
        hideShapeEditMenu();
    }
}

function hideShapeEditMenu() {
    shapeEditMenu.style.display = 'none';
}

function updateMenuState(shapeObject) {
    document.getElementById('shapeColorPicker').value = shapeObject.fill;
    document.getElementById('shapeOutlineColorPicker').value = shapeObject.stroke;
    document.getElementById('shapeOutlineWidth').value = shapeObject.strokeWidth;
}

function updateShapeColor(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('fill', event.target.value);
        canvas.renderAll();
    }
}

function updateShapeOutlineColor(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('stroke', event.target.value);
        canvas.renderAll();
    }
}

function updateShapeOutlineWidth(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('strokeWidth', parseInt(event.target.value));
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

function deleteShape() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
        hideShapeEditMenu();
    }
}