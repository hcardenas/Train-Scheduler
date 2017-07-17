// **************************
// **************************
var config = {
    apiKey: "AIzaSyDgA66NX4y6xmS4spzSg5TPULLRQzu_BdE",
    authDomain: "train-scheduler-553ef.firebaseapp.com",
    databaseURL: "https://train-scheduler-553ef.firebaseio.com",
    projectId: "train-scheduler-553ef",
    storageBucket: "",
    messagingSenderId: "102293604646"
  };
 
firebase.initializeApp(config);

var database = firebase.database().ref('/trains/0');



// **************************
// used to submit the train info
// **************************
$("#submit-id").on("submit", function(event) {
	event.preventDefault();
	addTrain();
	return false;
});


// **************************
// if the btn to edit is clicked 
// it mchanges its color and triggers the 
// editrow function 
// **************************
$("#table-body").on("click", ".edit-btn" , function(event){
	event.preventDefault();
	var button = $(this);
	var index = button.attr("btn");
	var tableRow = $("#table-body .row-"+index);

	if (button.hasClass("btn-primary")) {
		console.log("toogle edit row");
		toggleEditRow(index);
	}
	else {
		console.log("update changes, remove edit row");
		updateDataBase(index);

		//update_train();
	}

	
	button.toggleClass("btn-primary btn-danger");
	return false;
});


// **************************
// updates the database depending the input from the 
// table row 
// **************************
function updateDataBase(index) {
	var newName =  $("tr.row-"+index + " td:eq(1)").children().val();
	var newDestination = $("tr.row-"+index + " td:eq(2)").children().val();
	var newFrequency = $("tr.row-"+index + " td:eq(3)").children().val();
	$("tr.row-"+index).empty();

	firebase.database().ref('trains/' + index).update({
		name : newName,
		destination: newDestination,
		frequency: newFrequency

	});

	update_train();

}


// **************************
// function that grabs a table row
// information and puts it in a input tag to
// edit
// **************************
function toggleEditRow(index) {
	var editRowName = $("tr.row-"+index + " td:eq(1)");
	var editRowDestination = $("tr.row-"+index + " td:eq(2)");
	var editRowFrequency = $("tr.row-"+index + " td:eq(3)");

	console.log(editRowName.text());

	for (var i = 1; i <= 3; ++i) {
		var tableCell = $("tr.row-"+index + " td:eq("+i+")");
		
		var input = $("<input type='text' class='form-control input-"+i+"'>").val(tableCell.text());

		
		tableCell.empty();
		tableCell.append(input);
	}

}

// **************************
// grabs user info and adds to database 
// **************************
function addTrain() {
	// crteates a database reference
	firebase.database().ref("trains/").once("value").then(function(snap) {
		// snap of database and flag to check if train exits 
		var trainArr = snap.val();
		var alreadyExistsFlag = false;

		// grabs train information from user removes trailing whitespace 
		// and makes everything lower case
		var trainName = $("#train-name").val().trim().toLowerCase();
		var trainDestination = $("#train-destination").val().trim().toLowerCase();
		var trainTime = $("#train-time").val().trim();
		var trainFrequency = $("#train-frequency").val().trim();

		// makes teh first letter of the train name and destination uppercase 
		trainName = trainName.replaceAt(0, trainName.charAt(0).toUpperCase() );
		trainDestination = trainDestination.replaceAt(0 , trainDestination.charAt(0).toUpperCase() );

		// goes tru the database and checks if train already exits 
		for (var i = 0; i < trainArr.length; i++) {
			if (trainArr[i].name === trainName)
				alreadyExistsFlag = true;
		}

		// pushes the new train if it doesnt already exit
		if (!alreadyExistsFlag && trainName !== "") {
			firebase.database().ref('trains/' + trainArr.length).set({
				"name" : trainName,
				"destination" : trainDestination,
				"frequency" : trainFrequency,
				"firstTrainTime" : trainTime

			});
			update_train();
		}
		else {
			alert("Train already Exists or fields are empty.");
		}

		
	});
}


