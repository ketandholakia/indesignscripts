//CropMarks.jsx was created by Adobe Systems, Inc. and shipped with InDesign.
//AdvancecCropMarks.jsx is a modifyed version of CropMarks.jsx by TEIXEIRA Loïc - http://www.shgnu110mt.fr/
//
//Draws crop and/or registration marks around the selected object or objects.
//
//For more on InDesign scripting, go to http://www.adobe.com/products/indesign/scripting.html
//or visit the InDesign Scripting User to User forum at http://www.adobeforums.com
//

/*
 * DEFAULTS SETTINGS 
 * Change defaults values in dialog box.
 */
var myDoCropMarksDefault 			= true;		//Set it to "true" if you want the Crop Marks to be drawn. Set it to "false" if you don't want the Crop Marks to be drawn.
var myCropMarkLengthDefault 		= 10;		//Lenght of the Crop Mark --- Unit is points --- Use . not , for decimal.
var myCropMarkOffsetDefault 			= 5;			//Offset of the Crop Mark from the border --- Unit is points --- Use . not , for decimal.
var myCropMarkWidthDefault 			= .25;		//Width of the Crop Mark --- Unit is points --- Use . not , for decimal.
var myCropMarkBleedDefault			= 7.087;	//Inner Bleed from the border --- Unit is points --- Use . not , for decimal.

var myDoRegMarksDefault				= false;		//Set it to "true" if you want the Registration Marks to be drawn. Set it to "false" if you don't want the Registration Marks to be drawn.
var myRegMarkInnerRadiusDefault	= 2;			//Inner Radius of Registration Marks --- Unit is points --- Use . not , for decimal.
var myRegMarkOuterRadiusDefault	= 4;			//Outer Radius of Registration Marks --- Unit is points --- Use . not , for decimal.
var myRegMarkOffsetDefault			= 3;			//Offset of the Registration Marks from the border --- Unit is points --- Use . not , for decimal.

var myDoEntireSelectionDefault 		= false;		//If you want Marks to be drawn on Each Objects, set it to "false". If you want Marks to be drawn on Entire Objects, set it to "true".

/*
 * SCRIPT
 * Don't edit this unless you know what you are doing.
 */
main();

function main(){
	if (app.documents.length != 0){
		if (app.selection.length > 0){
			switch(app.selection[0].constructor.name){
				case "Rectangle":
				case "Oval":
				case "Polygon":
				case "GraphicLine":
				case "Group":
				case "TextFrame":
				case "Button":
					myDisplayDialog();
					break;
				default:			
					alert("Please select a page item and try again.");
					break;
			}
		}
		else{
			alert("Please select an object and try again.");
		}
	}
	else{
		alert("Please open a document, select an object, and try again.");
	}
}

