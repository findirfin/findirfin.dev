function showLoader() {
    document.getElementById('memeLoader').style.display = 'block';
    document.querySelector('.meme').style.display = 'none';
}

function hideLoader() {
    document.getElementById('memeLoader').style.display = 'none';
    document.querySelector('.meme').style.display = 'block';
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

            ctx.drawImage(img, 0, 0);

            ctx.font = '20px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
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
            memeImg.onload = hideLoader; // Hide loader when the image has loaded
        })
        .catch(error => {
            console.error('Error adding watermark:', error);
            const memeImg = document.querySelector(".meme");
            memeImg.src = imageUrl;
            memeImg.onload = hideLoader; // Hide loader even if watermarking fails
        });
    
    const millisecondsInYear = new Date(today.getFullYear() + 1, 0, 1) - new Date(today.getFullYear(), 0, 1);
    const millisecondsElapsed = today - new Date(today.getFullYear(), 0, 1);
    const percentage = (millisecondsElapsed / millisecondsInYear) * 100;
    document.getElementById("percentage").textContent = `${percentage.toFixed(2)}% of the year has passed.`;
}

document.addEventListener('DOMContentLoaded', updateMemeWithWatermark);