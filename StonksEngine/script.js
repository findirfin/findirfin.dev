let canvas;
let isAllCaps = true;

document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas();
    setupEventListeners();
});

function initializeCanvas() {
    canvas = new fabric.Canvas('memeCanvas');
    resizeCanvas();
    customizeControls();
}

function customizeControls() {
    fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: 'white',
        cornerStrokeColor: '#444444',
        cornerStyle: 'circle',
        cornerSize: 12,
        cornerStrokeWidth: 2,
        borderColor: '#2c3e50',
        borderScaleFactor: 2,
        borderDashArray: [5, 5]
    });

    canvas.set({
        selectionColor: 'rgba(46, 204, 113, 0.2)',
        selectionBorderColor: '#27ae60',
        selectionLineWidth: 2,
        selectionDashArray: [6, 6]
    });
}

function setupEventListeners() {
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    document.getElementById('addTextBtn').addEventListener('click', addText);
    document.getElementById('fontFamily').addEventListener('change', updateTextStyle);
    document.getElementById('fontSize').addEventListener('change', updateTextStyle);
    document.getElementById('fontColor').addEventListener('change', updateTextStyle);
    document.getElementById('boldBtn').addEventListener('click', toggleBold);
    document.getElementById('italicBtn').addEventListener('click', toggleItalic);
    document.getElementById('underlineBtn').addEventListener('click', toggleUnderline);
    document.getElementById('allCapsBtn').addEventListener('click', toggleAllCaps);
    document.getElementById('imageFilter').addEventListener('change', applyImageFilter);
    document.getElementById('drawBtn').addEventListener('click', toggleDrawingMode);
    document.getElementById('drawColor').addEventListener('change', updateDrawingColor);
    document.getElementById('drawSize').addEventListener('change', updateDrawingSize);
    document.getElementById('addToLibraryBtn').addEventListener('click', addImageToLibrary);
    document.getElementById('saveMemeBtn').addEventListener('click', saveMeme);
    
    setupCollapsibles();
    setupImageLibrary();

    canvas.on('object:selected', updateTextStyleControls);
    window.addEventListener('resize', resizeCanvas);
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(f) {
            fabric.Image.fromURL(f.target.result, function(img) {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height
                });
            });
        };
        reader.readAsDataURL(file);
    }
}

function addText() {
    const text = new fabric.IText(isAllCaps ? 'ENTER TEXT' : 'Enter text', {
        left: 50,
        top: 50,
        fontFamily: 'Impact, Arial, sans-serif',
        fontSize: 40,
        fontWeight: 'bold',
        fill: 'white',
        stroke: 'black',
        strokeWidth: 2,
        textAlign: 'center'
    });

    if (isAllCaps) {
        text.on('changed', function() {
            this.text = this.text.toUpperCase();
        });
    }

    canvas.add(text);
    canvas.setActiveObject(text);
    updateTextStyleControls(text);
}

function updateTextStyle() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set({
            fontFamily: document.getElementById('fontFamily').value + ', Arial, sans-serif',
            fontSize: parseInt(document.getElementById('fontSize').value),
            fill: document.getElementById('fontColor').value
        });
        canvas.renderAll();
    }
}

function updateTextStyleControls(textObject) {
    if (textObject && textObject.type === 'i-text') {
        document.getElementById('fontFamily').value = textObject.fontFamily.split(',')[0];
        document.getElementById('fontSize').value = textObject.fontSize;
        document.getElementById('fontColor').value = textObject.fill;
    }
}

function toggleBold() {
    modifyActiveText('fontWeight', 'bold', 'normal');
}

function toggleItalic() {
    modifyActiveText('fontStyle', 'italic', 'normal');
}

function toggleUnderline() {
    modifyActiveText('underline', true, false);
}

function modifyActiveText(property, valueA, valueB) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set(property, activeObject[property] === valueA ? valueB : valueA);
        canvas.renderAll();
    }
}

function toggleAllCaps() {
    isAllCaps = !isAllCaps;
    document.getElementById('allCapsBtn').classList.toggle('active');
    canvas.getObjects('i-text').forEach(function(textObject) {
        if (isAllCaps) {
            textObject.text = textObject.text.toUpperCase();
            textObject.on('changed', function() {
                this.text = this.text.toUpperCase();
            });
        } else {
            textObject.off('changed');
        }
    });
    canvas.renderAll();
}

function applyImageFilter(e) {
    const filter = e.target.value;
    if (filter) {
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'image') {
                obj.filters = [new fabric.Image.filters[filter.charAt(0).toUpperCase() + filter.slice(1)]()];
                obj.applyFilters();
            }
        });
        canvas.renderAll();
    }
}

function toggleDrawingMode() {
    canvas.isDrawingMode = !canvas.isDrawingMode;
    document.getElementById('drawBtn').textContent = canvas.isDrawingMode ? 'Stop Drawing' : 'Draw on Image';
}

function updateDrawingColor(e) {
    canvas.freeDrawingBrush.color = e.target.value;
}

function updateDrawingSize(e) {
    canvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
}

function addImageToLibrary() {
    const fileInput = document.getElementById('customImageUpload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Custom Sticker';
            img.addEventListener('click', function() {
                addImageToCanvas(this.src);
            });
            document.querySelector('.image-library').insertBefore(img, document.querySelector('.add-image-container'));
            fileInput.value = '';
        };
        reader.readAsDataURL(file);
    }
}

function addImageToCanvas(src) {
    fabric.Image.fromURL(src, function(img) {
        img.scale(0.5);
        canvas.add(img);
        canvas.renderAll();
    });
}

function saveMeme() {
    if (!canvas.lowerCanvasEl.toBlob) {
        alert('Your browser does not support the required functionality to save images.');
        return;
    }

    canvas.lowerCanvasEl.toBlob(function(blob) {
        const link = document.createElement('a');
        link.download = `meme_${new Date().getTime()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

function setupCollapsibles() {
    document.querySelectorAll('.collapse-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + 'px';
        });
    });
}

function setupImageLibrary() {
    document.querySelectorAll('.image-library img').forEach(img => {
        img.addEventListener('click', function() {
            addImageToCanvas(this.src);
        });
    });
}





function resizeCanvas() {
    const canvasContainer = document.querySelector('.canvas-container');
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    
    // Maintain aspect ratio (e.g., square)
    const size = Math.min(width, height) - 40; // Subtract padding
    
    canvas.setDimensions({ width: size, height: size });
    canvas.setZoom(size / 600); // Assuming 600x600 is the base size
    canvas.renderAll();
}
