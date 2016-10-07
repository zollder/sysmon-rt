'use strict';

angular.module('sysmonjs')

/**
 * Main controller implemention.
 * Processes the log file prepare a dataset using underlying services to display a number
 * of application visitors in an interval of 5 minutes.
 */
.controller("MainCtrl", [
    "$scope",
    "d3",
    "HttpLoaderService",
    "ParserService",
    "ClassifierService",
	function($scope, d3, HttpLoaderService, ParserService, ClassifierService) {

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
			minutes: 15
		};

		// initialize cursor object
		$scope.display = {
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

			console.log(groupedEntries);

			// save grouped dataset in the scope
			$scope.log.data = groupedEntries;
		});
	}
]);