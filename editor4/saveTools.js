export function saveMeme(canvas) {
    console.log('Saving meme...');
    const objects = canvas.getObjects();
    if (objects.length === 0) {
        console.log('Canvas is empty');
        alert('The canvas is empty. Add some content before saving.');
        return;
    }

    try {
        console.log('Calculating bounding box');
        const boundingBox = getContentBoundingBox(objects, canvas);
        console.log('Bounding box:', boundingBox);

        console.log('Cropping canvas');
        const croppedCanvas = cropCanvas(canvas, boundingBox);

        if (!croppedCanvas.toBlob) {
            console.error('toBlob not supported');
            alert('Your browser does not support the required functionality to save images.');
            return;
        }

        console.log('Creating blob');
        croppedCanvas.toBlob(function(blob) {
            if (!blob) {
                console.error('Blob creation failed');
                alert('Failed to create image data. Please try again.');
                return;
            }

            try {
                const fileName = `meme_${new Date().getTime()}.png`;
                console.log('Saving file:', fileName);
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    saveForMobile(blob, fileName);
                } else {
                    saveForDesktop(blob, fileName);
                }
                console.log('Meme saved successfully');
            } catch (error) {
                console.error('Error in save process:', error);
                alert('An error occurred while saving the meme. Please try again.');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error in saveMeme function:', error);
        alert('An unexpected error occurred. Please check the console for more information.');
    }
}

function getContentBoundingBox(objects, canvas) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    objects.forEach(obj => {
        const objBoundingRect = obj.getBoundingRect(true, true);
        minX = Math.min(minX, objBoundingRect.left);
        minY = Math.min(minY, objBoundingRect.top);
        maxX = Math.max(maxX, objBoundingRect.left + objBoundingRect.width);
        maxY = Math.max(maxY, objBoundingRect.top + objBoundingRect.height);
    });

    return {
        left: Math.max(0, Math.floor(minX) - 10),
        top: Math.max(0, Math.floor(minY) - 10),
        width: Math.min(canvas.width, Math.ceil(maxX - minX) + 20),
        height: Math.min(canvas.height, Math.ceil(maxY - minY) + 20)
    };
}

function cropCanvas(canvas, boundingBox) {
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');

    tempCanvas.width = boundingBox.width;
    tempCanvas.height = boundingBox.height;

    tempContext.drawImage(
        canvas.lowerCanvasEl,
        boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height,
        0, 0, boundingBox.width, boundingBox.height
    );

    return tempCanvas;
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