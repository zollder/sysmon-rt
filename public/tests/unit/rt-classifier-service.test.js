
/**
 * Tests classifier/grouping service.
 */
describe('classifier-test', function() {

	var classifier, sample;

	beforeEach(module('d3mod'));

	beforeEach(inject(function(ClassifierService) {
		classifier = ClassifierService;
		sample = [{a:1}, {a:2}, {a:3}];
	}));

	it('should group log data', function() {
		var groupedData = classifier(sample, function(entry) { return entry.a; });
		console.log(groupedData);

		// verify, expected: [Object{x: '1', y: 1}, Object{x: '2', y: 1}, Object{x: '3', y: 1}]
		expect(groupedData[0].x).toBe('1'); expect(groupedData[0].y).toBe(1);
		expect(groupedData[1].x).toBe('2'); expect(groupedData[1].y).toBe(1);
		expect(groupedData[2].x).toBe('3'); expect(groupedData[2].y).toBe(1);
	});

	it('should group the data in an interval', function() {
		var groupedData = classifier(sample, function(entry) {
			var coeff = 2;
			return Math.round(entry.a/coeff)*coeff;
		});
		console.log(groupedData);

		// verify, expected: [Object{x: '2', y: 2}, Object{x: '4', y: 1}]
		expect(groupedData[0].x).toBe('2'); expect(groupedData[0].y).toBe(2);
		expect(groupedData[1].x).toBe('4'); expect(groupedData[1].y).toBe(1);
	});
});
