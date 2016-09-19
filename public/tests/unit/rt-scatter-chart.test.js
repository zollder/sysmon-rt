
describe('rt-scatter-chart', function() {

	beforeEach(module('d3mod'));

	/**
	 * Initializes chart module and compiles a directive with sample data on its scope before each test.
	 * Creates a new isolated directive's scope.
	 */
	beforeEach(inject(function($rootScope, $compile) {
		/* Define the Directive */
		element = angular.element('<rt-scatter-chart class="chart" data="data"></rt-scatter-chart>');

		/* Define the Data on the Scope */
		scope = $rootScope.$new();
		scope.data = [];

		$compile(element)(scope);
		scope.$digest();
	}));

	// verify svg element is created
	it('should create svg parent', function() {
		var svg = element.find('svg');
		expect(svg.length).toBe(1);
	});

	// verify group containers are properly created
	it('should create containers for data and axis', function() {
		var groups = element.find('svg').find('g');
		expect(groups.length).toBe(3);
	});

	// verify no data points exist
	it('should create a data point', function() {
		var circles = element.find('svg').find('circle');
		expect(circles.length).toBe(0);

		// add a data point
		scope.data.push({
			time: (new Date('2014-01-01 00:00:00')).toString(),
			visitors:3
		});

		// trigger a digest cycle and verify that a data point was added
		scope.$digest();
		circles = element.find('svg').find('circle');
		expect(circles.length).toBe(1);
	});
});
