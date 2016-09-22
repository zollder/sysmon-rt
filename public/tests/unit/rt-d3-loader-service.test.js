
var expression = /^([0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3})\s*-(.*?)-\s*\[(.*?)\]\s*"(.*?)"(.*?)\s*"-"\s*"(.*?)"$/ig;

/**
 * Tests the service that loads data from the log file.
 * Uses runs-waitFor-runs model.
 */
describe('d3-loader-test', function() {

	var loader, result;

	// load d3mod module and inject the loader before each test run
	beforeEach(module('d3mod'));
	beforeEach(inject(function(D3LoaderService) {
		loader = D3LoaderService;
	}));

	// load data and set timeout before firing the callback
	beforeEach(function(done) {
        loader('/base/tests/files/access.log', function(data) {
            result = data;
        });

        // fire callback after a timeout to let the loader to load data
        setTimeout(function () {
            console.log('inside timeout');
            done();
        }, 500);
	});

	// verify
	it('should load log data', function() {
		expect(result).toMatch(expression);
	});
});
