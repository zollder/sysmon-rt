'use strict';

/**
 * D3 module.
 * Creates an injectable factory for D3 by wrapping it into a module.
 * Allows to pass D3 as a dependency inside the newly created module and use injected D3 variable in a private scope.
 * Stores all the visualization-specific code dependent on D3 library, as well as custom D3 configurations.
 */
angular.module('d3mod', [])

.factory('d3', function() {
	// Good place to define custom D3 specific configurations such as locals and formatters
	return d3;
})

/**
 * Creates an injectable data loading service.
 *
 */
.factory('d3loader', ["d3",
	function(d3) {
		return function(url, callback) {
			d3.text(url, 'text/plain', callback);
		};
	}
]);