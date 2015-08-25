/// <reference path='../../../lib/node.d.ts'/>
/// <reference path='../../../lib/lib.core.es6.d.ts'/>

/// <reference path='../mocha.d.ts'/>
/// <reference path='../chai.d.ts'/>
/// <reference path='../sinon.d.ts'/>

/// <reference path='../../../src/pml/Parser.ts'/>
/// <reference path='../../../src/pml/Stringer.ts'/>

/// <reference path='NodeHelpers.ts'/>

/// <reference path='ParserTests.ts'/>
/// <reference path='StringerTests.ts'/>

if (illa.GLOBAL.process) {
	illa.GLOBAL.chai = require('chai');
	illa.GLOBAL.sinon = require('sinon');
}
var expect = chai.expect;

describeParserTests();
describeStringerTests();
