const { fabric } = window;

let canvas;
let copiedObject = null;

export function initializeObjectManipulation(fabricCanvas) {
    canvas = fabricCanvas;
}

export function copySelectedObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.clone(function(cloned) {
            copiedObject = cloned;
        });
    }
}

export function pasteObject() {
    if (copiedObject) {
        copiedObject.clone(function(clonedObj) {
            canvas.discardActiveObject();
            clonedObj.set({
                left: clonedObj.left + 10,
                top: clonedObj.top + 10,
                evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
                // If it's a multiple selection, we need to iterate through the objects
                clonedObj.canvas = canvas;
                clonedObj.forEachObject(function(obj) {
                    canvas.add(obj);
                });
                clonedObj.setCoords();
            } else {
                canvas.add(clonedObj);
            }
            canvas.setActiveObject(clonedObj);
            canvas.requestRenderAll();
        });
    }
}

export function deleteSelectedObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        if (activeObject.type === 'activeSelection') {
            // If it's a multiple selection, remove all selected objects
            activeObject.forEachObject(function(obj) {
                canvas.remove(obj);
            });
        } else {
            canvas.remove(activeObject);
        }
        canvas.discardActiveObject();
        canvas.requestRenderAll();
    }
}

export function bringForward() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringForward(activeObject);
        canvas.requestRenderAll();
    }
}

export function sendBackward() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendBackwards(activeObject);
        canvas.requestRenderAll();
    }
}

export function setObjectOpacity(opacity) {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('opacity', opacity);
        canvas.requestRenderAll();
    }
}

export function groupSelectedObjects() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'activeSelection') {
        return;
    }
    canvas.getActiveObject().toGroup();
    canvas.requestRenderAll();
}

export function ungroupSelectedObjects() {
    if (!canvas.getActiveObject()) {
        return;
    }
    if (canvas.getActiveObject().type !== 'group') {
        return;
    }
    canvas.getActiveObject().toActiveSelection();
    canvas.requestRenderAll();
}

export function lockUnlockObject() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.set('lockMovementX', !activeObject.lockMovementX);
        activeObject.set('lockMovementY', !activeObject.lockMovementY);
        activeObject.set('lockRotation', !activeObject.lockRotation);
        activeObject.set('lockScalingX', !activeObject.lockScalingX);
        activeObject.set('lockScalingY', !activeObject.lockScalingY);
        canvas.requestRenderAll();
    }
}