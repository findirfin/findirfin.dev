function toggleDrawingMode(canvas) {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    document.getElementById('drawBtn').textContent = canvas.isDrawingMode ? 'Stop Drawing' : 'Draw on Image';
}

function updateDrawingColor(canvas, e) {
    canvas.freeDrawingBrush.color = e.target.value;
}

function updateDrawingSize(canvas, e) {
    canvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
}

export { toggleDrawingMode, updateDrawingColor, updateDrawingSize };