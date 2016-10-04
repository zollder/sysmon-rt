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
			var duration = 2500;

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

			/*
			 * Custom interpolation function for arrays of objects in the form of {x:0,y:0}.
			 * Is used to animate d attribute.
			 */
			var interpolatePoints = function(A, B) {
				var interpolatorX = d3.interpolateArray(
					A.map(function(d) { return d.x; }),
					B.map(function(d) { return d.x; })
				);
				var interpolatorY = d3.interpolateArray(
					A.map(function(d) { return d.y; }),
					B.map(function(d) { return d.y; })
				);
				return function(t) {
					var x = interpolatorX(t);
					var y = interpolatorY(t);

					return x.map(function(d,i) {
						return {
							x: x[i],
							y: y[i]
						};
					});
				};
			};

			// add new data points
			svg.select('.data')
				.selectAll('circle').data(data)
				.enter()
				.append('circle')
				.attr('class', 'data-point');

			// update and animate all data points
			svg.select('.data')
				.selectAll('circle').data(data)
				.attr('r', 2.5)
				.attr('cx', function(d) { return xScale(d.x); })
				.attr('cy', yScale(0))
				.transition()
				.duration(duration)
				.attr('cy', function(d) { return yScale(d.y); });

			svg.select('.data')
				.selectAll('circle').data(data)
				.exit()
				.remove();

			// draw and animate a line
			var line = d3.line()
				.x(function(element) { return xScale(element.x); })
				.y(function(element) { return yScale(element.y); })
				.curve(d3.curveCardinal);
			svg.select(".data-line")
				.datum(data)
				.attr("d", line)
				.transition()
				.duration(duration)
				.attrTween("d", function() {
					var minValue = d3.min(data, function(d){ return d.y; });
					var start = data.map(function(d) {
						return {
							x: d.x,
							y: minValue
						};
					});
					return function(t) {
						var interpolate = interpolatePoints(start, data);
						return line(interpolate(t));
					};
				});

			// draw and animate an area
			var area = d3.area()
				.x(function(element) { return xScale(element.x); })
				.y0(yScale(0))
				.y1(function(element) { return yScale(element.y); })
				.curve(d3.curveCardinal);
			svg.select(".data-area")
				.datum(data)
				.attr("d", area)
				.transition()
				.duration(duration)
				.attrTween("d", function() {
					var min = d3.min(data, function(d){ return d.y; });
					var start = data.map(function(d) {
						return {
							x: d.x,
							y: min
						};
					});
					return function(t) {
						var interpolate = interpolatePoints(start, data);
						return area(interpolate(t));
					};
				});
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