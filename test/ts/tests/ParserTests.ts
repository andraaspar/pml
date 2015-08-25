function describeParserTests(): void {
	describe('pml.Parser', function() {
		describe('.parse()', function() {
			context('invalid header', function() {
				it('should throw on double delimiter use', function() {
					expect(function() {
						pml.Parser.parse('{[|]{');
					}).to.throw('1:1: Comment start delimiter clashes with comment end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|[}');
					}).to.throw('1:2: Node start delimiter clashes with node end delimiter.');
					expect(function() {
						pml.Parser.parse('{[}]}');
					}).to.throw('1:3: Name end delimiter clashes with comment end delimiter.');
				});
				it('should throw on whitespace delimiter', function() {
					expect(function() {
						pml.Parser.parse('{[|] ');
					}).to.throw('1:5: Comment end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[|	}');
					}).to.throw('1:4: Node end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[|\n}');
					}).to.throw('1:4: Node end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[|\r}');
					}).to.throw('1:4: Node end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[| }');
					}).to.throw('1:4: Node end delimiter is a whitespace or line break character.');
				});
				it('should throw on a missing delimiter', function() {
					expect(function() {
						pml.Parser.parse('{[|]');
					}).to.throw('1:5: Comment end delimiter is missing.');
					expect(function() {
						pml.Parser.parse('{[');
					}).to.throw('1:3: Name end delimiter is missing.');
				});
			});
			context('invalid pml', function() {
				it('should warn about ignored content', function() {
					var consoleWarnStub = sinon.stub(console, 'warn');
					
					var expected = createNode('');
					createLeaf('foo', '', expected);
					createLeaf('bar', '', expected);
					
					var result = pml.Parser.parse('{[|]}[foo|]Ignored[bar|]');
					
					expect(consoleWarnStub.called).to.be.true;
					expect(consoleWarnStub.callCount).to.equal(1);
					expect(consoleWarnStub.getCall(0).args[0]).to.equal('1:12: Node has both children and value. Value will not be parsed.');
					expect(result).to.deep.equal(expected);
					
					consoleWarnStub.restore();
				});
				it('should throw on missing delimiters', function() {
					expect(function() {
						pml.Parser.parse('{[|]}[foo]');
					}).to.throw('1:10: Invalid node end delimiter, expected: name end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}[foo|');
					}).to.throw('1:10: Missing node end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}[foo');
					}).to.throw('1:9: Missing name end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}{');
					}).to.throw('1:6: Missing comment end delimiter.');
				});
				it('should throw on invalid delimiter location', function() {
					expect(function() {
						pml.Parser.parse('{[|]}[foo[bar|]|]');
					}).to.throw('1:10: Invalid node start delimiter, expected: name end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}[foo|bar|baz]');
					}).to.throw('1:14: Invalid name end delimiter in value.');
					expect(function() {
						pml.Parser.parse('{[|]}|');
					}).to.throw('1:6: Invalid name end delimiter in value.');
					expect(function() {
						pml.Parser.parse('{[|]}]');
					}).to.throw('1:6: Invalid location for node end delimiter.');
				});
			});
			context('valid pml', function() {
				it('should parse pml', function() {
					var result = pml.Parser.parse(`«◄•►»
◄Árvíztűrő tükörfúrógép•Flood-resistant mirror drill►
◄•►
◄root•
	◄leaf-1«1»•A«BC»►
	«Ign«ore» me.»
	◄leaf-2•
		◄•B►
		◄•b►
		«◄•d►»
	►
	◄leaf-3•C►
►
`);
					var expected = createNode('');
					createLeaf('Árvíztűrő tükörfúrógép', 'Flood-resistant mirror drill', expected);
					createLeaf('', '', expected);
					var root = createNode('root', expected);
					createLeaf('leaf-1', 'A', root);
					var leaf2 = createNode('leaf-2', root);
					createLeaf('', 'B', leaf2);
					createLeaf('', 'b', leaf2);
					createLeaf('leaf-3', 'C', root);
	
					expect(result).to.deep.equal(expected);
				});
			});
		});
	});
}