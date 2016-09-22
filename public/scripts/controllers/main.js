'use strict';

angular.module('sysmonjs')

.controller("MainCtrl", [ "$scope", "HttpLoaderService",
	function($scope, HttpLoaderService) {

		// initialize log object
		$scope.log = {
			src: 'files/access.log',
			data: ''
		};

		// load data logs from the file
		HttpLoaderService($scope.log.src).then(function(response){
			$scope.log.data = response.data;
		})
	}
]);