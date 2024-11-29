import { addTextToCanvas, updateTextEditMenuState } from './textTools.js';
import { copySelectedObject, pasteObject, deleteSelectedObject } from './objectManipulation.js';
import { showImageEditMenu, hideImageEditMenu } from './imageEditMenu.js';

let canvas;
let textEditMenu;

export function setupEventListeners(fabricCanvas) {
    canvas = fabricCanvas;
    textEditMenu = document.getElementById('textEditMenu');

    // Sidebar buttons
    document.getElementById('addTextBtn').addEventListener('click', () => addTextToCanvas(canvas));
    document.getElementById('addShapeBtn').addEventListener('click', addShape);

    // Canvas events
    canvas.on('selection:created', handleObjectSelection);
    canvas.on('selection:updated', handleObjectSelection);
    canvas.on('selection:cleared', handleSelectionCleared);
    canvas.on('text:changed', updateTextEditMenuPosition);

    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);

    // Window events
    window.addEventListener('resize', () => {
        canvas.setDimensions({
            width: window.innerWidth - 250,
            height: window.innerHeight
        });
        canvas.renderAll();
    });
}


function handleObjectSelection(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        if (activeObject.type === 'image' || activeObject.type === 'rect' || activeObject.type === 'circle' || activeObject.type === 'triangle') {
            showImageEditMenu(event);
        } else if (activeObject.type === 'i-text') {
            showTextEditMenu(activeObject);
        }
    }
}

function handleSelectionCleared() {
    hideImageEditMenu();
    hideTextEditMenu();
}

function showTextEditMenu(textObject) {
    updateTextEditMenuState(textObject);
    positionTextEditMenu(textObject);
    textEditMenu.style.display = 'block';
}

function hideTextEditMenu() {
    textEditMenu.style.display = 'none';
}

function positionTextEditMenu(textObject) {
    const zoom = canvas.getZoom();
    const objRect = textObject.getBoundingRect();
    const canvasRect = canvas.getElement().getBoundingClientRect();

    let left = (objRect.left * zoom) + canvas.viewportTransform[4] + canvasRect.left;
    let top = (objRect.top * zoom) + canvas.viewportTransform[5] + canvasRect.top - textEditMenu.offsetHeight - 10 - 175; // Added 175px offset
    // If the menu would appear above the viewport, position it below the text instead
    if (top < 0) {
        top = (objRect.top * zoom) + canvas.viewportTransform[5] + canvasRect.top + objRect.height * zoom + 10;
    }

    // Ensure the menu doesn't go off-screen horizontally
    const rightEdge = left + textEditMenu.offsetWidth;
    if (rightEdge > window.innerWidth) {
        left = window.innerWidth - textEditMenu.offsetWidth - 10;
    }

    textEditMenu.style.left = `${left}px`;
    textEditMenu.style.top = `${top}px`;
}

function updateTextEditMenuPosition() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text' && textEditMenu.style.display === 'block') {
        positionTextEditMenu(activeObject);
    }
}

function handleKeyDown(e) {
    // Ignore delete and backspace when focused on input elements
    if ((e.key === 'Delete' || e.key === 'Backspace') && 
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
    }

    if (e.ctrlKey && e.key === 'c') {
        copySelectedObject(canvas);
    } else if (e.ctrlKey && e.key === 'v') {
        pasteObject(canvas);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedObject(canvas);
    }
}


function addShape() {
    const shape = new fabric.Rect({
        left: canvas.width / 2,
        top: canvas.height / 2,
        fill: 'red',
        width: 100,
        height: 100,
        originX: 'center',
        originY: 'center'
    });
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
}

export { showTextEditMenu, hideTextEditMenu };
