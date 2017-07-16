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

console.log(database);

$("#submit-id").on("submit", function(event) {
	event.preventDefault();
	addTrain();
	return false;
});


function addTrain() {
	firebase.database().ref("trains/").once("value").then(function(snap) {
		var trainArr = snap.val().length;

		var trainName =$("#train-name").val().trim();
		var trainDestination =$("#train-destination").val().trim();
		var trainTime =$("#train-time").val().trim();
		var trainFrequency =$("#train-frequency").val().trim();



		firebase.database().ref('trains/' + (trainArr)).set({
			"name" : trainName,
			"destination" : trainDestination,
			"frequency" : trainFrequency,
			"firstTrainTime" : trainTime
		});

		update_train();
	});


	
}


function update_train() {
	var tableBody = $("#table-body");
	tableBody.empty();

	firebase.database().ref("trains/").once("value").then(function(snap) {
		console.log(snap.val());
		var trainArr = snap.val();

		var trTag;
		var tdTagName;
		var tdTagDestiny;
		var tdTagFrequency;
		var tdTagNextArrival;
		var tdTagMinutesAway;

		var date;
		var dateString ;

		for (var i = 0; i < trainArr.length; i++) {
			date =  new Date();
			dateString = dateToString(date, trainArr[i].frequency);
 

			trTag = $("<tr>");
			tdTagName = $("<td>").text(trainArr[i].name);
			tdTagDestiny = $("<td>").text(trainArr[i].destination);
			tdTagFrequency = $("<td>").text(trainArr[i].frequency);
			tdTagNextArrival = $("<td>").text(trainArr[i].frequency);
			tdTagMinutesAway = $("<td>").text(trainArr[i].frequency);


			trTag.append(tdTagName);
			trTag.append(tdTagDestiny);
			trTag.append(tdTagFrequency);
			trTag.append(dateString);
			trTag.append(tdTagMinutesAway);

			tableBody.append(trTag);
		}

	});
}

function dateToString(date, minutes) {
	var newDate = addMinutes(date, minutes);
	var hours = parseInt(newDate.getHours());
	var minutesString = newDate.getMinutes();
	var pm_am;
	if (hours >= 12) {
		pm_am = "PM";
		hours -=12
	}
	else {
		pm_am = "AM"
	}

	return hours + ":" + minutesString + " " + pm_am;
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}


update_train();