// **************************
// makes the table from the table information
// **************************
function update_train() {
	// grabs the table div and makes it empty
	var tableBody = $("#table-body");
	tableBody.empty();

	// grabs a snapshot of the database to work with
	firebase.database().ref("trains/").once("value").then(function(snap) {
		// database nsapshot its an array
		var trainArr = snap.val();


		// variables used in the creation of the table
		// the flags are to give color to the rows depending on the 
		// time remaining 
		var trTag;
		var date = new Date();
		var newArrivalDate;
		var dateString ;
		var arrivingSoonFlag ;
		var trainArrivedFlag ;
		var minuteAway;
		 
		for (var i in trainArr ) {
			
		//for (var i = 0; i < trainArr.length; i++) {
			
			// sets and/or resets variables used in loop
			frequencyMinutes = trainArr[i].frequency;
			arrivingSoonFlag = false;
			trainArrivedFlag = false;

			// gets next arrival time then sends it to return a string of it
			newArrivalDate = arrivalDate(date, frequencyMinutes);
			dateString = arrivalDateToString( newArrivalDate);

			// uses the next arrival time and current time to get the minutes away
			// so if next arrival is at 1:12 and current time is 1:10 then minutes away --- 2
 			minuteAway = new Date(newArrivalDate.getTime() - date.getTime());
 			minuteAway = parseInt(minuteAway.getMinutes());

 			// if statements to warn users if: 
 			//		train arrived
 			//		train is arriving soon
 			//		train is close 
 			if (minuteAway === 0) {
 				minuteAway += " - Arrived";
 				trainArrivedFlag = true;
 			}

 			else if (minuteAway <= 3 && minuteAway >= 0 ) {
 				minuteAway += " - Arriving soon";
 				trainArrivedFlag = true;
 			}
 			else if (minuteAway <= 10 && minuteAway > 3) {
 				minuteAway += " - Close to port";
 				arrivingSoonFlag = true;
 			}


 			// makes the row with data from database
			trTag = makeTableRow(trainArr[i].name, trainArr[i].destination, frequencyMinutes, dateString, minuteAway, i);
			
			// depending on the data fro mthe if statemetns above it gives the row 
			// jsut created a color 
			if (trainArrivedFlag) {
 				trTag.addClass("danger");
 			}

 			if (arrivingSoonFlag) {
 				trTag.addClass("warning");
 			}

			tableBody.append(trTag);
		}

	});
}


// **************************
// makes a table row and populates with data 
// from database 
// **************************
function makeTableRow(name, destination, frequency, arrivalTime, minuteAway, index) {
	// makes a tr tag and add and index to grab make it easier
	// to grab later
	var trTag = $("<tr>").addClass("row-"+index);
	trTag.attr("table-row", index);

	// creates a glyph to edit the row
	var editGlyph = $("<span>").addClass("glyphicon glyphicon-edit");

	// creates a button and adds the glyph then appends the glyph to btn
	var button = $("<button>").addClass("btn btn-primary btn-xs edit-btn");
	button.attr("btn", index);
	button.append(editGlyph);


	
	// makes the cells of the row and populates with data
	var tdEditTable = $("<td>").append(button);
	var tdTagName = $("<td>").text(name);
	var tdTagDestiny = $("<td>").text(destination);
	var tdTagFrequency = $("<td>").text(frequency);
	var tdTagNextArrival = $("<td>").text(arrivalTime);
	var tdTagMinutesAway = $("<td>").text(minuteAway);


	// appends all the cells to the row tag
	trTag.append(tdEditTable);
	trTag.append(tdTagName);
	trTag.append(tdTagDestiny);
	trTag.append(tdTagFrequency);
	trTag.append(tdTagNextArrival);
	trTag.append(tdTagMinutesAway);


	return trTag;
}

// **************************
// function used to create a next arrival time
// it takes the current time, then takes the minutes
// from that time, and then it uses the frequency
// parameter to add time untill its greated than 
// current time i.e.
// if time is 1:05 and frequency is every 12 min
// then it returns 1:12 
// **************************
function arrivalDate(date, minutes) {
	var noMinDate = subMinutes(date, parseInt(date.getMinutes()));

	while (date.getTime() > noMinDate.getTime()) {
		noMinDate = addMinutes(noMinDate, parseInt(minutes));
	}
	return noMinDate;
}

// **************************
// takes in the actual time send day and
// returns the time as a string with its 
// respective PM/AM 
// **************************
function arrivalDateToString( newArrivalDate) {
	var pm_am;
	var final_hour;
	var final_min;

	final_hour = parseInt(newArrivalDate.getHours());
	final_min = parseInt(newArrivalDate.getMinutes());

	// if military hour is greater than 12
	// make string PM and remove 12 from 
	// military hour 
	if (final_hour > 12) {
		pm_am = "PM";
		final_hour -= 12; 
	} else {
		pm_am = "AM";
	}
	
	// if minute or hour is less than 10 add a 0
	// in fron i.e. 1 ---> 01
	if (final_min < 10) {
		final_min = "0" + final_min;
	}

	if (final_hour < 10 ) 
		final_hour = "0" + final_hour;
	
	// if the hour is 0 then make it into a 12
	if (final_hour == "0") {
		final_hour = 12;
	}

	

	return final_hour + ":" + final_min + " " + pm_am;

}

// **************************
// returns a new date with added min
// **************************
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

// **************************
// returns a new date with substracted min 
// **************************
function subMinutes(date, minutes) {
    return new Date(date.getTime() - minutes*60000);
}

// **************************
// created a replaceAt function tha works 
// strings. it replaces a character at a 
// poscition index
// **************************
String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}


update_train();
setInterval(update_train, 1000 * 60);