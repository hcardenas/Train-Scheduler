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
		var tdTagName;
		var tdTagDestiny;
		var tdTagFrequency;
		var tdTagNextArrival;
		var tdTagMinutesAway;

		var date;
		var dateString ;
		var timeLeft;

		var currentMin;
		var arrivalMin;

		for (var i = 0; i < trainArr.length; i++) {
			date =  new Date();
			dateString = dateToString(date, trainArr[i].frequency);

			arrivalMin = parseInt( parseInt( dateString.charAt(3) + dateString.charAt(4)) );
			currentMin = date.getMinutes() ;

			if (arrivalMin == "00" ) 
 				arrivalMin = 60;

 			
 			timeLeft = arrivalMin - currentMin ;
 			
 			

			trTag = $("<tr>");
			tdTagName = $("<td>").text(trainArr[i].name);
			tdTagDestiny = $("<td>").text(trainArr[i].destination);
			tdTagFrequency = $("<td>").text(trainArr[i].frequency);
			tdTagNextArrival = $("<td>").text(dateString);
			tdTagMinutesAway = $("<td>").text(Math.abs(timeLeft));


			trTag.append(tdTagName);
			trTag.append(tdTagDestiny);
			trTag.append(tdTagFrequency);
			trTag.append(tdTagNextArrival);
			trTag.append(tdTagMinutesAway);

			tableBody.append(trTag);
		}

	});
}

function dateToString(date, minutes) {
	var pm_am;
	var final_hour;
	var final_min;
	
	
	var noMinDate = subMinutes(date, parseInt(date.getMinutes()));

	while (date.getTime() > noMinDate.getTime()) {
		noMinDate = addMinutes(noMinDate, parseInt(minutes));
	}

	final_hour = parseInt(noMinDate.getHours());
	final_min = parseInt(noMinDate.getMinutes());

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