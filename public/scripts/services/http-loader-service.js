'use strict';

angular.module('sysmonjs')

/**
 * Creates an injectable AngularJS implementation for the data loading service.
 * Wraps the XHR GET requests and returns the Promise created by the $http.get() method.
 */
.factory('HttpLoaderService', ["$http", function($http) {
		return function(url) {
			return $http.get(url, { cache: true });
		}
}]);