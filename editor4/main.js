// main.js

const { fabric } = window;

import { setupEventListeners } from './eventListeners.js';
import { initializeImageEditMenu } from './imageEditMenu.js';
import { initializeTextTools } from './textTools.js';
import { initializeFileManagement } from './fileManagement.js';
import { initializeImageLibrary } from './imageLibrary.js';
import { initializeObjectManipulation } from './objectManipulation.js';
import { initializeClipboardHandler } from './clipboardHandler.js';


let canvas;

function initializeCanvas(canvasId) {
    canvas = new fabric.Canvas(canvasId, {
        backgroundColor: '#ffffff'
    });
    resizeCanvas();
    return canvas;
}

function setupCanvasProperties(canvas) {
    canvas.selection = true;
    canvas.uniformScaling = false;
    customizeControls();
    changeSelectionStyle(canvas);
}

function customizeControls() {
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#00a8ff',
        cornerStrokeColor: '#0097e6',
        borderColor: '#00a8ff',
        cornerSize: 12,
        padding: 10,
        cornerStyle: 'circle',
        borderDashArray: [3, 3]
    });
}

function changeSelectionStyle(canvas) {
    canvas.selectionColor = 'rgba(0, 168, 255, 0.3)';
    canvas.selectionBorderColor = '#00a8ff';
    canvas.selectionLineWidth = 1;
}

function resizeCanvas() {
    const sidebarWidth = 250; // Width of the sidebar
    const canvasWidth = window.innerWidth + sidebarWidth;
    const canvasHeight = window.innerHeight;
    
    canvas.setWidth(canvasWidth);
    canvas.setHeight(canvasHeight);
    
    // Update canvas element size
    canvas.lowerCanvasEl.style.width = `${canvasWidth}px`;
    canvas.lowerCanvasEl.style.height = `${canvasHeight}px`;
    
    canvas.renderAll();
}

function initializeModules() {
    initializeImageEditMenu(canvas);
    initializeTextTools(canvas);
    initializeFileManagement(canvas);
    initializeObjectManipulation(canvas);
    initializeClipboardHandler(canvas);

}

async function initializeApp() {
    canvas = initializeCanvas('memeCanvas');
    setupCanvasProperties(canvas);
    initializeModules();
    setupEventListeners(canvas);
    await initializeImageLibrary(canvas);

    window.addEventListener('resize', resizeCanvas);
}

function handleError(error) {
    console.error('An error occurred:', error);
    // Implement user-friendly error message display here if needed
}

try {
    document.addEventListener('DOMContentLoaded', initializeApp);
} catch (error) {
    handleError(error);
}

// Make canvas accessible globally (for debugging purposes)
window.memeCanvas = canvas;

// Export necessary functions and variables
export { canvas, resizeCanvas };