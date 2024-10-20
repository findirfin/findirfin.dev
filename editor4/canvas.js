const { fabric } = window;

function initializeCanvas(canvasId) {
    const canvas = new fabric.Canvas(canvasId);
    setupCanvasProperties(canvas);
    return canvas;
}

function resizeCanvas(canvas) {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}

function setupCanvasProperties(canvas) {
    canvas.isDrawingMode = false;
    customizeControls();
    changeSelectionStyle(canvas);
}

function customizeControls() {
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: 'white',
        cornerStrokeColor: '#444444',
        cornerStyle: 'circle',
        cornerSize: 12,
        cornerStrokeWidth: 2,
        borderColor: '#444444',
        borderScaleFactor: 2,
        borderDashArray: [5, 5]
    });
}

function changeSelectionStyle(canvas) {
    canvas.set({
        selectionColor: 'rgba(46, 204, 113, 0.2)',
        selectionBorderColor: '#27ae60',
        selectionLineWidth: 2,
        selectionDashArray: [6, 6]
    });
}

export { initializeCanvas, resizeCanvas };