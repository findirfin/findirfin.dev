const memeImage = document.getElementById('memeImage');
const memeContainer = document.getElementById('memeContainer');
const imageFileInput = document.getElementById('imageFile');
const imageUrlInput = document.getElementById('imageUrl');
const loadUrlImageButton = document.getElementById('loadUrlImage');
const createMemeButton = document.getElementById('createMeme');
const newTextInput = document.getElementById('newTextInput');
const addTextBtn = document.getElementById('addTextBtn');
const fontSizeSelect = document.getElementById('fontSize');
const fontFamilySelect = document.getElementById('fontFamily');
const topTextInput = document.getElementById('topTextInput');
const bottomTextInput = document.getElementById('bottomTextInput');
const topTextOutput = document.getElementById('topTextOutput');
const bottomTextOutput = document.getElementById('bottomTextOutput');
const uploadTab = document.getElementById('uploadTab');
const urlTab = document.getElementById('urlTab');
const uploadSection = document.getElementById('uploadSection');
const urlSection = document.getElementById('urlSection');

const defaultImageSrc = 'https://findirfin.dev/editor/assets/placeholder.png';
let isDefaultImage = true;

function setImage(src) {
    isDefaultImage = false;
    memeImage.src = src;
    memeImage.onload = () => {
        enableInputs();
        updateMemeText();
    };
}

function resetToDefaultImage() {
    if (!isDefaultImage) {
        memeImage.src = defaultImageSrc;
        isDefaultImage = true;
        disableInputs();
    }
}

function enableInputs() {
    createMemeButton.disabled = false;
    newTextInput.disabled = false;
    addTextBtn.disabled = false;
    fontSizeSelect.disabled = false;
    fontFamilySelect.disabled = false;
    topTextInput.disabled = false;
    bottomTextInput.disabled = false;
}

function disableInputs() {
    createMemeButton.disabled = true;
    newTextInput.disabled = true;
    addTextBtn.disabled = true;
    fontSizeSelect.disabled = true;
    fontFamilySelect.disabled = true;
    topTextInput.disabled = true;
    bottomTextInput.disabled = true;
}

// Modify the updateMemeText function to force a layout recalculation
function updateMemeText() {
    updateAndResizeText(topTextOutput, topTextInput.value || 'Top Text', true);
    updateAndResizeText(bottomTextOutput, bottomTextInput.value || 'Bottom Text', false);
    
    // Force a layout recalculation
    void topTextOutput.offsetHeight;
    void bottomTextOutput.offsetHeight;
}

// Add an event listener for image load to ensure text is sized correctly when image dimensions change
memeImage.addEventListener('load', updateMemeText);



function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

function isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
}

function updateAndResizeText(textElement, text, isTop) {
    textElement.textContent = text;
    
    const maxWidth = memeImage.offsetWidth * 0.9;
    const maxHeight = memeImage.offsetHeight * (isMobile() ? 0.3 : 0.2); // Increased height allowance for mobile
    
    const minFontSize = isMobile() ? 24 : 16; // Larger minimum font size for mobile
    const maxFontSize = isMobile() ? 60 : 100; // Adjusted maximum font size for mobile
    let fontSize = maxFontSize;

    textElement.style.width = maxWidth + 'px';
    textElement.style.whiteSpace = 'nowrap'; // Prevent wrapping for accurate width measurement

    const fontFamily = window.getComputedStyle(textElement).fontFamily;

    do {
        textElement.style.fontSize = `${fontSize}px`;
        const textWidth = getTextWidth(text, `${fontSize}px ${fontFamily}`);

        if (textWidth <= maxWidth && textElement.offsetHeight <= maxHeight) {
            break; // Font size is good
        }

        fontSize -= 1;
    } while (fontSize > minFontSize);

    textElement.style.whiteSpace = 'normal'; // Allow wrapping for final display

    // Position the text
    textElement.style.left = '50%';
    textElement.style.transform = 'translateX(-50%)';
    
    if (isTop) {
        textElement.style.top = '5%';
    } else {
        textElement.style.bottom = '5%';
    }

    // Adjust line height for better readability, especially on mobile
    textElement.style.lineHeight = isMobile() ? '1.2' : '1';
}

function updateMemeText() {
    updateAndResizeText(topTextOutput, topTextInput.value || 'Top Text', true);
    updateAndResizeText(bottomTextOutput, bottomTextInput.value || 'Bottom Text', false);
    
    // Force a layout recalculation
    void topTextOutput.offsetHeight;
    void bottomTextOutput.offsetHeight;
}




function addMemeText(text) {
    const textElement = document.createElement('div');
    textElement.className = 'meme-text';
    textElement.textContent = text;
    textElement.style.fontSize = fontSizeSelect.value;
    textElement.style.fontFamily = fontFamilySelect.value;
    textElement.style.left = '50%';
    textElement.style.top = '50%';
    textElement.style.transform = 'translate(-50%, -50%)';

    memeContainer.appendChild(textElement);
    makeDraggable(textElement);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.transform = 'none';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function switchTab(activeTab, activeSection, inactiveTab, inactiveSection) {
    activeTab.classList.add('active');
    activeSection.classList.add('active');
    inactiveTab.classList.remove('active');
    inactiveSection.classList.remove('active');
  }
  
  uploadTab.addEventListener('click', () => {
    switchTab(uploadTab, uploadSection, urlTab, urlSection);
  });
  
  urlTab.addEventListener('click', () => {
    switchTab(urlTab, urlSection, uploadTab, uploadSection);
  });
  

imageFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(file);
    }
});

loadUrlImageButton.addEventListener('click', () => {
    const imageUrl = imageUrlInput.value.trim();
    if (imageUrl) {
        setImage(imageUrl);
    } else {
        alert('Please enter a valid image URL');
    }
});

memeImage.addEventListener('error', () => {
    if (!isDefaultImage) {
        alert('Failed to load image. Please try another URL or file.');
        resetToDefaultImage();
    }
});

addTextBtn.addEventListener('click', () => {
    const text = newTextInput.value.trim();
    if (text) {
        addMemeText(text);
        newTextInput.value = '';
    }
});

topTextInput.addEventListener('input', updateMemeText);
bottomTextInput.addEventListener('input', updateMemeText);

createMemeButton.addEventListener('click', () => {
    html2canvas(memeContainer, {
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        canvas.toBlob(blob => {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile && navigator.share) {
                const file = new File([blob], 'meme.png', { type: 'image/png' });
                navigator.share({
                    files: [file],
                    title: 'Check out my meme!',
                    text: 'I created this meme using the Advanced Meme Creator.'
                }).then(() => console.log('Shared successfully'))
                  .catch((error) => console.log('Error sharing:', error));
            } else {
                const link = document.createElement('a');
                link.download = 'meme.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }
        }, 'image/png');
    });
});

// Initialize default text
updateMemeText();
makeDraggable(topTextOutput);
makeDraggable(bottomTextOutput);

// Handle window resize
window.addEventListener('resize', updateMemeText);

// Add event listeners for orientation change and resize
window.addEventListener('orientationchange', updateMemeText);
window.addEventListener('resize', updateMemeText);

// Initial call to set up text
updateMemeText();

// Initial state
disableInputs();