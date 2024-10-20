const { fabric } = window;

let canvas;
let textEditMenu;

export function initializeTextEditMenu(fabricCanvas) {
    canvas = fabricCanvas;
    textEditMenu = document.getElementById('textEditMenu');

    // Set up event listeners for menu inputs and buttons
    document.getElementById('fontFamily').addEventListener('change', updateTextStyle);
    document.getElementById('fontSize').addEventListener('change', updateTextStyle);
    document.getElementById('fontColor').addEventListener('change', updateTextStyle);
    document.getElementById('boldBtn').addEventListener('click', toggleBold);
    document.getElementById('italicBtn').addEventListener('click', toggleItalic);
    document.getElementById('underlineBtn').addEventListener('click', toggleUnderline);
    document.getElementById('allCapsBtn').addEventListener('click', toggleAllCaps);
    document.getElementById('alignLeftBtn').addEventListener('click', () => alignText('left'));
    document.getElementById('alignCenterBtn').addEventListener('click', () => alignText('center'));
    document.getElementById('alignRightBtn').addEventListener('click', () => alignText('right'));
    document.getElementById('deleteTextBtn').addEventListener('click', deleteText);

    // Set up canvas event listeners
    canvas.on('selection:created', showTextEditMenu);
    canvas.on('selection:updated', showTextEditMenu);
    canvas.on('selection:cleared', hideTextEditMenu);
}

function showTextEditMenu(event) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        const zoom = canvas.getZoom();
        const objRect = activeObject.getBoundingRect();
        
        textEditMenu.style.display = 'block';
        textEditMenu.style.left = `${(objRect.left * zoom) + canvas.viewportTransform[4]}px`;
        textEditMenu.style.top = `${(objRect.top * zoom) + canvas.viewportTransform[5] - textEditMenu.offsetHeight - 10}px`;

        // Update menu to reflect current text styles
        updateMenuState(activeObject);
    } else {
        hideTextEditMenu();
    }
}

function hideTextEditMenu() {
    textEditMenu.style.display = 'none';
}

function updateMenuState(textObject) {
    document.getElementById('fontFamily').value = textObject.fontFamily;
    document.getElementById('fontSize').value = textObject.fontSize;
    document.getElementById('fontColor').value = textObject.fill;
    document.getElementById('boldBtn').classList.toggle('active', textObject.fontWeight === 'bold');
    document.getElementById('italicBtn').classList.toggle('active', textObject.fontStyle === 'italic');
    document.getElementById('underlineBtn').classList.toggle('active', textObject.underline);
    // Update alignment buttons
    document.getElementById('alignLeftBtn').classList.toggle('active', textObject.textAlign === 'left');
    document.getElementById('alignCenterBtn').classList.toggle('active', textObject.textAlign === 'center');
    document.getElementById('alignRightBtn').classList.toggle('active', textObject.textAlign === 'right');
}

function updateTextStyle() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set({
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: parseInt(document.getElementById('fontSize').value),
            fill: document.getElementById('fontColor').value
        });
        canvas.renderAll();
    }
}

function toggleBold() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold');
        canvas.renderAll();
        updateMenuState(activeObject);
    }
}

function toggleItalic() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic');
        canvas.renderAll();
        updateMenuState(activeObject);
    }
}

function toggleUnderline() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('underline', !activeObject.underline);
        canvas.renderAll();
        updateMenuState(activeObject);
    }
}

function toggleAllCaps() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('text', activeObject.text.toUpperCase());
        canvas.renderAll();
    }
}

function alignText(alignment) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('textAlign', alignment);
        canvas.renderAll();
        updateMenuState(activeObject);
    }
}

function deleteText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        canvas.remove(activeObject);
        canvas.renderAll();
        hideTextEditMenu();
    }
}