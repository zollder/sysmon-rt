'use strict';

/**
 * Line chart directive.
 */
angular.module('d3mod')

.directive('rtLineChart', ["d3",
	function(d3) {

		/**
		 * Generalized line chart draw helper function.
		 * Renders line chart based on specified parameters and data.
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

			// add new data points
			svg.select('.data')
				.selectAll('circle').data(data)
				.enter()
				.append('circle')
				.attr('class', 'data-point');

			// update all data points
			svg.select('.data')
				.selectAll('circle').data(data)
				.attr('r', 2.5)
				.attr('cx', function(element) { return xScale(element.x); })
				.attr('cy', function(element) { return yScale(element.y); });

			svg.select('.data')
				.selectAll('circle').data(data)
				.exit()
				.remove();

			// draw a line
			var line = d3.line()
				.x(function(element) { return xScale(element.x); })
				.y(function(element) { return yScale(element.y); })
				.curve(d3.curveCardinal);
			svg.select(".data-line").datum(data).attr("d", line);

			// draw an area
			var area = d3.area()
				.x(function(element) { return xScale(element.x); })
				.y0(yScale(0))
				.y1(function(element) { return yScale(element.y); })
				.curve(d3.curveCardinal);
			svg.select(".data-area").datum(data).attr("d", area);
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

				data_container.append('path').attr('class', 'data-line');
				data_container.append('path').attr('class', 'data-area');

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