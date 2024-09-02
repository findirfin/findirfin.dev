let canvas;
let isDrawing = false;
let isAllCaps = true;

document.addEventListener('DOMContentLoaded', initializeMemeCreator);

function initializeMemeCreator() {
    canvas = new fabric.Canvas('memeCanvas');
    setupCanvasProperties();
    attachEventListeners();
}

function setupCanvasProperties() {
    canvas.isDrawingMode = false;
    customizeControls();
    changeSelectionStyle();
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
    fabric.Object.prototype.controls.mtr.cursorStyle = 'pointer';
}

function changeSelectionStyle() {
    canvas.set({
        selectionColor: 'rgba(46, 204, 113, 0.2)',
        selectionBorderColor: '#27ae60',
        selectionLineWidth: 2,
        selectionDashArray: [6, 6]
    });
}

function attachEventListeners() {
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    document.getElementById('addTextBtn').addEventListener('click', addTextToCanvas);
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

    setupImageLibrary();
    setupCollapsibles();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    loadImageToCanvas(file);
}

function loadImageToCanvas(file) {
    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, function(img) {
            canvas.clear();
            const scaleFactor = Math.min(canvas.width / img.width, canvas.height / img.height);
            img.set({
                scaleX: scaleFactor,
                scaleY: scaleFactor,
                left: (canvas.width - img.width * scaleFactor) / 2,
                top: (canvas.height - img.height * scaleFactor) / 2,
                selectable: false,
                movable: false,
                lockMovementX: true,
                lockMovementY: true
            });
            canvas.add(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
}

function addTextToCanvas() {
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
            fill: document.getElementById('fontColor').value,
            stroke: activeObject.fill === 'white' ? 'black' : 'white',
            strokeWidth: 2
        });
        if (isAllCaps) {
            activeObject.text = activeObject.text.toUpperCase();
        }
        canvas.renderAll();
    }
}

function updateTextStyleControls(textObject) {
    document.getElementById('fontFamily').value = textObject.fontFamily.split(',')[0];
    document.getElementById('fontSize').value = textObject.fontSize;
    document.getElementById('fontColor').value = textObject.fill;
}

function toggleBold() {
    toggleTextStyle('fontWeight', 'bold', 'normal');
}

function toggleItalic() {
    toggleTextStyle('fontStyle', 'italic', 'normal');
}

function toggleUnderline() {
    toggleTextStyle('underline', true, false);
}

function toggleTextStyle(property, value, defaultValue) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set(property, activeObject[property] === value ? defaultValue : value);
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

function setupImageLibrary() {
    document.querySelectorAll('.image-library img').forEach(img => {
        img.addEventListener('click', function() {
            fabric.Image.fromURL(this.src, function(img) {
                img.scale(0.5);
                canvas.add(img);
            });
        });
    });
}

function addImageToLibrary() {
    const fileInput = document.getElementById('customImageUpload');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            createLibraryImage(e.target.result);
            document.querySelector('.add-image-dropdown').classList.remove('active');
            fileInput.value = '';
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select an image to add to the library.');
    }
}

function createLibraryImage(imageUrl) {
    const imageLibrary = document.querySelector('.image-library');
    const newImg = document.createElement('img');
    newImg.src = imageUrl;
    newImg.alt = 'Custom Sticker';
    newImg.addEventListener('click', function() {
        fabric.Image.fromURL(this.src, function(img) {
            img.scale(0.5);
            canvas.add(img);
        });
    });
    imageLibrary.insertBefore(newImg, imageLibrary.lastElementChild);
}

function setupCollapsibles() {
    document.querySelectorAll(".collapse-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            content.style.maxHeight = content.style.maxHeight ? null : content.scrollHeight + "px";
        });
    });
}

function saveMeme() {
    if (!canvas.lowerCanvasEl.toBlob) {
        alert('Your browser does not support the required functionality to save images.');
        return;
    }

    canvas.lowerCanvasEl.toBlob(function(blob) {
        try {
            const fileName = `meme_${new Date().getTime()}.png`;
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                saveForMobile(blob, fileName);
            } else {
                saveForDesktop(blob, fileName);
            }
        } catch (error) {
            console.error('Error saving meme:', error);
            alert('An error occurred while saving the meme. Please try again.');
        }
    }, 'image/png');
}

function saveForMobile(blob, fileName) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = e.target.result;
        link.click();
    };
    reader.readAsDataURL(blob);
}

function saveForDesktop(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

canvas.on('object:selected', function(e) {
    const selectedObject = e.target;
    if (selectedObject.type === 'i-text') {
        updateTextStyleControls(selectedObject);
    }
});