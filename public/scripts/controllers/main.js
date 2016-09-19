'use strict';

angular.module('sysmonjs')

.controller("MainCtrl", [ '$scope', '$interval',
	function($scope, $interval) {
		var time = new Date('2014-01-01 00:00:00 +0100');

		// random data point generator (timestamp + number of visitors)
		var randomPoint = function() {
			var random = Math.random;
			var point = {
			    time : new Date(time.toString()),
			    visitors : random() * 100
			};
			return point;
		}

		// store a list of logs
		$scope.logs = [ randomPoint() ];
	    $scope.moreLogs = [
   			[randomPoint()],
   			[randomPoint()],
   			[randomPoint()],
   			[randomPoint()]
   		];

	    // periodically fill log arrays with random data points
		$interval(function() {
			time.setSeconds(time.getSeconds() + 1);
			$scope.logs.push(randomPoint());
			$scope.moreLogs[0].push(randomPoint());
			$scope.moreLogs[1].push(randomPoint());
			$scope.moreLogs[2].push(randomPoint());
			$scope.moreLogs[3].push(randomPoint());
		}, 1000);
	}
]);