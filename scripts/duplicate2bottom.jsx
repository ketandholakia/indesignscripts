if (app.selection.length > 0) {
    var selectedObject = app.selection[0];
    var duplicatedObject = selectedObject.duplicate();
    
    // Move the duplicate below the original object
    duplicatedObject.move([selectedObject.geometricBounds[1], selectedObject.geometricBounds[2]]);
    
    // Select the duplicated object
    app.select(duplicatedObject);
} else {
    alert("Please select an object to duplicate.");
}