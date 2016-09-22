'use strict';

angular.module('sysmonjs')

/**
 * Creates an injectable data string parser service.
 * Parses specified data string using provided or default regular expressions Wraps the XHR GET requests and returns the Promise created by the $http.get() method.
 */
.factory('ParserService', function() {
		return function(dataString, lineExpr, wordExpr, cleanExpr) {
			lineExpr = lineExpr || "\n";
			wordExpr = wordExpr || /[-"]/gi;
            cleanExpr = cleanExpr || /["\[\]]/gi;

            return dataString.trim().split(lineExpr).map(function(line) {
            	return line.split(wordExpr).map(function(element) {
            		return element.trim().replace(cleanExpr, '');
            	});
            });
		}
});