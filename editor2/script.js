let canvas;
let isDrawing = false;
let isAllCaps = true; // New variable to track all caps state

document.addEventListener('DOMContentLoaded', function() {
    canvas = new fabric.Canvas('memeCanvas');
    canvas.isDrawingMode = false;

    // Customize controls
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = 'white';
    fabric.Object.prototype.cornerStrokeColor = '#444444';
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.borderColor = '#444444';
    fabric.Object.prototype.cornerSize = 12;
    fabric.Object.prototype.cornerStrokeWidth = 2;

    // Change selection color for objects
    fabric.Object.prototype.set({
        borderColor: '#2c3e50',
        borderScaleFactor: 2,
        borderDashArray: [5, 5]
    });

    // Change selection rectangle color and style
    canvas.selectionColor = 'rgba(46, 204, 113, 0.2)';
    canvas.selectionBorderColor = '#27ae60';
    canvas.selectionLineWidth = 2;
    canvas.selectionDashArray = [6, 6];

    // Add rotation cursor
    fabric.Object.prototype.controls.mtr.cursorStyle = 'pointer';


    fabric.Image.filters.PoliticalPoster = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
        type: 'PoliticalPoster',
    
        applyTo2d: function(options) {
            var imageData = options.imageData,
                data = imageData.data,
                len = data.length,
                i;
    
            for (i = 0; i < len; i += 4) {
                var r = data[i];
                var g = data[i + 1];
                var b = data[i + 2];
    
                // Convert to grayscale
                var gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
                // Apply high contrast
                gray = gray > 128 ? 255 : 0;
    
                // Apply a color tint (e.g., red for this example)
                data[i] = gray + 50; // Red channel
                data[i + 1] = gray * 0.7; // Green channel
                data[i + 2] = gray * 0.7; // Blue channel
            }
        }
    });
    
    fabric.Image.filters.PoliticalPoster.fromObject = fabric.Image.filters.BaseFilter.fromObject;
    


    // Image upload
    document.getElementById('imageUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        loadImageToCanvas(file);
    });

    // Collapsible functionality
    const collapsibles = document.querySelectorAll(".collapse-btn");
    collapsibles.forEach(coll => {
        coll.addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Text editing options
    document.getElementById('fontFamily').addEventListener('change', updateTextStyle);
    document.getElementById('fontSize').addEventListener('change', updateTextStyle);
    document.getElementById('fontColor').addEventListener('change', updateTextStyle);
    document.getElementById('boldBtn').addEventListener('click', toggleBold);
    document.getElementById('italicBtn').addEventListener('click', toggleItalic);
    document.getElementById('underlineBtn').addEventListener('click', toggleUnderline);
    document.getElementById('allCapsBtn').addEventListener('click', toggleAllCaps); // New event listener

    // Add text button
    document.getElementById('addTextBtn').addEventListener('click', function() {
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

        // Apply all caps if it's enabled
        if (isAllCaps) {
            text.on('changed', function() {
                this.text = this.text.toUpperCase();
            });
        }

        canvas.add(text);
        canvas.setActiveObject(text);
        updateTextStyleControls(text);
    });

    // Image filter
    fabric.Image.filters.PoliticalPoster = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
        type: 'PoliticalPoster',
    
        applyTo2d: function(options) {
            var imageData = options.imageData,
                data = imageData.data,
                len = data.length,
                i;
    
            for (i = 0; i < len; i += 4) {
                var r = data[i];
                var g = data[i + 1];
                var b = data[i + 2];
    
                // Convert to grayscale
                var gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
                // Apply high contrast
                gray = gray > 128 ? 255 : 0;
    
                // Apply a color tint (e.g., red for this example)
                data[i] = gray + 50; // Red channel
                data[i + 1] = gray * 0.7; // Green channel
                data[i + 2] = gray * 0.7; // Blue channel
            }
        }
    });
    
    fabric.Image.filters.PoliticalPoster.fromObject = fabric.Image.filters.BaseFilter.fromObject;
    

    // Draw on image
    document.getElementById('drawBtn').addEventListener('click', function() {
        canvas.isDrawingMode = !canvas.isDrawingMode;
        this.textContent = canvas.isDrawingMode ? 'Stop Drawing' : 'Draw on Image';
    });

    document.getElementById('drawColor').addEventListener('change', function(e) {
        canvas.freeDrawingBrush.color = e.target.value;
    });

    document.getElementById('drawSize').addEventListener('change', function(e) {
        canvas.freeDrawingBrush.width = parseInt(e.target.value, 10);
    });

    // Add image dropdown functionality
    const addImageButton = document.querySelector('.add-image-button');
    const addImageDropdown = document.querySelector('.add-image-dropdown');

    addImageButton.addEventListener('click', function(e) {
        e.stopPropagation();
        addImageDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
        if (!addImageDropdown.contains(e.target) && e.target !== addImageButton) {
            addImageDropdown.classList.remove('active');
        }
    });

    // Custom image upload to library
    document.getElementById('addToLibraryBtn').addEventListener('click', function() {
        const fileInput = document.getElementById('customImageUpload');
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                addImageToLibrary(e.target.result);
                addImageDropdown.classList.remove('active');
                fileInput.value = ''; // Clear the file input
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image to add to the library.');
        }
    });

    // Image library functionality
    document.querySelectorAll('.image-library img').forEach(img => {
        img.addEventListener('click', function() {
            fabric.Image.fromURL(this.src, function(img) {
                img.scale(0.5);
                canvas.add(img);
            });
        });
    });

    // Save meme
    document.getElementById('saveMemeBtn').addEventListener('click', function() {
        if (!canvas.lowerCanvasEl.toBlob) {
            alert('Your browser does not support the required functionality to save images.');
            return;
        }

        canvas.lowerCanvasEl.toBlob(function(blob) {
            try {
                const timestamp = new Date().getTime();
                const fileName = `meme_${timestamp}.png`;

                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const link = document.createElement('a');
                        link.download = fileName;
                        link.href = e.target.result;
                        link.click();
                    };
                    reader.readAsDataURL(blob);
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            } catch (error) {
                console.error('Error saving meme:', error);
                alert('An error occurred while saving the meme. Please try again.');
            }
        }, 'image/png');
    });

    // Initialize the carousel
    initCarousel();

    // New event listener for object selection
    canvas.on('object:selected', function(e) {
        const selectedObject = e.target;
        if (selectedObject.type === 'i-text') {
            updateTextStyleControls(selectedObject);
        }
    });

    // Initialize the all caps button state
    document.getElementById('allCapsBtn').classList.add('active');
});

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

