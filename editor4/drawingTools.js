let canvas;
const { fabric } = window;

export function initializeDrawingTools(fabricCanvas) {
    canvas = fabricCanvas;
    setupDrawingEventListeners();
}

function setupDrawingEventListeners() {
    const toggleBtn = document.getElementById('toggleDrawingBtn');
    const colorPicker = document.getElementById('drawingColor');
    const brushSize = document.getElementById('brushSize');
    const brushType = document.getElementById('brushType');
    const drawingControls = document.querySelector('.drawing-controls');

    toggleBtn.addEventListener('click', () => {
        canvas.isDrawingMode = !canvas.isDrawingMode;
        toggleBtn.innerHTML = canvas.isDrawingMode ? 
            '<i class="fas fa-pencil-alt"></i> Stop Drawing' : 
            '<i class="fas fa-pencil-alt"></i> Start Drawing';
        drawingControls.style.display = canvas.isDrawingMode ? 'block' : 'none';
        
        if (canvas.isDrawingMode) {
            updateBrush();
        }
    });

    colorPicker.addEventListener('change', updateBrush);
    brushSize.addEventListener('input', updateBrush);
    brushType.addEventListener('change', updateBrush);
}

function updateBrush() {
    const color = document.getElementById('drawingColor').value;
    const size = parseInt(document.getElementById('brushSize').value);
    const type = document.getElementById('brushType').value;

    if (!canvas.isDrawingMode) return;

    switch (type) {
        case 'circle':
            canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
            break;
        case 'spray':
            canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
            break;
        default:
            canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = size;
}