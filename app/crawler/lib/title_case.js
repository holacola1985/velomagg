/* jslint node: true */
"use strict";

var lowerCase = require('lower-case');
var upperCase = require('upper-case');

var CAMEL_CASE_REGEXP = require('./camel-case-regexp');
var TRAILING_DIGIT_REGEXP = require('./trailing-digit-regexp');

module.exports = function (string, locale) {
  if (string == null) {
    return '';
  }

  return lowerCase(String(string)
    // Support camel case ("camelCase" -> "camel Case").
    .replace(CAMEL_CASE_REGEXP, '$1 $2')
    // Support digit groups ("test2012" -> "test 2012").
    .replace(TRAILING_DIGIT_REGEXP, '$1 $2'), locale)
    .replace(/^.|[^a-zA-Z\d]+.| ./g, function (m) {
      return upperCase(m, locale)
    })
    // trailing 's in english
    .replace(/'S/g, '\'s')
    .replace(/'s([a-zA-Z])/g, '\'S$1');
};