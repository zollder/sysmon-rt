
var expression = /^([0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3})\s*-(.*?)-\s*\[(.*?)\]\s*"(.*?)"(.*?)\s*"-"\s*"(.*?)"$/ig;

/**
 * Tests angular http loader (service).
 */
describe('http-loader-test', function() {

	var loader, httpMock;

	beforeEach(module('sysmonjs'));

	beforeEach(inject(function(HttpLoaderService, $httpBackend) {
		loader = HttpLoaderService;
		$httpBackend
			.when('GET', '/base/tests/files/access.log')
			.respond('66.249.64.121 - - [22/Nov/2014:01:56:00 +0100] "GET /index.html HTTP/1.1" 200 2507 "-" ""');
		httpMock = $httpBackend;
	}));

	// load and verify
	it('should load log data', function() {
		var result;
        loader('/base/tests/files/access.log').then(function(response) { result = response.data; });

        // tells http service to load the results from the $httpBackend mock
        httpMock.flush();
		expect(result).toMatch(expression);
	});
});
