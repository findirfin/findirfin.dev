let canvas;
let isDrawing = false;

document.addEventListener('DOMContentLoaded', function() {
    canvas = new fabric.Canvas('memeCanvas');
    canvas.isDrawingMode = false;

    // Image upload
    document.getElementById('imageUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(f) {
            fabric.Image.fromURL(f.target.result, function(img) {
                // Calculate scaling factor to fit image within canvas
                const scaleFactor = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                
                // Set image as background
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    // Center the image
                    left: (canvas.width - img.width * scaleFactor) / 2,
                    top: (canvas.height - img.height * scaleFactor) / 2
                });
            });
        };
        reader.readAsDataURL(file);
    });

   // Collapsible functionality
   const coll = document.querySelector(".collapse-btn");
   coll.addEventListener("click", function() {
       this.classList.toggle("active");
       const content = this.nextElementSibling;
       if (content.style.maxHeight) {
           content.style.maxHeight = null;
       } else {
           content.style.maxHeight = content.scrollHeight + "px";
       }
   });

   // Text editing options
   document.getElementById('fontFamily').addEventListener('change', updateTextStyle);
   document.getElementById('fontSize').addEventListener('change', updateTextStyle);
   document.getElementById('fontColor').addEventListener('change', updateTextStyle);
   document.getElementById('boldBtn').addEventListener('click', toggleBold);
   document.getElementById('italicBtn').addEventListener('click', toggleItalic);
   document.getElementById('underlineBtn').addEventListener('click', toggleUnderline);

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

   // Modify the addTextBtn event listener
   document.getElementById('addTextBtn').addEventListener('click', function() {
       const text = new fabric.IText('Enter text', {
           left: 50,
           top: 50,
           fontFamily: document.getElementById('fontFamily').value,
           fontSize: parseInt(document.getElementById('fontSize').value),
           fill: document.getElementById('fontColor').value
       });
       canvas.add(text);
       canvas.setActiveObject(text);
   });


    // Meme template
    document.getElementById('memeTemplate').addEventListener('change', function(e) {
        const template = e.target.value;
        if (template) {
            fabric.Image.fromURL(`${template}.jpg`, function(img) {
                // Use the same scaling logic for templates
                const scaleFactor = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    left: (canvas.width - img.width * scaleFactor) / 2,
                    top: (canvas.height - img.height * scaleFactor) / 2
                });
            });
        }
    });

    // Image filter
    document.getElementById('imageFilter').addEventListener('change', function(e) {
        const filter = e.target.value;
        if (filter) {
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'image') {
                    obj.filters = [];
                    obj.filters.push(new fabric.Image.filters[filter.charAt(0).toUpperCase() + filter.slice(1)]());
                    obj.applyFilters();
                }
            });
            canvas.renderAll();
        }
    });


    

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

    // Image library
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
});