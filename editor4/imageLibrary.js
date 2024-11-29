let db;
const DB_NAME = 'MemeCreatorDB';
const STORE_NAME = 'imagePacks';

async function initializeImageLibrary(canvas) {
    try {
        await initDB();
        setupEventListeners(canvas);
        await loadAllImages(canvas);
    } catch (error) {
        console.error("Error initializing image library:", error);
    }
}

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onerror = (event) => reject(new Error("IndexedDB error: " + event.target.error));
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
    });
}

async function addImageToLibrary(file, canvas) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                
                const imageObject = {
                    id: Date.now().toString(),
                    name: file.name,
                    url: event.target.result,
                    dateAdded: new Date().toISOString()
                };
                
                const request = store.add(imageObject);
                request.onsuccess = async () => {
                    await loadAllImages(canvas);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function loadAllImages(canvas) {
    const imageLibrary = document.getElementById('imageLibrary');
    if (!imageLibrary) return;

    imageLibrary.innerHTML = '';
    
    // Create custom pack section
    const customPackDiv = document.createElement('div');
    customPackDiv.className = 'image-pack';
    customPackDiv.innerHTML = `
        <h4>Your Custom Images</h4>
        <div class="pack-images" id="customPackImages"></div>
    `;
    imageLibrary.appendChild(customPackDiv);

    try {
        // Load custom images
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            const customImages = request.result || [];
            const customPackContainer = document.getElementById('customPackImages');
            
            customImages.forEach(image => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'image-container';
                imgDiv.innerHTML = `
                    <img src="${image.url}" alt="${image.name}" title="${image.name}"
                         draggable="true">
                    <button class="delete-image" data-id="${image.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                customPackContainer.appendChild(imgDiv);
            });
        };
    } catch (error) {
        console.error("Error loading custom images:", error);
    }
}

function setupEventListeners(canvas) {
    const importPackBtn = document.getElementById('importPackBtn');
    const addToLibraryBtn = document.getElementById('addToLibraryBtn');
    const imageLibrary = document.getElementById('imageLibrary');

    // Add to Library button
    if (addToLibraryBtn) {
        addToLibraryBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                if (e.target.files && e.target.files[0]) {
                    try {
                        await addImageToLibrary(e.target.files[0], canvas);
                    } catch (error) {
                        console.error("Error adding image:", error);
                    }
                }
            };
            input.click();
        };
    }

    // Import Pack button
    if (importPackBtn) {
        importPackBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.directory = true;
            input.multiple = true;
            input.onchange = async (e) => {
                if (e.target.files.length > 0) {
                    try {
                        // Group files by their parent directory
                        const files = Array.from(e.target.files);
                        const packName = files[0].webkitRelativePath.split('/')[0];
                        
                        // Create pack container
                        const packDiv = document.createElement('div');
                        packDiv.className = 'image-pack';
                        packDiv.innerHTML = `
                            <h4>${packName}</h4>
                            <div class="pack-images" id="${packName}Images"></div>
                        `;
                        imageLibrary.appendChild(packDiv);

                        // Add images to pack
                        const packContainer = packDiv.querySelector('.pack-images');
                        for (const file of files) {
                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const imgDiv = document.createElement('div');
                                    imgDiv.className = 'image-container';
                                    imgDiv.innerHTML = `
                                        <img src="${e.target.result}" 
                                             alt="${file.name}"
                                             title="${file.name}"
                                             draggable="true">
                                    `;
                                    packContainer.appendChild(imgDiv);
                                };
                                reader.readAsDataURL(file);
                            }
                        }
                    } catch (error) {
                        console.error("Error importing pack:", error);
                    }
                }
            };
            input.click();
        };
    }

    // Delete button handling
    if (imageLibrary) {
        imageLibrary.onclick = async (e) => {
            const deleteBtn = e.target.closest('.delete-image');
            if (deleteBtn) {
                const imageId = deleteBtn.dataset.id;
                try {
                    const transaction = db.transaction([STORE_NAME], 'readwrite');
                    const store = transaction.objectStore(STORE_NAME);
                    await store.delete(imageId);
                    await loadAllImages(canvas);
                } catch (error) {
                    console.error("Error deleting image:", error);
                }
            }
        };
    }
}

function addImageToCanvas(canvas, src) {
    if (!src) return;
    
    fabric.Image.fromURL(src, (img) => {
        img.scaleToWidth(200);
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

export { initializeImageLibrary, addImageToLibrary, addImageToCanvas };