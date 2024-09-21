function showLoader() {
    document.getElementById('memeLoader').style.display = 'block';
    document.querySelector('.meme').style.display = 'none';
}

function hideLoader() {
    document.getElementById('memeLoader').style.display = 'none';
    document.querySelector('.meme').style.display = 'block';
}


async function shareMeme() {
    const memeImg = document.querySelector(".meme");
    const shareUrl = 'https://findirfin.dev/lotr-memes';
    const shareText = 'Check out today\'s Lord of the Rings meme!';
    const formattedDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    if (navigator.share) {
        try {
            const response = await fetch(memeImg.src);
            const blob = await response.blob();
            const file = new File([blob], `lotr-meme-${formattedDate}.png`, { type: 'image/png' });

            await navigator.share({
                title: document.title,
                text: shareText,
                url: shareUrl,
                files: [file]
            });
            console.log('Shared successfully');
        } catch (error) {
            console.log('Error sharing:', error);
            // Fallback to download if sharing fails
            downloadMeme();
        }
    } else {
        // Fallback: download the image
        downloadMeme();
    }
}

function downloadMeme() {
    const memeImg = document.querySelector(".meme");
    const formattedDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = memeImg.src;
    a.download = `lotr-meme-${formattedDate}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function addWatermarkToMeme(imageUrl, watermarkText) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            // Draw the original image
            ctx.drawImage(img, 0, 0);

            // Set up watermark text
            ctx.font = 'bold 20px Arial';
            const textMetrics = ctx.measureText(watermarkText);
            const textWidth = textMetrics.width;
            const textHeight = 20; // Approximate height of the text

            // Set up background
            const padding = 5;
            const bgWidth = textWidth + (padding * 2);
            const bgHeight = textHeight + (padding * 2);
            const bgX = canvas.width - bgWidth - 10;
            const bgY = canvas.height - bgHeight - 10;

            // Draw semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

            // Draw watermark text
            ctx.fillStyle = 'white';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(watermarkText, canvas.width - 10, canvas.height - 10);

            resolve(canvas.toDataURL());
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
}

function updateMemeWithWatermark() {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    
    document.title = `LOTR Meme | ${formattedDate}`;
    
    const imageUrl = `https://findirfin.dev/lotr-memes/images/${formattedDate}.png`;
    
    showLoader(); // Show loader before starting to load and process the image

    addWatermarkToMeme(imageUrl, 'findirfin.dev/lotr-memes')
    .then(watermarkedImageUrl => {
        const memeImg = document.querySelector(".meme");
        memeImg.src = watermarkedImageUrl;
        memeImg.alt = `Lord of the Rings meme for ${formattedDate}`;
        memeImg.onload = () => {
            hideLoader();
            document.getElementById('shareButton').style.display = 'inline-block'; // Show share button after meme loads
        };
    })
    .catch(error => {
        console.error('Error adding watermark:', error);
        const memeImg = document.querySelector(".meme");
        memeImg.src = imageUrl;
        memeImg.onload = () => {
            hideLoader();
            document.getElementById('shareButton').style.display = 'inline-block'; // Show share button even if watermarking fails
        };
    });
    const millisecondsInYear = new Date(today.getFullYear() + 1, 0, 1) - new Date(today.getFullYear(), 0, 1);
    const millisecondsElapsed = today - new Date(today.getFullYear(), 0, 1);
    const percentage = (millisecondsElapsed / millisecondsInYear) * 100;
    document.getElementById("percentage").textContent = `${percentage.toFixed(2)}% of the year has passed.`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateMemeWithWatermark();
    document.getElementById('shareButton').addEventListener('click', shareMeme);
});
