// imageLibrary.js

let db;
const DB_NAME = 'MemeCreatorDB';
const STORE_NAME = 'imagePacks';
const CUSTOM_PACK_NAME = 'Custom';

export async function initializeImageLibrary(canvas) {
    try {
        await initDB();
        await ensureCustomPackExists();
        await loadAllImages();
        setupEventListeners(canvas);
    } catch (error) {
        console.error("Error initializing image library:", error);
        alert("Failed to initialize image library. Please check the console for more details.");
    }
}

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = (event) => reject(new Error("IndexedDB error: " + event.target.error));
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Database initialized successfully");
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: "packName" });
            console.log("Object store created");
        };
    });
}

async function ensureCustomPackExists() {
    console.log("Ensuring Custom pack exists...");
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
        const getRequest = store.get(CUSTOM_PACK_NAME);
        
        getRequest.onsuccess = (event) => {
            let customPack = event.target.result;
            if (!customPack) {
                console.log("Custom pack not found, creating it...");
                customPack = {
                    packName: CUSTOM_PACK_NAME,
                    description: "Your custom uploaded images",
                    images: []
                };
                const addRequest = store.add(customPack);
                addRequest.onsuccess = () => {
                    console.log("Custom pack created successfully");
                    resolve(customPack);
                };
                addRequest.onerror = (error) => reject(new Error("Failed to create Custom pack: " + error));
            } else {
                console.log("Custom pack found:", customPack);
                resolve(customPack);
            }
        };
        
        getRequest.onerror = (error) => reject(new Error("Error checking for Custom pack: " + error));
    });
}

async function importImagePack(file) {
    const packData = JSON.parse(await file.text());
    if (!validatePackStructure(packData)) {
        throw new Error("Invalid pack structure");
    }
    
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    await store.put(packData);
    
    await loadAllImages();
    return packData.packName;
}

export async function addImageToLibrary(file) {
    console.log("Adding image to library:", file.name);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const imageData = event.target.result;
            try {
                const transaction = db.transaction([STORE_NAME], "readwrite");
                const store = transaction.objectStore(STORE_NAME);
                
                const getRequest = store.get(CUSTOM_PACK_NAME);
                getRequest.onsuccess = (event) => {
                    let customPack = event.target.result;
                    if (!customPack) {
                        console.error("Custom pack not found when adding image");
                        reject(new Error("Custom pack not found"));
                        return;
                    }
                    
                    console.log("Custom pack before adding image:", customPack);
                    customPack.images.push({
                        name: file.name,
                        url: imageData,
                        tags: ["custom"]
                    });
                    console.log("Custom pack after adding image:", customPack);
                    
                    const putRequest = store.put(customPack);
                    putRequest.onsuccess = async () => {
                        console.log("Image added successfully");
                        await loadAllImages();
                        resolve();
                    };
                    putRequest.onerror = (error) => {
                        console.error("Error saving updated Custom pack:", error);
                        reject(new Error("Failed to save updated Custom pack"));
                    };
                };
                getRequest.onerror = (error) => {
                    console.error("Error retrieving Custom pack:", error);
                    reject(new Error("Failed to retrieve Custom pack"));
                };
            } catch (error) {
                console.error("Error in addImageToLibrary:", error);
                reject(error);
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            reject(new Error("Failed to read image file"));
        };
        reader.readAsDataURL(file);
    });
}

function validatePackStructure(packData) {
    // Implement validation logic here
    return true; // Placeholder
}

async function loadAllImages() {
    console.log("Loading all images...");
    const imageLibrary = document.getElementById('imageLibrary');
    imageLibrary.innerHTML = '';
    
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const packsRequest = store.getAll();

    return new Promise((resolve, reject) => {
        packsRequest.onsuccess = (event) => {
            const packs = event.target.result;
            console.log("Retrieved packs:", packs);
            
            // Ensure packs is an array
            const packsArray = Array.isArray(packs) ? packs : Object.values(packs);
            
            // Sort packs to ensure Custom is first
            packsArray.sort((a, b) => a.packName === CUSTOM_PACK_NAME ? -1 : b.packName === CUSTOM_PACK_NAME ? 1 : 0);
            
            packsArray.forEach(pack => {
                const packDiv = document.createElement('div');
                packDiv.className = 'image-pack';
                packDiv.innerHTML = `<h4>${pack.packName}</h4>`;
                
                const packImages = document.createElement('div');
                packImages.className = 'pack-images';
                
                pack.images.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = image.name;
                    img.title = image.name;
                    packImages.appendChild(img);
                });
                
                packDiv.appendChild(packImages);
                imageLibrary.appendChild(packDiv);
            });

            console.log("Images loaded successfully");
            resolve();
        };

        packsRequest.onerror = (event) => {
            console.error("Error loading image packs:", event.target.error);
            reject(new Error("Error loading image packs: " + event.target.error));
        };
    });
}

function setupEventListeners(canvas) {
    document.getElementById('importPackBtn').addEventListener('click', async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = async (event) => {
            try {
                const packName = await importImagePack(event.target.files[0]);
                alert(`Successfully imported pack: ${packName}`);
            } catch (error) {
                console.error("Error importing pack:", error);
                alert(`Error importing pack: ${error.message}`);
            }
        };
        fileInput.click();
    });

    document.getElementById('addToLibraryBtn').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (event) => {
            try {
                await addImageToLibrary(event.target.files[0]);
                alert('Image successfully added to Custom pack');
            } catch (error) {
                console.error("Error adding image:", error);
                alert(`Error adding image: ${error.message}`);
            }
        };
        fileInput.click();
    });

    document.getElementById('imageLibrary').addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') {
            addImageToCanvas(canvas, event.target.src);
        }
    });
}

function addImageToCanvas(canvas, src) {
    fabric.Image.fromURL(src, (img) => {
        img.scaleToWidth(100); // Set a default width
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

// Export necessary functions
export { addImageToCanvas };