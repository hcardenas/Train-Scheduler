console.log("im ready");
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

$("#submit-id").on("submit", function(event) {
	event.preventDefault();
	addTrain();
	return false;
});

$("#table-body").on("click", ".edit-btn" , function(event){
	var button = $(this);
	var index = button.attr("btn");

	button.toggleClass("btn-primary btn-danger");

	console.log($("#table-body .row-"+index));
});


function addTrain() {
	firebase.database().ref("trains/").once("value").then(function(snap) {
		var trainArr = snap.val();
		var alreadyExistsFlag = false;

		var trainName =$("#train-name").val().trim().toLowerCase();
		var trainDestination =$("#train-destination").val().trim().toLowerCase();
		var trainTime =$("#train-time").val().trim();
		var trainFrequency =$("#train-frequency").val().trim();

		trainName = trainName.replaceAt(0, trainName.charAt(0).toUpperCase() );
		trainDestination = trainDestination.replaceAt(0 , trainDestination.charAt(0).toUpperCase() );

		for (var i = 0; i < trainArr.length; i++) {
			if (trainArr[i].name === trainName)
				alreadyExistsFlag = true;
		}

		if (!alreadyExistsFlag) {
			firebase.database().ref('trains/' + trainArr.length).set({
				"name" : trainName,
				"destination" : trainDestination,
				"frequency" : trainFrequency,
				"firstTrainTime" : trainTime

			});
			update_train();
		}
		else {
			alert("Train already Exists!");
		}

		
	});


	
}


function update_train() {
	var tableBody = $("#table-body");
	tableBody.empty();

	firebase.database().ref("trains/").once("value").then(function(snap) {
		
		var trainArr = snap.val();

		var trTag;

		var date;
		var newArrivalDate;
		var dateString ;

		 
		for (var i in trainArr ) {
			
		//for (var i = 0; i < trainArr.length; i++) {
			date =  new Date();
			frequencyMinutes = trainArr[i].frequency;

			var arrivingSoonFlag = false;
			var trainArrivedFlag = false;

			newArrivalDate = arrivalDate(date, frequencyMinutes);
			dateString = arrivalDateToString(date, newArrivalDate);


 			var minuteAway = new Date(newArrivalDate.getTime() - date.getTime());

 			minuteAway = parseInt(minuteAway.getMinutes());

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



			trTag = makeTableRow(trainArr[i].name, trainArr[i].destination, frequencyMinutes, dateString, minuteAway, i);
			
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

function editRow() {
	console.log("this is sparta");


}

function makeTableRow(name, destination, frequency, arrivalTime, minuteAway, index) {
	var trTag = $("<tr>").addClass("row-"+index);
	trTag.attr("table-row", index);

	var editGlyph = $("<span>").addClass("glyphicon glyphicon-edit");

	var button = $("<button>").addClass("btn btn-primary btn-xs edit-btn");
	button.attr("btn", index);

	button.append(editGlyph);

	var tdEditTable = $("<td>").append(button);

	var tdTagName = $("<td>").text(name);
	var tdTagDestiny = $("<td>").text(destination);
	var tdTagFrequency = $("<td>").text(frequency);
	var tdTagNextArrival = $("<td>").text(arrivalTime);
	var tdTagMinutesAway = $("<td>").text(minuteAway);

	trTag.append(tdEditTable);
	trTag.append(tdTagName);
	trTag.append(tdTagDestiny);
	trTag.append(tdTagFrequency);
	trTag.append(tdTagNextArrival);
	trTag.append(tdTagMinutesAway);

	return trTag;
}

function arrivalDate(date, minutes) {
	var noMinDate = subMinutes(date, parseInt(date.getMinutes()));

	while (date.getTime() > noMinDate.getTime()) {
		noMinDate = addMinutes(noMinDate, parseInt(minutes));
	}

	return noMinDate;

}

function arrivalDateToString(date, newArrivalDate) {
	var pm_am;
	var final_hour;
	var final_min;

	final_hour = parseInt(newArrivalDate.getHours());
	final_min = parseInt(newArrivalDate.getMinutes());

	if (final_hour > 12) {
		pm_am = "PM";
		final_hour -= 12; 
	} else {
		pm_am = "AM";
	}
	
	if (final_min < 10) {
		final_min = "0" + final_min;
	}
	
	if (final_hour == "0") {
		final_hour = 12;
	}

	if (final_hour < 10 ) 
		final_hour = "0" + final_hour;

	return final_hour + ":" + final_min + " " + pm_am;

}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function subMinutes(date, minutes) {
    return new Date(date.getTime() - minutes*60000);
}
String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}


update_train();
setInterval(update_train, 1000 * 60);