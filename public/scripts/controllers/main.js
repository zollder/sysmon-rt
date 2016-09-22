'use strict';

angular.module('sysmonjs')

.controller("MainCtrl", [ "$scope", "HttpLoaderService", "ParserService",
	function($scope, HttpLoaderService, ParserService) {

		// initialize log object
		$scope.log = {
			src: 'files/access.log',
			data: ''
		};

		// load data logs from the file
		HttpLoaderService($scope.log.src).then(function(response){
			var sourceString = response.data;
			var parsedString = ParserService(sourceString);

			var parseTime = d3.timeParse("%d/%b/%Y:%H:%M:%S %Z");
			var mappedData = parsedString.map(function(items) {
				return {
					ip: items[0],
					time: parseTime(items[2]),
					request: items[3],
					status: items[4],
					agent: items[8]
				};
			});
			$scope.log.data = mappedData;
		});
	}
]);