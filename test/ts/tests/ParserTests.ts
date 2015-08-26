function describeParserTests(): void {
	describe('pml.Parser', function() {
		describe('.parse()', function() {
			describe('invalid header', function() {
				it('should throw on double delimiter use', function() {
					expect(function() {
						pml.Parser.parse('{[|]{');
					}).toThrow('1:1: Comment start delimiter clashes with comment end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|[}');
					}).toThrow('1:2: Node start delimiter clashes with node end delimiter.');
					expect(function() {
						pml.Parser.parse('{[}]}');
					}).toThrow('1:3: Name end delimiter clashes with comment end delimiter.');
				});
				it('should throw on whitespace delimiter', function() {
					expect(function() {
						pml.Parser.parse('{[|] ');
					}).toThrow('1:5: Comment end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[|	}');
					}).toThrow('1:4: Node end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[|\n}');
					}).toThrow('1:4: Node end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[|\r}');
					}).toThrow('1:4: Node end delimiter is a whitespace or line break character.');
					expect(function() {
						pml.Parser.parse('{[| }');
					}).toThrow('1:4: Node end delimiter is a whitespace or line break character.');
				});
				it('should throw on a missing delimiter', function() {
					expect(function() {
						pml.Parser.parse('{[|]');
					}).toThrow('1:5: Comment end delimiter is missing.');
					expect(function() {
						pml.Parser.parse('{[');
					}).toThrow('1:3: Name end delimiter is missing.');
				});
			});
			describe('invalid pml', function() {
				it('should warn about ignored content', function() {
					var consoleWarnSpy = spyOn(console, 'warn');
					
					var expected = createNode('');
					createLeaf('foo', '', expected);
					createLeaf('bar', '', expected);
					
					var result = pml.Parser.parse('{[|]}[foo|]Ignored[bar|]');
					
					expect(consoleWarnSpy).toHaveBeenCalled();
					expect(consoleWarnSpy.calls.count()).toEqual(1);
					expect(consoleWarnSpy).toHaveBeenCalledWith('1:12: Node has both children and value. Value will not be parsed.');
					expect(result).toEqual(expected);
				});
				it('should throw on missing delimiters', function() {
					expect(function() {
						pml.Parser.parse('{[|]}[foo]');
					}).toThrow('1:10: Invalid node end delimiter, expected: name end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}[foo|');
					}).toThrow('1:10: Missing node end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}[foo');
					}).toThrow('1:9: Missing name end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}{');
					}).toThrow('1:6: Missing comment end delimiter.');
				});
				it('should throw on invalid delimiter location', function() {
					expect(function() {
						pml.Parser.parse('{[|]}[foo[bar|]|]');
					}).toThrow('1:10: Invalid node start delimiter, expected: name end delimiter.');
					expect(function() {
						pml.Parser.parse('{[|]}[foo|bar|baz]');
					}).toThrow('1:14: Invalid name end delimiter in value.');
					expect(function() {
						pml.Parser.parse('{[|]}|');
					}).toThrow('1:6: Invalid name end delimiter in value.');
					expect(function() {
						pml.Parser.parse('{[|]}]');
					}).toThrow('1:6: Invalid location for node end delimiter.');
				});
			});
			describe('valid pml', function() {
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
	
					expect(result).toEqual(expected);
				});
			});
		});
	});
}