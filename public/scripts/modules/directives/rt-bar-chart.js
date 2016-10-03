'use strict';

/**
 * Bar chart directive.
 */
angular.module('d3mod')

.directive('rtBarChart', ["d3",
	function(d3) {

		/**
		 * Generalized bar chart draw helper function.
		 * Renders bar chart based on specified parameters and data.
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
				.range([height - margin,  margin]);

			// define x/y-axis
			var xAxis = d3.axisBottom()
				.scale(xScale)
				.tickFormat(d3.timeFormat("%H:%I"));
			var yAxis = d3.axisLeft()
				.scale(yScale)
				.tickFormat(d3.format(".0f"));

			// draw x/y axis
			svg.select('.x-axis')
				.attr("transform", "translate(0, " + (height - margin) + ")")
				.call(xAxis);
			svg.select('.y-axis')
				.attr("transform", "translate(" + margin + ")")
				.call(yAxis);

			// draw x-grid
			svg.select(".x-grid")
				.attr("transform", "translate(0, " + margin + ")")
				.call(xAxis.tickSize(height - 2*margin, 0, 0).tickFormat(""));

			// draw y-grid
			svg.select(".y-grid")
				.attr("transform", "translate(" + margin + ")")
				.call(yAxis.tickSize(-width + 2*margin, 0, 0).tickFormat(""));

			// --------------Draw bars----------------

			var barWidth = (width - 2*margin)/data.length;

			// add new data points
			svg.select('.data')
				.selectAll('rect').data(data)
				.enter()
				.append('rect')
				.attr('class', 'data-bar');

			// update all data points
			svg.select('.data')
				.selectAll('rect').data(data)
				.attr('x', function(element) { return xScale(element.x) - barWidth/2; })
				.attr('y', function(element) { return yScale(element.y); })
				.attr('width', function(element) { return barWidth; })
				.attr('height', function(element) { return yScale(0) - yScale(element.y); });

			svg.select('.data')
				.selectAll('rect').data(data)
				.exit()
				.remove();
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

				// create containers
				var axis_container = svg.append('g').attr('class', 'axis');
				var data_container = svg.append('g').attr('class', 'data');

				// add container elements
				axis_container.append('g').attr('class', 'x-grid grid');
				axis_container.append('g').attr('class', 'y-grid grid');

				axis_container.append('g').attr('class', 'x-axis axis');
				axis_container.append('g').attr('class', 'y-axis axis');

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