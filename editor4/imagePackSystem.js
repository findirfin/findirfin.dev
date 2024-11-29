// imageLibrary.js

const DB_NAME = 'MemeCreatorDB';
const STORE_NAME = 'customPack';

class ImageLibrary {
    constructor() {
        this.db = null;
        this.customImages = [];
        this.sitePacks = {};
    }

    async initialize() {
        // Initialize IndexedDB for custom images
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            this.loadCustomImages();
        };

        // Load site packs
        await this.loadSitePacks();
    }

    async loadSitePacks() {
        try {
            // Fetch list of packs from the /packs directory
            const response = await fetch('/packs/');
            const packs = await response.json();
            
            // Display packs in the UI
            const packContainer = document.getElementById('imageLibrary');
            
            // First, show custom pack
            packContainer.innerHTML = `
                <div class="image-pack" id="customPack">
                    <h4>Custom Images</h4>
                    <div class="pack-images" id="customPackImages"></div>
                </div>
            `;

            // Then show site packs
            packs.forEach(packName => {
                const packDiv = document.createElement('div');
                packDiv.className = 'image-pack';
                packDiv.innerHTML = `
                    <h4>${packName}</h4>
                    <div class="pack-images" id="${packName}Images"></div>
                `;
                packContainer.appendChild(packDiv);

                // Load images for this pack
                this.loadPackImages(packName);
            });

        } catch (error) {
            console.error('Error loading packs:', error);
        }
    }

    async loadPackImages(packName) {
        try {
            // Fetch list of images in this pack
            const response = await fetch(`/packs/${packName}/`);
            const images = await response.json();
            
            const packContainer = document.getElementById(`${packName}Images`);
            
            images.forEach(imageName => {
                if (imageName.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    const img = document.createElement('img');
                    img.src = `/packs/${packName}/${imageName}`;
                    img.alt = imageName;
                    img.title = imageName;
                    img.draggable = true;
                    img.addEventListener('click', () => this.addImageToCanvas(img.src));
                    packContainer.appendChild(img);
                }
            });
        } catch (error) {
            console.error(`Error loading images for pack ${packName}:`, error);
        }
    }

    // Handle custom images
    async addCustomImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                const image = {
                    id: Date.now().toString(),
                    name: file.name,
                    url: event.target.result
                };

                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                
                await store.add(image);
                this.customImages.push(image);
                this.updateCustomImagesDisplay();
                resolve(image);
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async loadCustomImages() {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        this.customImages = await store.getAll();
        this.updateCustomImagesDisplay();
    }

    updateCustomImagesDisplay() {
        const container = document.getElementById('customPackImages');
        if (!container) return;

        container.innerHTML = '';
        this.customImages.forEach(image => {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';
            
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = image.name;
            img.title = image.name;
            img.draggable = true;
            img.addEventListener('click', () => this.addImageToCanvas(img.src));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-image';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteCustomImage(image.id);
            };

            imgContainer.appendChild(img);
            imgContainer.appendChild(deleteBtn);
            container.appendChild(imgContainer);
        });
    }

    async deleteCustomImage(imageId) {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await store.delete(imageId);
        
        this.customImages = this.customImages.filter(img => img.id !== imageId);
        this.updateCustomImagesDisplay();
    }

    addImageToCanvas(src) {
        // Add the image to the canvas using fabric.js
        fabric.Image.fromURL(src, (img) => {
            img.scaleToWidth(200); // Default size
            img.set({
                left: canvas.width / 2,
                top: canvas.height / 2,
                originX: 'center',
                originY: 'center'
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    }
}

export default ImageLibrary;