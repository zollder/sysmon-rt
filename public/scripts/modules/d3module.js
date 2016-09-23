'use strict';

/**
 * D3 module.
 * Creates an injectable factory for D3 by wrapping it into a module.
 * Allows to pass D3 as a dependency inside the newly created module and use injected D3 variable in a private scope.
 * Stores all the visualization-specific code dependent on D3 library, as well as custom D3-based services and configurations.
 */
angular.module('d3mod', [])

.factory('d3', function() {
	// Good place to define custom D3 specific configurations such as locals and formatters
	return d3;
})

/**------------------------------------------------------------------------------------------------------
 * Creates an injectable data d3-based loading service.
 * Returns loaded data in the plain text format.
 ------------------------------------------------------------------------------------------------------*/
.factory('D3LoaderService', ["d3",
	function(d3) {
		return function(url, callback) {
			d3.text(url, callback);
		};
	}
])

/**------------------------------------------------------------------------------------------------------
 * Creates an injectable classifier/grouping service.
 * Aggregates log entries by the time interval.
 * Implements a mapping function that returns a classifier key as the x property
 * and the number of elements in the group as a y property.
 ------------------------------------------------------------------------------------------------------*/
.factory('ClassifierService', ["d3", function() {
	return function(data, key) {
		return d3.nest()
			.key(key)
			.entries(data)
			.map(function(entry) {
				return {
					x: entry.key,
					y: entry.values.length
				};
			});
	};
}]);