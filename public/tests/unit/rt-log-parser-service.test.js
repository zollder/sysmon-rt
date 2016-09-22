
/**
 * Tests log parser service.
 */
describe('log-parser-test', function() {

	var parser, dataString;

	beforeEach(module('sysmonjs'));

	beforeEach(inject(function(ParserService) {
		parser = ParserService;
		dataString = '66.249.64.121 - - [22/Nov/2014:01:56:00 +0100] "GET /robots.txt HTTP/1.1" 302 507 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"';
	}));

	// load and build data map
	it('should parse log data', function() {
		var parsedData = parser(dataString);
		var mappedData = parsedData.map(function(items) {
			return {
				ip: items[0],
				time: items[2],
				request: items[3],
				status: items[4],
				agent: items[8]
			};
		});

		// verify
		expect(mappedData[0].ip).toBe('66.249.64.121');
		expect(mappedData[0].time).toBe('22/Nov/2014:01:56:00 +0100');
		expect(mappedData[0].request).toBe('GET /robots.txt HTTP/1.1');
		expect(mappedData[0].status).toBe('302 507');
		expect(mappedData[0].agent).toBe('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)');
	});
});
