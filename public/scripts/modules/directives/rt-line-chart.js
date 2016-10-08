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
		var draw = function(svg, width, height, data, dispatcher) {
			svg
				.attr('width', width)
				.attr('height', height);

			// define a margin
			var margin = 50;
			var duration = 2500;
			var easeCube = d3.easeCubic;

			// define x/y-scale
			var xScale = d3.scaleTime()
				.domain(d3.extent(data, function(d) { return d.x; }))
				.range([margin, width - margin]);
			var yScale = d3.scaleTime()
				.domain([0, d3.max(data, function(d) { return d.y; })])
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
				.ease(d3.easeCubic)
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
				.ease(d3.easeCubic)
				.duration(duration)
				.attr("d", areaEnd);

			// --------------Cursors and labels ----------------
			var xCursor = svg.select('.x-cursor');
			var yCursor = svg.select('.y-cursor');
			var activePoint = svg.select('.data-point-active');

			var xLabel = svg.select('.x-label');
			var yLabel = svg.select('.y-label');

			// add an event listener/handler to a mouse-move event
			svg.on('mousemove', function() {
				var delay = 50;

				// obtain mouse pointer coordinates/position (in pixels)
				var position = d3.mouse(this);

				// obtain a valid dataset value from a given pixel value of the cursor position
				var xValue = xScale.invert(position[0]);
				var yValue = yScale.invert(position[1]);

				// obtain min/max values, minY = 0
				var xMin = d3.min(data, function(d) { return d.x; });
				var xMax = d3.max(data, function(d) { return d.x; });
				var yMax = d3.max(data, function(d) { return d.y; });

				// find x element index that is bigger than xValue
				// use custom bisector function that traverses the dataset from the left
				var xBisect = d3.bisector(function(d) { return d.x; }).left;
				var xIndex = xBisect(data, xValue);

				// validate index range
				if (xIndex === undefined || xIndex <= 0 || xIndex >= data.length) {
					return;
				}

				// determine the neighbor data point that is closer to the intersection
				var closestPoint = (data[xIndex] - xValue) >= (xValue - data[xIndex - 1]) ? data[xIndex - 1] : data[xIndex];

				// set/adjust coordinates of the active point and cursor lines
		        activePoint
		        	.attr("cx", xScale(closestPoint.x))
		        	.attr("cy", yScale(closestPoint.y))
		        	.attr("r", 3);

				// 2 points have to be defined to draw each line
				xCursor
					.transition()
					.duration(delay)
					.attr('x1', xScale(closestPoint.x))
					.attr('y1', yScale(0))
					.attr('x2', xScale(closestPoint.x))
					.attr('y2', yScale(yMax));
		        yCursor
					.transition()
					.duration(delay)
					.attr('x1', xScale(xMin))
					.attr('y1', yScale(closestPoint.y))
					.attr('x2', xScale(xMax))
					.attr('y2', yScale(closestPoint.y));

		        // -------- Labels ---------
		        var hMargin = -8;
		        var vMargin = 3;

		        var xLeft = xScale(closestPoint.x) + vMargin;
		        var xTop = yScale(0);

		        var date = new Date(+closestPoint.x);
		        var dateFormat = d3.timeFormat('%H:%M');

				xLabel
					.transition()
					.duration(delay)
					.attr('transform', 'translate(' + xLeft + ',' + xTop + ') rotate(-90)');
				xLabel.select('text').text(dateFormat(date));
				xLabel.select('path').style('display', 'block');

		        var yLeft = xScale(xMin);
		        var yTop = yScale(closestPoint.y) + vMargin;

				yLabel
					.transition()
					.duration(delay)
					.attr('transform', 'translate('+ yLeft +','+ yTop +')');
				yLabel.select('text').text(d3.format(".0f")(closestPoint.y));
				yLabel.select('path').style('display', 'block');

				// Dispatch cursor change events (calls all registered handlers).
				dispatcher.call("cursorchange", this, { date:closestPoint.x, value:closestPoint.y });
			});

			// --------- ZOOMING ----------
			var zoom = d3.zoom()
				.on("zoom", function() {
					svg.select('.visible').attr("transform", d3.event.transform);
				});
			svg.call(zoom);
		};

		/**
		 * Directive's core implementation.
		 */
		return {
			restrict: 'E',
			scope: {
				data: '=',
				cursor: '='
			},
			compile: function(element) {
				// Create a SVG root element
				var svg = d3.select(element[0]).append('svg');

				// create containers
				var visibleCont = svg.append('g').attr('class', 'visible');
				var axisContainer = visibleCont.append('g').attr('class', 'axis');
				var dataContainer = visibleCont.append('g').attr('class', 'data');
				var focusContainer = visibleCont.append('g').attr('class', 'focus');
				var cursorContainer = axisContainer.append('g').attr('class', 'cursor');

				// add container elements
				axisContainer.append('g').attr('class', 'x-grid grid');
				axisContainer.append('g').attr('class', 'y-grid grid');

				axisContainer.append('g').attr('class', 'x-axis axis');
				axisContainer.append('g').attr('class', 'y-axis axis');

				dataContainer.append('path').attr('class', 'data-line');
				dataContainer.append('path').attr('class', 'data-area');

				cursorContainer.append('line').attr('class', 'x-cursor cursor');
				cursorContainer.append('line').attr('class', 'y-cursor cursor');

				focusContainer.append('circle').attr('class', 'data-point-active');

		        var xLabelNode = focusContainer.append('g').attr('class', 'x-label label');
		        var yLabelNode = focusContainer.append('g').attr('class', 'y-label label');

		        // label shape path
		        var tag_path = 'M 51.166,23.963 62.359,17.5 c 1.43,-0.824 1.43,-2.175 0,-3 L 51.166,8.037 48.568,1.537 2,1.4693227 2,30.576466 48.568,30.463 z';

		        xLabelNode.append('path')
		        	.style('display', 'none')
		        	.attr('d', tag_path)
		        	.attr('transform', 'translate(-50, -15) scale(0.7)');
		        xLabelNode.append('text')
		        	.attr('transform', 'translate(-20)');

		        yLabelNode.append('path')
		        	.style('display', 'none')
		        	.attr('d', tag_path)
		        	.attr('transform', 'translate(-50, -15) scale(0.7)');
		        yLabelNode.append('text')
		        	.attr('transform', 'translate(-20)');

		        // initialize "cursorchange" event and create a dispatcher
		        var dispatcher = d3.dispatch("cursorchange");

				// Define the dimensions for the chart
				var width = 1000, height = 500;

				// Return link function (links directive to the DOM)
				return function(scope) {
					/* Add "cursorchange" event listener/handler.
					 * Listen on cursor changes, and update the scope variable outside the chart library. */
					dispatcher.on('cursorchange', function(cursorData) {
//						console.log("Custom event called with args:", cursorData);
						if (cursorData) {
							// inform Angular about the change by triggering the "digest" cycle
							scope.$apply(function() {
								scope.cursor = cursorData;
							});
			            }
					});

					// watch the data attribute of the scope
					scope.$watch('data', function(newVal, oldVal, scope) {
						// map external data to internal generalized draw function format
						var data = scope.data.map(function() {
							// Update the chart
							if (scope.data) {
								draw(svg, width, height, scope.data, dispatcher);
							}
						});
					}, true);
				};
			}
		};
	}
]);