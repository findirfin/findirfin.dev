// Clipboard handler with proper rotation handling
let canvas;

export function initializeClipboardHandler(fabricCanvas) {
    canvas = fabricCanvas;
    document.addEventListener('paste', handlePaste);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
}

function handlePaste(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    e.preventDefault();
    const items = e.clipboardData.items;
    
    // Handle images
    for (const item of Array.from(items)) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            const reader = new FileReader();
            
            reader.onload = function(event) {
                fabric.Image.fromURL(event.target.result, function(img) {
                    const maxSize = Math.min(canvas.width, canvas.height) * 0.8;
                    if (img.width > maxSize || img.height > maxSize) {
                        const scale = maxSize / Math.max(img.width, img.height);
                        img.scale(scale);
                    }

                    img.set({
                        left: canvas.width / 2,
                        top: canvas.height / 2,
                        originX: 'center',
                        originY: 'center'
                    });

                    canvas.add(img);
                    canvas.setActiveObject(img);
                    canvas.requestRenderAll();
                });
            };
            reader.readAsDataURL(file);
            return;
        }
    }
    
    // Handle text
    const text = e.clipboardData.getData('text/plain');
    if (text) {
        const textbox = new fabric.IText(text, {
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            fontFamily: 'Impact',
            fontSize: 40,
            fill: 'white',
            textAlign: 'center',
            stroke: '#000000',
            strokeWidth: 1,
            strokeUniform: true
        });

        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.requestRenderAll();
    }
}

async function handleCopy(e) {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    e.preventDefault();

    if (activeObject.type === 'i-text' || activeObject.type === 'textbox') {
        e.clipboardData.setData('text/plain', activeObject.text);
        return;
    }

    if (activeObject.type === 'image') {
        try {
            const imgEl = activeObject.getElement();
            const angle = activeObject.angle || 0;
            const radians = angle * Math.PI / 180;
            
            // Calculate dimensions that will fit rotated image
            const originalWidth = activeObject.width * activeObject.scaleX;
            const originalHeight = activeObject.height * activeObject.scaleY;
            
            // Calculate the dimensions needed to fit the rotated image
            const absCos = Math.abs(Math.cos(radians));
            const absSin = Math.abs(Math.sin(radians));
            const newWidth = originalWidth * absCos + originalHeight * absSin;
            const newHeight = originalWidth * absSin + originalHeight * absCos;

            // Create temporary canvas with the new dimensions
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = Math.round(newWidth);
            tempCanvas.height = Math.round(newHeight);
            const tempCtx = tempCanvas.getContext('2d');

            // Clear the canvas
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // Move to center and rotate
            tempCtx.save();
            tempCtx.translate(newWidth / 2, newHeight / 2);
            
            // Apply transformations
            if (activeObject.angle) {
                tempCtx.rotate(radians);
            }
            if (activeObject.flipX) {
                tempCtx.scale(-1, 1);
            }
            if (activeObject.flipY) {
                tempCtx.scale(1, -1);
            }

            // Draw image centered
            tempCtx.drawImage(
                imgEl, 
                -originalWidth / 2, 
                -originalHeight / 2, 
                originalWidth, 
                originalHeight
            );
            tempCtx.restore();

            // Convert to blob and copy to clipboard
            const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
            const clipboardItem = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([clipboardItem]);
        } catch (error) {
            console.error('Error copying image to clipboard:', error);
        }
    }
}

function handleCut(e) {
    handleCopy(e);
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.requestRenderAll();
    }
}