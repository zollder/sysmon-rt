'use strict';

/**
 * Scatter chart directive.
 * Creates complete chart including parent svg container, axis, and all data points.
 * Binds data and chart options to the private scope of the directive.
 * Returns the directive as an element with the private scope.
 */
angular.module('d3mod')

.directive('rtScatterChart', ["d3",
	function(d3) {

		/**
		 * Generalized draw helper function.
		 * Renders scatter chart based on specified parameters and data.
		 */
		var draw = function(svg, width, height, data) {
			svg
				.attr('width', width)
				.attr('height', height);

			// define a margin
			var margin = 50;

			// define x/y-scale
			var xScale = d3.scaleTime()
				.domain(d3.extent(data, function(element) { return element.x }))
				.range([margin, width - margin]);
			var yScale = d3.scaleTime()
				.domain([0, d3.max(data, function(element) { return element.y; })])
				.range([margin, height - margin]);

			// define x/y-axis
			var xAxis = d3.axisTop()
				.scale(xScale)
				.tickFormat(d3.timeFormat("%H:%I"));
			var yAxis = d3.axisLeft()
				.scale(yScale)
				.tickFormat(d3.format(".1f"));

			// draw x/y axis
			svg.select('.x-axis')
				.attr("transform", "translate(0, " + margin + ")")
				.call(xAxis);
			svg.select('.y-axis')
				.attr("transform", "translate(" + margin + ")")
				.call(yAxis);

			// add new data points
			svg.select('.data')
				.selectAll('circle').data(data)
				.enter()
				.append('circle');

			// update all data points
			svg.select('.data')
				.selectAll('circle').data(data)
				.attr('r', 2.5)
				.attr('cx', function(element) { return xScale(element.x); })
				.attr('cy', function(element) { return yScale(element.y); });
		};

		/**
		 * Directive's core implementation.
		 */
		return {
			restrict: 'E',
			scope: {
				data: '='
			},
			compile: function(element) {
				// Create a SVG root element
				var svg = d3.select(element[0]).append('svg');

				svg.append('g').attr('class', 'data');
				svg.append('g').attr('class', 'x-axis axis');
				svg.append('g').attr('class', 'y-axis axis');

				// Define the dimensions for the chart
				var width = 1000, height = 500;

				// Return link function (links directive to the DOM)
				return function(scope) {
					// watch the data attribute of the scope
					scope.$watch('data', function(newVal, oldVal, scope) {
						// map external data to internal generalized draw function format
						var data = scope.data.map(function() {
							// Update the chart
							if (scope.data) {
								draw(svg, width, height, scope.data);
							}
						});
					}, true);
				};
			}
		};
	}
]);