function myDisplayDialog(){
	var myDialog = app.dialogs.add({name:"AdvancedCropMarks"});
	with(myDialog){
		with(dialogColumns.add()){
			var myCropMarksGroup = enablingGroups.add({staticLabel:"Crop Marks", checkedState:myDoCropMarksDefault });
			with (myCropMarksGroup){
				with(borderPanels.add()){
					staticTexts.add({staticLabel:"Options:"});
					with (dialogColumns.add()){
						staticTexts.add({staticLabel:"Stroke Length:"});
						staticTexts.add({staticLabel:"Stroke Offset:"});
						staticTexts.add({staticLabel:"Stroke Weight:"});
						staticTexts.add({staticLabel:"Inner Bleed Offset:"});
					}
					with (dialogColumns.add()){
						var myCropMarkLengthField = measurementEditboxes.add({editValue:myCropMarkLengthDefault, editUnits:MeasurementUnits.points});
						var myCropMarkOffsetField = measurementEditboxes.add({editValue:myCropMarkOffsetDefault, editUnits:MeasurementUnits.points});
						var myCropMarkWidthField = measurementEditboxes.add({editValue:myCropMarkWidthDefault, editUnits:MeasurementUnits.points});
						var myCropMarkBleedField = measurementEditboxes.add({editValue:myCropMarkBleedDefault, editUnits:MeasurementUnits.points});
					}
				}
			}
			var myRegMarksGroup = enablingGroups.add({staticLabel:"Registration Marks", checkedState:myDoRegMarksDefault});
			with (myRegMarksGroup){
				with(borderPanels.add()){
					staticTexts.add({staticLabel:"Options:"});
					with (dialogColumns.add()){
						staticTexts.add({staticLabel:"Inside Radius:"});
						staticTexts.add({staticLabel:"Outside Radius:"});
						staticTexts.add({staticLabel:"Offset:"});
					}
					with (dialogColumns.add()){
						var myRegMarkInnerRadiusField = measurementEditboxes.add({editValue:myRegMarkInnerRadiusDefault, editUnits:MeasurementUnits.points});
						var myRegMarkOuterRadiusField = measurementEditboxes.add({editValue:myRegMarkOuterRadiusDefault,editUnits:MeasurementUnits.points});
						var myRegMarkOffsetField = measurementEditboxes.add({editValue:myRegMarkOffsetDefault, editUnits:MeasurementUnits.points});
					}
				}
			}
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Draw Marks Around:"});
				var myRangeButtons = radiobuttonGroups.add();
				with(myRangeButtons){
					radiobuttonControls.add({staticLabel:"Each Object", checkedState:!myDoEntireSelectionDefault });
					radiobuttonControls.add({staticLabel:"Entire Selection", checkedState:myDoEntireSelectionDefault});
				}
			}
		}
	}
	var myReturn = myDialog.show();
	if (myReturn == true){
		//Get the values from the dialog box.
		var myDoCropMarks = myCropMarksGroup.checkedState;
		var myDoRegMarks = myRegMarksGroup.checkedState;
		var myCropMarkLength = myCropMarkLengthField.editValue;
		var myCropMarkOffset = myCropMarkOffsetField.editValue;
		var myCropMarkWidth = myCropMarkWidthField.editValue;
		var myCropMarkBleed = myCropMarkBleedField.editValue;
		var myRegMarkInnerRadius = myRegMarkInnerRadiusField.editValue;
		var myRegMarkOuterRadius = myRegMarkOuterRadiusField.editValue;
		var myRegMarkOffset = myRegMarkOffsetField.editValue;
		var myRange = myRangeButtons.selectedButton;
		myDialog.destroy();
		
		if ((myDoCropMarks != false) || (myDoRegMarks != false)){
			myDrawPrintersMarks(myRange, myDoCropMarks, myDoRegMarks, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myCropMarkBleed, myRegMarkInnerRadius, myRegMarkOuterRadius, myRegMarkOffset);
		}
		else{
			alert("No printers marks were selected.");
		}
	}
	else{
		myDialog.destroy();
	}
}

