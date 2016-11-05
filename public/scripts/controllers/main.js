'use strict';

angular.module('sysmonjs')

.factory('socket', ["$rootScope", function($rootScope) {
	var socketIo = io.connect();
	return {
		// listen for events from the server
		on: function(event, callback) {
			socketIo.on(event, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socketIo, args);
				});
			});
		},
		// send events to the server
		emit: function(event, data, callback) {
			socketIo.emit(event, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socketIo, args);
					}
				});
			});
		}
	};
}])

/**
 * Main controller implemention.
 * Processes the log file prepare a dataset using underlying services to display a number
 * of application visitors in an interval of 5 minutes.
 */
.controller("MainCtrl", [
    "$scope",
    "socket",
    "d3",
    "HttpLoaderService",
    "ParserService",
    "ClassifierService",
	function($scope, socket, d3, HttpLoaderService, ParserService, ClassifierService) {

    	//-----------Date-time picker logic------------
    	$scope.startDate  = new Date('2014-11-24T00:00:00+0100');
    	$scope.endDate  = new Date('2015-11-25T18:00:00+0100');
    	$scope.date = [new Date('2014-11-24T00:00:00+0100'), new Date('2015-11-25T18:00:00+0100')];

    	$scope.datePickerIsOpen = [];
    	$scope.openDatePicker = function($event, index) {
    		if ($event) {
    			$event.preventDefault();
    			$event.stopPropagation(); // magic
    		}
    		this.datePickerIsOpen[index] = !this.datePickerIsOpen[index];
    	};
    	//----------------------------------------------------------

    	/* ----Test socket connection and data transfer.--- */
    	$scope.logs = [{
    		name: 'apache.access',
    		path: 'files/log/apache/access.log'
    	}];

    	angular.forEach($scope.logs, function(log) {
    		socket.emit('watch', {
    			name: log.name,
    			path: log.path
    		});
    		socket.on(log.name, function(data) {
    			console.log("Received: " + data);
    		});
    	});
    	/* ------------------------------------------------ */

    	// init date strings parser, example: 22/Nov/2014:01:56:00 +0100
    	var parseTime = d3.timeParse("%d/%b/%Y:%H:%M:%S %Z");

		// initialize log object
		$scope.log = {
			src: 'files/access2.log',
			data: [],
			map: function(entries) {
				return {
					time: parseTime(entries[2]),
					ip: entries[0],
					request: entries[3],
					status: entries[4],
					agent: entries[8]
				};
			},
			// group the x-values in an interval of x minutes
			minutes: 10
		};

		// initialize barchart cursor object
		$scope.barchart = {
			cursor: {
				date: 0,
				value: 0
			}
		};

		// initialize line-chart cursor object
		$scope.linechart = {
			cursor: {
				date: 0,
				value: 0
			}
		};

		// load and process data logs from the file
		HttpLoaderService($scope.log.src).then(function(response) {
			// concat all responses to string
			var sourceString = response.data;

			// parse the string to an array of log elements arrays
			var parsedString = ParserService(sourceString);

			// map each elements array to an object (dataset)
			var mappedData = parsedString.map($scope.log.map);

			// group (aggregate) flat log dataset by time
			var groupedEntries = ClassifierService(mappedData, function(entry) {
				// round to an interval of 5 minutes
				var coeff = 1000 * 60 * $scope.log.minutes; // (ms*s*min)
				return Math.round(entry.time/coeff)*coeff;
			});

			// save grouped dataset in the scope
			$scope.log.data = groupedEntries;
		});
	}
]);