/* jslint node: true */
/* jslint expr: true */
/*global describe, it, before, beforeEach, after, afterEach */
"use strict";

var chai = require('chai');
var should = chai.should();

var titleCase = require('../../../app/crawler/lib/title_case');

describe('titleCase behavior', function () {
  it('should put string in pascal case', function () {
    titleCase('HEUSTON BRIDGE').should.equal('Heuston Bridge');
  });

  it('should keep non alphanumeric characters', function () {
    titleCase('HEUSTON BRIDGE (SOUTH)').should.equal('Heuston Bridge (South)');
  });

  it('should preserve trailing \'s in english', function () {
    titleCase("ST. STEPHEN'S GREEN SOUTH").should.equal("St. Stephen's Green South");
  });

  it('should upper case \'s when begins a word', function () {
    titleCase("O'SULLIVAN").should.equal("O'Sullivan");
  });
});