function myDrawPrintersMarks(myRange, myDoCropMarks, myDoRegMarks, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myCropMarkBleed, myRegMarkInnerRadius, myRegMarkOuterRadius, myRegMarkOffset){
	var myBounds, myEntireSelectionBounds, myEntireSelectionX1, myEntireSelectionY1, myEntireSelectionX2, myEntireSelectionY2, myObject;
	var myDocument = app.activeDocument;
	
	//Save the current measurement units & ruler Origin.
	var myOldXUnits = myDocument.viewPreferences.horizontalMeasurementUnits;
	var myOldYUnits = myDocument.viewPreferences.verticalMeasurementUnits;
	var myOldRulerOrigin = myDocument.viewPreferences.rulerOrigin;
	
	//Set the measurement units to points.
	myDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
	myDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
	myDocument.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	
	//Create a layer to hold the printers marks (if it does not already exist).
	var myLayer = myDocument.layers.item("myAdvancedCropMarks");
	try{
		myLayerName = myLayer.name;
	}
	catch (myError){
		var myLayer = myDocument.layers.add({name:"myAdvancedCropMarks"});
	}

	//Get references to the Registration color and the None swatch.
	var myRegistrationColor = myDocument.colors.item("Registration");
	var myNoneSwatch = myDocument.swatches.item("None");
	
	//Get the entire selection bounds
	for(var myCounter = 0; myCounter < myDocument.selection.length; myCounter ++){
		myObject = myDocument.selection[myCounter];
		myBounds = myObject.visibleBounds;
		if (myCounter==0) {
			myEntireSelectionX1 = myBounds[1];
			myEntireSelectionY1 = myBounds[0];
			myEntireSelectionX2 = myBounds[3];
			myEntireSelectionY2 = myBounds[2];
		}
		else {
			if (myBounds[0] < myEntireSelectionY1) myEntireSelectionY1 = myBounds[0];
			if (myBounds[1] < myEntireSelectionX1) myEntireSelectionX1 = myBounds[1];
			if (myBounds[2] > myEntireSelectionY2) myEntireSelectionY2 = myBounds[2];
			if (myBounds[3] > myEntireSelectionX2) myEntireSelectionX2 = myBounds[3];
		}
	}
	myEntireSelectionBounds = [myEntireSelectionY1, myEntireSelectionX1, myEntireSelectionY2, myEntireSelectionX2];

	//Draw Entire Selection if needed
	if(myRange != 0){
		if (myDoCropMarks == true) {
			myDrawCropMarks (myEntireSelectionX1, myEntireSelectionY1, myEntireSelectionX2, myEntireSelectionY2, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myCropMarkBleed, myRegistrationColor, myNoneSwatch, myLayer, null);
		}
		if (myDoRegMarks == true) {
			myDrawRegMarks (myEntireSelectionX1, myEntireSelectionY1, myEntireSelectionX2, myEntireSelectionY2, myRegMarkOffset, myRegMarkInnerRadius, myRegMarkOuterRadius, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, null);
		}
}

	//Draw Each Selection if needed
	if (myRange == 0){
		for (var myCounter = 0; myCounter < myDocument.selection.length; myCounter ++){
			myObject = myDocument.selection[myCounter];
			myBounds = myObject.visibleBounds;
			if (myDoCropMarks == true) {
				myDrawCropMarks (myBounds[1], myBounds[0], myX2 = myBounds[3], myY2 = myBounds[2], myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myCropMarkBleed, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
			}
			if (myDoRegMarks == true) {
				myDrawRegMarks (myBounds[1], myBounds[0], myX2 = myBounds[3], myY2 = myBounds[2], myRegMarkOffset, myRegMarkInnerRadius, myRegMarkOuterRadius, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
			}
		}
	}
	
	//Set the measurement units & ruler origin back to their original state.
	myDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
	myDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
	myDocument.viewPreferences.rulerOrigin = myOldRulerOrigin;
}

function myDrawCropMarks (myX1, myY1, myX2, myY2, myCropMarkLength, myCropMarkOffset, myCropMarkWidth, myCropMarkBleed, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds){
	//-0.00001 and +0.00001 are used to fix a non-expected result when using an offset of 0.

	//Upper left crop mark pair.
	myDrawLine([myY1+myCropMarkBleed, myX1-myCropMarkOffset-0.00001, myY1+myCropMarkBleed, myX1-(myCropMarkOffset + myCropMarkLength)-0.00001], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myDrawLine([myY1-myCropMarkOffset-0.00001, myX1+myCropMarkBleed, myY1-(myCropMarkOffset+myCropMarkLength -0.00001), myX1+myCropMarkBleed], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

	//Lower left crop mark pair.
	myDrawLine([myY2-myCropMarkBleed, myX1-myCropMarkOffset-0.00001, myY2-myCropMarkBleed, myX1-(myCropMarkOffset+myCropMarkLength)-0.00001], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myDrawLine([myY2+myCropMarkOffset+0.00001, myX1+myCropMarkBleed, myY2+myCropMarkOffset+myCropMarkLength+0.00001, myX1+myCropMarkBleed], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

	//Upper right crop mark pair.
	myDrawLine([myY1+myCropMarkBleed, myX2+myCropMarkOffset+0.00001, myY1+myCropMarkBleed, myX2+myCropMarkOffset+myCropMarkLength+0.00001], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myDrawLine([myY1-myCropMarkOffset-0.00001, myX2-myCropMarkBleed, myY1-(myCropMarkOffset+myCropMarkLength)-0.00001, myX2-myCropMarkBleed], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

	//Lower left crop mark pair.
	myDrawLine([myY2-myCropMarkBleed, myX2+myCropMarkOffset+0.00001, myY2-myCropMarkBleed, myX2+myCropMarkOffset+myCropMarkLength+0.00001], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myDrawLine([myY2+myCropMarkOffset+0.00001, myX2-myCropMarkBleed, myY2+myCropMarkOffset+myCropMarkLength+0.00001, myX2-myCropMarkBleed], myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
}

function myDrawRegMarks (myX1, myY1, myX2, myY2, myRegMarkOffset, myRegMarkInnerRadius, myRegMarkOuterRadius, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds){
	var myBounds
	var myXCenter = myX1 + ((myX2 - myX1)/2);
	var myYCenter = myY1 + ((myY2 - myY1)/2);
	var myTargetCenter = myRegMarkOffset+(myRegMarkOuterRadius);

	//Top registration target.
	myBounds = [myY1-(myTargetCenter+myRegMarkInnerRadius), myXCenter-myRegMarkInnerRadius, (myY1-myTargetCenter)+myRegMarkInnerRadius, myXCenter + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myY1-(myTargetCenter+myRegMarkOuterRadius), myXCenter, (myY1-myTargetCenter)+myRegMarkOuterRadius, myXCenter];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myY1-myTargetCenter, myXCenter-myRegMarkOuterRadius, myY1-myTargetCenter, myXCenter+myRegMarkOuterRadius];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

	//Left registration target.
	myBounds = [myYCenter-myRegMarkInnerRadius, myX1-(myTargetCenter+myRegMarkInnerRadius), myYCenter+myRegMarkInnerRadius, (myX1 - myTargetCenter) + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myYCenter, myX1-(myTargetCenter+myRegMarkOuterRadius), myYCenter, myX1 -myRegMarkOffset];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myYCenter-myRegMarkOuterRadius, myX1-myTargetCenter, myYCenter+myRegMarkOuterRadius, myX1-myTargetCenter];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

	//Bottom registration target.
	myBounds = [myY2+(myTargetCenter-myRegMarkInnerRadius), myXCenter-myRegMarkInnerRadius, myY2+ myTargetCenter+myRegMarkInnerRadius, myXCenter + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myY2+myRegMarkOffset, myXCenter, myY2+myTargetCenter+myRegMarkOuterRadius, myXCenter];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myY2+myTargetCenter, myXCenter-myRegMarkOuterRadius, myY2 + myTargetCenter, myXCenter+myRegMarkOuterRadius];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

	//Right registration target.
	myBounds = [myYCenter-myRegMarkInnerRadius, myX2+(myTargetCenter-myRegMarkInnerRadius), myYCenter+myRegMarkInnerRadius, myX2 + myTargetCenter + myRegMarkInnerRadius];
	myDrawTarget(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myYCenter, myX2+myRegMarkOffset, myYCenter, myX2+myTargetCenter+myRegMarkOuterRadius];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);
	myBounds = [myYCenter-myRegMarkOuterRadius, myX2+myTargetCenter, myYCenter+myRegMarkOuterRadius, myX2+myTargetCenter];
	myDrawLine(myBounds, myCropMarkWidth, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds);

}

function myDrawLine(myBounds, myStrokeWeight, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds){
	//If we draw marks for the entire selection, draw the marks.
	//If we draw marks for each objects of the selection, check if it is not inside the entire selection bounds then draw.
	if ( myEntireSelectionBounds == null )
		app.activeWindow.activeSpread.graphicLines.add(myLayer, undefined, undefined,{strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds});
	else
		if ( ( (myBounds[0]  < myEntireSelectionBounds[0] || myBounds[0] > myEntireSelectionBounds[2]) && (myBounds[2] < myEntireSelectionBounds[0] || myBounds[2] > myEntireSelectionBounds[2]) ) ||
			 ( (myBounds[1]  < myEntireSelectionBounds[1] || myBounds[1] > myEntireSelectionBounds[3]) && (myBounds[3] < myEntireSelectionBounds[1] || myBounds[3] > myEntireSelectionBounds[3]) ) )
			app.activeWindow.activeSpread.graphicLines.add(myLayer, undefined, undefined,{strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds});
}

function myDrawTarget(myBounds, myStrokeWeight, myRegistrationColor, myNoneSwatch, myLayer, myEntireSelectionBounds){
	//If we draw marks for the entire selection, draw the marks.
	//If we draw marks for each objects of the selection, check if it is not inside the entire selection bounds then draw.
	if ( myEntireSelectionBounds == null )
		app.activeWindow.activeSpread.ovals.add(myLayer, undefined, undefined, {strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds});
	else
		if ( ( (myBounds[0] < myEntireSelectionBounds[0] || myBounds[0] > myEntireSelectionBounds[2]) && (myBounds[2] < myEntireSelectionBounds[0] || myBounds[2] > myEntireSelectionBounds[2]) ) ||
			 ( (myBounds[1] < myEntireSelectionBounds[1] || myBounds[1] > myEntireSelectionBounds[3]) && (myBounds[3] < myEntireSelectionBounds[1] || myBounds[3] > myEntireSelectionBounds[3]) ) )
			app.activeWindow.activeSpread.ovals.add(myLayer, undefined, undefined, {strokeWeight:myStrokeWeight, fillColor:myNoneSwatch, strokeColor:myRegistrationColor, geometricBounds:myBounds});
}
