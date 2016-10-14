'use strict';

/**
 * Bar chart directive.
 */
angular.module('d3mod')

.directive('rtBarChart', ["d3", "$filter",
	function(d3, $filter) {
		/**
		 * Generalized bar chart draw helper function.
		 * Renders bar chart based on specified parameters and data.
		 */
		function draw(svg, width, height, data, dispatcher) {
			svg
				.attr('width', width)
				.attr('height', height);

			// define a margin
			var margin = 50;
			var duration = 2500;

			// define x/y-scale
			var xScale = d3.scaleTime()
				.domain(d3.extent(data, function(element) { return element.x; }))
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
			var maxY = d3.max(data, function(d) { return d.y; });
			var easeCube = d3.easeCubic;

			// add new data points
			svg.select('.data')
				.selectAll('rect').data(data)
				.enter()
				.append('rect')
				.attr('class', 'data-bar');

			// update all data points
			svg.select('.data')
				.selectAll('rect').data(data)
				.attr('x', function(d) { return xScale(d.x) - barWidth/2; })
				.attr('y', yScale(0))
				.attr('width', function(d) { return barWidth; })
				.attr('height', 0)
				.transition()
				.duration(function(d,i) { return duration*(d.y/maxY); })	// relative duration
				.ease(easeCube)
				.attr('y', function(d) { return yScale(d.y); })
				.attr('height', function(d) { return yScale(0) - yScale(d.y); });

			svg.select('.data')
				.selectAll('rect').data(data)
				.exit()
				.remove();

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
					.ease(easeCube)
					.duration(delay)
					.attr('transform', 'translate(' + xLeft + ',' + xTop + ') rotate(-90)');
				xLabel.select('text').text(dateFormat(date));
				xLabel.select('path').style('display', 'block');

		        var yLeft = xScale(xMin);
		        var yTop = yScale(closestPoint.y) + vMargin;

				yLabel
					.transition()
					.ease(easeCube)
					.duration(delay)
					.attr('transform', 'translate('+ yLeft +','+ yTop +')');
				yLabel.select('text').text(d3.format(".0f")(closestPoint.y));
				yLabel.select('path').style('display', 'block');

				// Dispatch cursor change events (calls all registered handlers).
				dispatcher.call("cursorchange", this, { date:closestPoint.x, value:closestPoint.y });
			});
		};

		/**
		 * Generalized bar chart draw helper function.
		 * Renders bar chart based on specified parameters and data.
		 */
		function filter(data, minDate, maxDate) {
			// create a shallow copy of the original data
			var filteredData = data.slice(0);
			if (minDate !== undefined) {
				filteredData = $filter('gteDate')(filteredData, minDate);
			}
			if (maxDate !== undefined) {
				filteredData = $filter('lteDate')(filteredData, maxDate);
			}
			return filteredData;
		};

		/**
		 * Directive's core implementation.
		 * Integrates the chart library and the application via an event system
		 * with event registrations and an event handler function.
		 */
		return {
			restrict: 'E',
			scope: {	// directive's private scope
				data: '=',
				cursor: '=',
				startDate: '=',
				endDate: '='
			},
			compile: function(element) {
				// Create an SVG root element
				var svg = d3.select(element[0]).append('svg');

				// initialize containers
				var axisContainer = svg.append('g').attr('class', 'axis');
				var dataContainer = svg.append('g').attr('class', 'data');
				var cursorContainer = svg.append('g').attr('class', 'cursor');
				var focusContainer = svg.append('g').attr('class', 'focus');

				// add container elements
				axisContainer.append('g').attr('class', 'x-grid grid');
				axisContainer.append('g').attr('class', 'y-grid grid');

				axisContainer.append('g').attr('class', 'x-axis axis');
				axisContainer.append('g').attr('class', 'y-axis axis');

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

				// define chart dimensions
				var width = 1000, height = 500;

				// -------- LINK FUNCTION------------

				// return link function (links directive to the DOM)
				return function(scope) {

					/* Add "cursorchange" event listener/handler.
					 * Listen on cursor changes, and update the scope variable outside the chart library. */
					dispatcher.on('cursorchange', function(cursorData) {
						if (cursorData) {
							// inform Angular about the change by triggering the "digest" cycle
							scope.$apply(function() {
								scope.cursor = cursorData;
							});
			            }
					});

					// watch the data attribute of the scope
					scope.$watch('[data, startDate, endDate]', function(newVal, oldVal, scope) {
						// Update the chart
						if (scope.data) {
							var filteredData = filter(scope.data, scope.startDate, scope.endDate);
							draw(svg, width, height, filteredData, dispatcher);
						}
					}, true);
				};
			}
		};
	}
]);