const topTextInput = document.getElementById('topText');
const bottomTextInput = document.getElementById('bottomText');
const topTextOutput = document.getElementById('topTextOutput');
const bottomTextOutput = document.getElementById('bottomTextOutput');
const createMemeButton = document.getElementById('createMeme');
const imageFileInput = document.getElementById('imageFile');
const imageUrlInput = document.getElementById('imageUrl');
const loadUrlImageButton = document.getElementById('loadUrlImage');
const memeImage = document.getElementById('memeImage');
const memeContainer = document.getElementById('memeContainer');
const memeTypeSelect = document.getElementById('memeType');
const simpleTextInputs = document.getElementById('simpleTextInputs');
const customTextContainer = document.getElementById('customTextContainer');
const customTextInput = customTextContainer.querySelector('input');
const addTextBtn = customTextContainer.querySelector('button');
const simpleFont = document.getElementById('simpleFont');
const customFontSize = document.getElementById('customFontSize');
const customFont = document.getElementById('customFont');

const defaultImageSrc = '/api/placeholder/600/400';
let isDefaultImage = true;

function updateSimpleMemeText() {
    topTextOutput.textContent = topTextInput.value;
    bottomTextOutput.textContent = bottomTextInput.value;
    fitTextToContainer(topTextOutput);
    fitTextToContainer(bottomTextOutput);
}

function fitTextToContainer(element) {
    const maxWidth = memeImage.offsetWidth * 0.9;
    const maxHeight = memeImage.offsetHeight * 0.25;
    let fontSize = 100;
    element.style.fontSize = fontSize + 'px';

    while ((element.offsetWidth > maxWidth || element.offsetHeight > maxHeight) && fontSize > 10) {
        fontSize--;
        element.style.fontSize = fontSize + 'px';
    }
}

function setImage(src) {
    isDefaultImage = false;
    memeImage.src = src;
    memeImage.onload = () => {
        enableInputs();
        updateSimpleMemeText();
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
    if (memeTypeSelect.value === 'simple') {
        topTextInput.disabled = false;
        bottomTextInput.disabled = false;
        simpleFont.disabled = false;
    } else {
        customTextInput.disabled = false;
        addTextBtn.disabled = false;
        customFontSize.disabled = false;
        customFont.disabled = false;
    }
}

function disableInputs() {
    topTextInput.disabled = true;
    bottomTextInput.disabled = true;
    customTextInput.disabled = true;
    addTextBtn.disabled = true;
    createMemeButton.disabled = true;
    simpleFont.disabled = true;
    customFontSize.disabled = true;
    customFont.disabled = true;
    topTextInput.value = '';
    bottomTextInput.value = '';
    updateSimpleMemeText();
}

function switchMemeType() {
    if (memeTypeSelect.value === 'simple') {
        simpleTextInputs.style.display = 'block';
        customTextContainer.style.display = 'none';
        topTextOutput.style.display = 'block';
        bottomTextOutput.style.display = 'block';
        updateSimpleMemeText();
    } else {
        simpleTextInputs.style.display = 'none';
        customTextContainer.style.display = 'block';
        topTextOutput.style.display = 'none';
        bottomTextOutput.style.display = 'none';
    }
    if (!isDefaultImage) {
        enableInputs();
    }
}

function addCustomText() {
    const text = customTextInput.value.trim();
    if (text) {
        const textElement = document.createElement('div');
        textElement.className = 'meme-text';
        textElement.textContent = text;
        textElement.style.left = '50%';
        textElement.style.top = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.fontSize = customFontSize.value;
        textElement.style.fontFamily = customFont.value;
        memeContainer.appendChild(textElement);
        customTextInput.value = '';
        makeDraggable(textElement);
    }
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
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

topTextInput.addEventListener('input', updateSimpleMemeText);
bottomTextInput.addEventListener('input', updateSimpleMemeText);
memeTypeSelect.addEventListener('change', switchMemeType);
simpleFont.addEventListener('change', updateSimpleMemeText);

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

createMemeButton.addEventListener('click', () => {
    const customInputDisplay = customTextContainer.style.display;
    customTextContainer.style.display = 'none';

    html2canvas(memeContainer, {
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        customTextContainer.style.display = customInputDisplay;

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
                // Download the image on desktop platforms
                const link = document.createElement('a');
                link.download = 'meme.png';
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }
        }, 'image/png');
    });
});

addTextBtn.addEventListener('click', addCustomText);

window.addEventListener('resize', updateSimpleMemeText);

// Initial state
switchMemeType();
disableInputs();