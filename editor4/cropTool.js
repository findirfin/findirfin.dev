// cropTool.js
const { fabric } = window;

let canvas;
let isCropping = false;
let cropRect = null;
let originalImage = null;
let originalImageState = null;
let cropOverlay = null;
let darkOverlay = null;

export function initializeCropTool(fabricCanvas) {
    canvas = fabricCanvas;
}

export function startCropping() {
    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
        alert('Please select an image to crop');
        return;
    }

    isCropping = true;
    originalImage = activeObject;
    
    // Store original state
    originalImageState = {
        scaleX: originalImage.scaleX,
        scaleY: originalImage.scaleY,
        left: originalImage.left,
        top: originalImage.top,
        angle: originalImage.angle,
        flipX: originalImage.flipX,
        flipY: originalImage.flipY,
        selectable: originalImage.selectable,
        evented: originalImage.evented
    };

    // Reset image rotation and make it unselectable during cropping
    originalImage.set({
        angle: 0,
        selectable: false,
        evented: false
    });

    // Calculate initial crop rectangle size (80% of image size)
    const imgBounds = originalImage.getBoundingRect(true);
    const cropWidth = imgBounds.width * 0.8;
    const cropHeight = imgBounds.height * 0.8;
    
    // Create dark overlay for background
    darkOverlay = new fabric.Rect({
        left: imgBounds.left,
        top: imgBounds.top,
        width: imgBounds.width,
        height: imgBounds.height,
        fill: 'rgba(0,0,0,0.5)',
        selectable: false,
        evented: false,
        excludeFromExport: true
    });

    // Create crop rectangle
    cropRect = new fabric.Rect({
        left: imgBounds.left + (imgBounds.width - cropWidth) / 2,
        top: imgBounds.top + (imgBounds.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        fill: 'rgba(0,0,0,0)',
        stroke: '#58a6ff',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        cornerColor: '#58a6ff',
        cornerStrokeColor: '#fff',
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerSize: 12,
        hasRotatingPoint: false,
        lockRotation: true,
        noScaleCache: false,
        strokeUniform: true
    });

    // Add custom constraints to crop rectangle
    cropRect.on('moving', function(e) {
        constrainCropRectangle();
    });

    cropRect.on('scaling', function(e) {
        constrainCropRectangle();
    });

    // Add elements to canvas
    canvas.add(darkOverlay);
    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    
    // Add crop controls
    addCropControls();
    
    canvas.renderAll();
}

function constrainCropRectangle() {
    const imgBounds = originalImage.getBoundingRect(true);
    const cropBounds = cropRect.getBoundingRect(true);

    // Constrain position
    if (cropBounds.left < imgBounds.left) {
        cropRect.set('left', cropRect.left + (imgBounds.left - cropBounds.left));
    }
    if (cropBounds.top < imgBounds.top) {
        cropRect.set('top', cropRect.top + (imgBounds.top - cropBounds.top));
    }
    if (cropBounds.left + cropBounds.width > imgBounds.left + imgBounds.width) {
        cropRect.set('left', cropRect.left - ((cropBounds.left + cropBounds.width) - (imgBounds.left + imgBounds.width)));
    }
    if (cropBounds.top + cropBounds.height > imgBounds.top + imgBounds.height) {
        cropRect.set('top', cropRect.top - ((cropBounds.top + cropBounds.height) - (imgBounds.top + imgBounds.height)));
    }

    // Ensure minimum size
    const minSize = 20;
    if (cropBounds.width < minSize) {
        cropRect.set('scaleX', (minSize / cropRect.width) * cropRect.scaleX);
    }
    if (cropBounds.height < minSize) {
        cropRect.set('scaleY', (minSize / cropRect.height) * cropRect.scaleY);
    }

    canvas.renderAll();
}

function addCropControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'cropControls';
    controlsContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    `;

    const applyButton = createButton('Apply Crop', applyCrop);
    const cancelButton = createButton('Cancel', cancelCrop);
    
    controlsContainer.appendChild(applyButton);
    controlsContainer.appendChild(cancelButton);
    document.body.appendChild(controlsContainer);
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
        padding: 8px 16px;
        background: #58a6ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    button.addEventListener('mouseenter', () => {
        button.style.background = '#4a90e2';
        button.style.transform = 'translateY(-1px)';
    });
    button.addEventListener('mouseleave', () => {
        button.style.background = '#58a6ff';
        button.style.transform = 'translateY(0)';
    });
    button.onclick = onClick;
    return button;
}

async function applyCrop() {
    if (!cropRect || !originalImage) return;

    const imgBounds = originalImage.getBoundingRect(true);
    const cropBounds = cropRect.getBoundingRect(true);

    // Calculate crop coordinates relative to the original image
    const relX = (cropBounds.left - imgBounds.left) / originalImage.scaleX;
    const relY = (cropBounds.top - imgBounds.top) / originalImage.scaleY;
    const relWidth = cropBounds.width / originalImage.scaleX;
    const relHeight = cropBounds.height / originalImage.scaleY;

    // Create temporary canvas for cropping
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set dimensions
    tempCanvas.width = cropBounds.width;
    tempCanvas.height = cropBounds.height;

    // Draw cropped portion
    tempCtx.drawImage(
        originalImage._element,
        relX,
        relY,
        relWidth,
        relHeight,
        0,
        0,
        cropBounds.width,
        cropBounds.height
    );

    // Create new fabric image
    fabric.Image.fromURL(tempCanvas.toDataURL(), function(croppedImg) {
        croppedImg.set({
            left: cropBounds.left + cropBounds.width / 2,
            top: cropBounds.top + cropBounds.height / 2,
            originX: 'center',
            originY: 'center'
        });

        // Remove original elements
        canvas.remove(originalImage);
        cleanupCropMode();

        // Add cropped image
        canvas.add(croppedImg);
        canvas.setActiveObject(croppedImg);
        canvas.renderAll();
    });
}

function cancelCrop() {
    if (originalImage && originalImageState) {
        originalImage.set(originalImageState);
    }
    cleanupCropMode();
    canvas.renderAll();
}

function cleanupCropMode() {
    // Remove crop-related objects
    [cropRect, darkOverlay].forEach(obj => {
        if (obj) {
            canvas.remove(obj);
        }
    });

    // Remove crop controls
    const cropControls = document.getElementById('cropControls');
    if (cropControls) {
        cropControls.remove();
    }

    // Reset states
    cropRect = null;
    darkOverlay = null;
    originalImage = null;
    originalImageState = null;
    isCropping = false;
}