function addImageToLibrary(imageUrl) {
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

function initCarousel() {
    const content = document.querySelector('.carousel-content');
    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');
    const scrollAmount = 100; // Width of one image

    prevBtn.addEventListener('click', () => {
        content.scrollBy(-scrollAmount, 0);
    });

    nextBtn.addEventListener('click', () => {
        content.scrollBy(scrollAmount, 0);
    });

    // Add click event listeners to template images
    const templateImages = document.querySelectorAll('.carousel-content img');
    templateImages.forEach(img => {
        img.addEventListener('click', function() {
            const template = this.getAttribute('data-template');
            applyMemeTemplate(template);
        });
    });
}

function convertToUppercase() {
    if (isAllCaps) {
        canvas.getObjects('i-text').forEach(function(textObject) {
            textObject.text = textObject.text.toUpperCase();
            textObject.on('changed', function() {
                this.text = this.text.toUpperCase();
            });
        });
        canvas.renderAll();
    }
}

function applyMemeTemplate(template) {
    if (template === 'blank') {
        canvas.clear();
        canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    } else {
        fabric.Image.fromURL(`editor2/assets/${template}.png`, function(img) {
            canvas.clear(); // Clear the canvas before adding the new template
            const scaleFactor = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            
            img.set({
                scaleX: scaleFactor,
                scaleY: scaleFactor,
                left: (canvas.width - img.width * scaleFactor) / 2,
                top: (canvas.height - img.height * scaleFactor) / 2
            });
            
            canvas.add(img);
            convertToUppercase(); // Convert any existing text to uppercase
            canvas.renderAll();
        });
    }
}

function loadImageToCanvas(file) {
    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, function(img) {
            canvas.clear(); // Clear the canvas before adding the new image
            const scaleFactor = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            
            img.set({
                scaleX: scaleFactor,
                scaleY: scaleFactor,
                left: (canvas.width - img.width * scaleFactor) / 2,
                top: (canvas.height - img.height * scaleFactor) / 2
            });
            
            canvas.add(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
}