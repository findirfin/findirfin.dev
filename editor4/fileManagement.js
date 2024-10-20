const { fabric } = window;

let canvas;

export function initializeFileManagement(fabricCanvas) {
    canvas = fabricCanvas;

    // Set up event listeners for file management buttons
    document.getElementById('importImageBtn').addEventListener('click', importImage);
    document.getElementById('addImageBtn').addEventListener('click', addImage);
    document.getElementById('saveImageBtn').addEventListener('click', saveMeme);
}

function importImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgObj = new Image();
                imgObj.src = event.target.result;
                imgObj.onload = () => {
                    const image = new fabric.Image(imgObj);
                    canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas), {
                        scaleX: canvas.width / image.width,
                        scaleY: canvas.height / image.height
                    });
                }
            }
            reader.readAsDataURL(file);
        }
    }
    input.click();
}

function addImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                fabric.Image.fromURL(event.target.result, (img) => {
                    img.scaleToWidth(200); // Set a default width
                    canvas.add(img);
                    canvas.setActiveObject(img);
                    canvas.renderAll();
                });
            }
            reader.readAsDataURL(file);
        }
    }
    input.click();
}

function saveMeme() {
    // Temporarily hide the editing menus
    const imageEditMenu = document.getElementById('imageEditMenu');
    const textEditMenu = document.getElementById('textEditMenu');
    const originalImageEditDisplay = imageEditMenu.style.display;
    const originalTextEditDisplay = textEditMenu.style.display;
    imageEditMenu.style.display = 'none';
    textEditMenu.style.display = 'none';

    // Create a temporary canvas with a white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempContext = tempCanvas.getContext('2d');
    tempContext.fillStyle = '#ffffff';
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the main canvas content onto the temporary canvas
    tempContext.drawImage(canvas.lowerCanvasEl, 0, 0);

    // Convert the temporary canvas to a data URL
    const dataURL = tempCanvas.toDataURL({
        format: 'png',
        quality: 1
    });

    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'meme.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Restore the editing menus
    imageEditMenu.style.display = originalImageEditDisplay;
    textEditMenu.style.display = originalTextEditDisplay;
}

// Helper function to get the content bounding box
function getContentBoundingBox(canvas) {
    const objects = canvas.getObjects();
    if (objects.length === 0) return null;

    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;

    objects.forEach((obj) => {
        const objBoundingRect = obj.getBoundingRect();
        left = Math.min(left, objBoundingRect.left);
        top = Math.min(top, objBoundingRect.top);
        right = Math.max(right, objBoundingRect.left + objBoundingRect.width);
        bottom = Math.max(bottom, objBoundingRect.top + objBoundingRect.height);
    });

    return {
        left: left,
        top: top,
        width: right - left,
        height: bottom - top
    };
}