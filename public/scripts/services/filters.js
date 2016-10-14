'use strict';

angular.module('sysmonjs')

/**
 * Compares Date objects and returns the elements of an array that are greater than or equal to a specific date (gteDate).
 * Applies a filter if the rawDate is a valid date object, returns unchanged collection otherwise.
 */
.filter('gteDate', function() {
	return function(input, rawDate) {
		var date = new Date(rawDate);
		return isNaN(date.getTime()) ? input : input.filter(function(d) { return d.x >= date; });
	}
})

/**
 * Compares Date objects and returns the elements of an array that are less than or equal to a specific date (lteDate).
 * Applies a filter if the rawDate is a valid date object, returns unchanged collection otherwise.
 */
.filter('lteDate', function() {
	return function(input, rawDate) {
		var date = new Date(rawDate);
		return isNaN(date.getTime()) ? input : input.filter(function(d) { return d.x <= date; });
	}
});