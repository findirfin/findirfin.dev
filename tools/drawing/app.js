// Initialize canvas
var canvas = new fabric.Canvas('canvas');

// Set default fabric object properties
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = '#4a90e2';
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.cornerSize = 8;
fabric.Object.prototype.padding = 5;
fabric.Object.prototype.borderColor = '#4a90e2';

// Set initial tool and color
var currentTool = 'select';
var currentColor = '#000000';
var isDrawingShape = false;
var shapeBeingDrawn = null;
var startX, startY;

// Undo/redo stacks
var undoStack = [];
var redoStack = [];

// Function to save canvas state
function saveState() {
    redoStack = [];
    undoStack.push(JSON.stringify(canvas));
}

// Toolbar event listeners
document.getElementById('select').addEventListener('click', function() {
    currentTool = 'select';
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

document.getElementById('pencil').addEventListener('click', function() {
    currentTool = 'pencil';
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = currentColor;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: 1,
        offsetX: 0,
        offsetY: 0,
        color: currentColor,
    });
});

document.getElementById('rectangle').addEventListener('click', function() {
    currentTool = 'rectangle';
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

document.getElementById('circle').addEventListener('click', function() {
    currentTool = 'circle';
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

document.getElementById('line').addEventListener('click', function() {
    currentTool = 'line';
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

document.getElementById('text').addEventListener('click', function() {
    currentTool = 'text';
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

document.getElementById('undo').addEventListener('click', function() {
    if (undoStack.length > 0) {
        redoStack.push(JSON.stringify(canvas));
        var state = undoStack.pop();
        canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
    }
});

document.getElementById('redo').addEventListener('click', function() {
    if (redoStack.length > 0) {
        undoStack.push(JSON.stringify(canvas));
        var state = redoStack.pop();
        canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
    }
});

document.getElementById('save').addEventListener('click', function() {
    var dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    var link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
});

document.getElementById('colorPicker').addEventListener('change', function(e) {
    currentColor = e.target.value;
    canvas.freeDrawingBrush.color = currentColor;
});

// Add canvas size handler
document.getElementById('canvasSize').addEventListener('change', function(e) {
    const [width, height] = e.target.value.split('x').map(Number);
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
    
    // Scale canvas container to fit screen
    const container = canvas.wrapperEl;
    const maxWidth = window.innerWidth - 40; // Account for padding
    const maxHeight = window.innerHeight - 100; // Account for toolbar
    
    if (width > maxWidth) {
        const scale = maxWidth / width;
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'top center';
    } else {
        container.style.transform = 'none';
    }
});

// Canvas event listeners
canvas.on('mouse:down', function(options) {
    var pointer = canvas.getPointer(options.e);
    startX = pointer.x;
    startY = pointer.y;

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
        isDrawingShape = true;
        canvas.selection = false;

        if (currentTool === 'rectangle') {
            shapeBeingDrawn = new fabric.Rect({
                left: startX,
                top: startY,
                width: 0,
                height: 0,
                fill: '',
                stroke: currentColor,
                strokeWidth: 2
            });
        } else if (currentTool === 'circle') {
            shapeBeingDrawn = new fabric.Circle({
                left: startX,
                top: startY,
                radius: 0,
                fill: '',
                stroke: currentColor,
                strokeWidth: 2
            });
        } else if (currentTool === 'line') {
            shapeBeingDrawn = new fabric.Line([startX, startY, startX, startY], {
                stroke: currentColor,
                strokeWidth: 2
            });
        }
        canvas.add(shapeBeingDrawn);
    } else if (currentTool === 'text') {
        var text = new fabric.IText('Type here', {
            left: startX,
            top: startY,
            fill: currentColor
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        saveState();
    }
});

canvas.on('mouse:move', function(options) {
    if (isDrawingShape && shapeBeingDrawn) {
        var pointer = canvas.getPointer(options.e);
        if (currentTool === 'rectangle') {
            var width = pointer.x - startX;
            var height = pointer.y - startY;
            shapeBeingDrawn.set({ width: width, height: height });
        } else if (currentTool === 'circle') {
            var radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2));
            shapeBeingDrawn.set({ radius: radius });
        } else if (currentTool === 'line') {
            shapeBeingDrawn.set({ x2: pointer.x, y2: pointer.y });
        }
        canvas.renderAll();
    }
});

canvas.on('mouse:up', function(options) {
    if (isDrawingShape) {
        isDrawingShape = false;
        canvas.selection = true;
        shapeBeingDrawn.setCoords();
        canvas.setActiveObject(shapeBeingDrawn);
        shapeBeingDrawn = null;
        saveState();
    }
});

// Save state on object changes
canvas.on('object:added', saveState);
canvas.on('object:modified', saveState);
canvas.on('object:removed', saveState);

// Update delete key handler to include backspace
document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!canvas.getActiveObject()) return;
        e.preventDefault();
        var activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            activeObjects.forEach(function(object) {
                canvas.remove(object);
            });
            canvas.discardActiveObject();
            saveState();
        }
    }
});