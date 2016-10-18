'use strict';

/**
 * Brush chart directive.
 */
angular.module('d3mod')

.directive('rtBrushChart', ["d3",
	function(d3) {

		/**
		 * Generalized brush chart draw helper function.
		 * Renders brush chart based on specified parameters and data.
		 */
		var draw = function(svg, width, height, data, dispatcher) {
			// stop drawing if there is no data
			if (data && !data.length) {
				return;
			}

			svg
				.attr('width', width)
				.attr('height', height);

			// init base parameters
			var margin = 5;
			var duration = 2500;
			var easeCube = d3.easeCubic;

			// define x/y-scale
			var xScale = d3.scaleTime()
				.domain(d3.extent(data, function(d) { return d.x; }))
				.range([margin, width - margin]);
			var yScale = d3.scaleTime()
				.domain([0, d3.max(data, function(d) { return d.y; })])
				.range([height - margin,  margin]);

			// draw and animate a line
			var lineStart = d3.line()
				.x(function(d) { return xScale(d.x); })
				.y(function(d) { return yScale(0); })
				.curve(d3.curveCardinal);
			var lineEnd = d3.line()
				.x(function(d) { return xScale(d.x); })
				.y(function(d) { return yScale(d.y); })
				.curve(d3.curveCardinal);
			svg.select(".data-line")
				.datum(data)
				.attr("d", lineStart)
				.transition()
				.duration(duration)
				.attr("d", lineEnd);

			// draw and animate an area
			var areaStart = d3.area()
				.x(function(d) { return xScale(d.x); })
				.y0(yScale(0))
				.y1(function(d) { return yScale(0); })
				.curve(d3.curveCardinal);
			var areaEnd = d3.area()
				.x(function(d) { return xScale(d.x); })
				.y0(yScale(0))
				.y1(function(d) { return yScale(d.y); })
				.curve(d3.curveCardinal);
			svg.select(".data-area")
				.datum(data)
				.attr("d", areaStart)
				.transition()
				.duration(duration)
				.attr("d", areaEnd);

			var brush = d3.brushX()
				.extent([[0, 0], [width, height]])
				.on("start", function() { dispatcher.brushstart(brush); })
				.on("brush", function() { dispatcher.brush(brush); })
				.on("end", function() { dispatcher.brushsend(brush); });

			svg.select('.brush')
				.call(brush)
				.selectAll("rect")
				.attr("y", 0)
				.attr("height", height-margin);
		};

		/**
		 * Directive's core implementation.
		 */
		return {
			restrict: 'E',
			scope: {
				data: '=',
				brush: '='
			},
			compile: function(element) {
				// Create a SVG root element
				var svg = d3.select(element[0]).append('svg');

				// create containers
				var visibleCont = svg.append('g').attr('class', 'visible');
				var dataContainer = visibleCont.append('g').attr('class', 'data');
				var brushContainer = visibleCont.append('g').attr('class', 'brush');

				// add container elements
				dataContainer.append('path').attr('class', 'data-line');
				dataContainer.append('path').attr('class', 'data-area');

		        // initialize "cursorchange" event and create a dispatcher
		        var dispatcher = d3.dispatch("brushstart", "brush", "brushend");

				// define brush chart dimensions
				var width = 300, height = 50;

				// Return link function (links directive to the DOM)
				return function(scope) {
					/* Add "brush" event listener/handler. */
					dispatcher.on('brush', function(brush) {
						scope.$apply(function() {
							scope.brush = brush.extent();
						});
					});

					// watch the data attribute of the scope
					scope.$watch('data', function(newVal, oldVal, scope) {
						// Update the chart
						if (scope.data) {
							draw(svg, width, height, scope.data, dispatcher);
						}
					}, true);
				};
			}
		};
	}
]);