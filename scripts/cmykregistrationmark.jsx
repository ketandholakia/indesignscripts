if (app.selection.length > 0) {
    var selectedObject = app.selection[0];
    var doc = app.activeDocument;
    
    // Get object bounds
    var bounds = selectedObject.geometricBounds;
    var x1 = bounds[1], y1 = bounds[0], x2 = bounds[3], y2 = bounds[2];

    // Create registration marks
    var markSize = 5; // Adjust as needed
    var colors = ["Cyan", "Magenta", "Yellow", "Black"]; // CMYK colors

    function createRegMark(x, y, colorName) {
        var regMark = doc.ovals.add();
        regMark.geometricBounds = [y - markSize, x - markSize, y + markSize, x + markSize];
        regMark.strokeWeight = 0.5;
        // regMark.strokeColor = doc.swatches.itemByName(colorName);
    }

    // Add registration marks at each corner
    for (var i = 0; i < colors.length; i++) {
        createRegMark(x1, y1, colors[i]);
        createRegMark(x2, y1, colors[i]);
        createRegMark(x1, y2, colors[i]);
        createRegMark(x2, y2, colors[i]);
    }

    alert("CMYK registration marks added to the corners!");
} else {
    alert("Please select an object.");
}