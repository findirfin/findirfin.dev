let canvas;
let isAllCaps = false;

export function initializeTextTools(fabricCanvas) {
    canvas = fabricCanvas;

    // Set up event listeners for text editing controls
    document.getElementById('fontFamily').addEventListener('change', updateTextStyle);
    document.getElementById('fontSize').addEventListener('change', updateTextStyle);
    document.getElementById('fontSize').addEventListener('keydown', handleFontSizeKeydown);
    document.getElementById('fontColor').addEventListener('change', updateTextStyle);
    document.getElementById('boldBtn').addEventListener('click', toggleBold);
    document.getElementById('italicBtn').addEventListener('click', toggleItalic);
    document.getElementById('underlineBtn').addEventListener('click', toggleUnderline);
    document.getElementById('allCapsBtn').addEventListener('click', toggleAllCaps);
    document.getElementById('alignLeftBtn').addEventListener('click', () => alignText('left'));
    document.getElementById('alignCenterBtn').addEventListener('click', () => alignText('center'));
    document.getElementById('alignRightBtn').addEventListener('click', () => alignText('right'));
    document.getElementById('deleteTextBtn').addEventListener('click', deleteSelectedText);
}

function handleFontSizeKeydown(e) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
        e.stopPropagation(); // Prevent the event from bubbling up to the canvas
    }
}

export function addTextToCanvas() {
    const text = new fabric.IText('Enter text', {
        left: canvas.width / 2,
        top: canvas.height / 2,
        fontFamily: 'Arial',
        fontSize: 40,
        fill: 'white',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        stroke: '#000000',
        strokeWidth: 1
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
}

function updateTextStyle() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
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
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold');
        canvas.renderAll();
    }
}

function toggleItalic() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic');
        canvas.renderAll();
    }
}

function toggleUnderline() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('underline', !activeObject.underline);
        canvas.renderAll();
    }
}

function toggleAllCaps() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        isAllCaps = !isAllCaps;
        activeObject.set('text', isAllCaps ? activeObject.text.toUpperCase() : activeObject.text.toLowerCase());
        canvas.renderAll();
    }
}

function alignText(alignment) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('textAlign', alignment);
        canvas.renderAll();
    }
}

function deleteSelectedText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        canvas.remove(activeObject);
        canvas.renderAll();
    }
}

export function updateTextEditMenuState(textObject) {
    document.getElementById('fontFamily').value = textObject.fontFamily;
    document.getElementById('fontSize').value = textObject.fontSize;
    document.getElementById('fontColor').value = textObject.fill;
    document.getElementById('boldBtn').classList.toggle('active', textObject.fontWeight === 'bold');
    document.getElementById('italicBtn').classList.toggle('active', textObject.fontStyle === 'italic');
    document.getElementById('underlineBtn').classList.toggle('active', textObject.underline);
    document.getElementById('allCapsBtn').classList.toggle('active', isAllCaps);
}