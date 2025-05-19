if (app.selection.length > 0) {
    var selectedObject = app.selection[0];
    var duplicatedObject = selectedObject.duplicate();
    duplicatedObject.move([selectedObject.geometricBounds[1] - (selectedObject.geometricBounds[3] - selectedObject.geometricBounds[1]), selectedObject.geometricBounds[0]]);
    app.select(duplicatedObject);
} else {
    alert("Please select an object to duplicate.");
}
