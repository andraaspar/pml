describe('pml.Query', function() {
	var sampleData = pml.Parser.parse(`{[|]}
[foo|A]
[bar|]
[baz|C]
[bar|D]
[quux|
	[|argle]
	[bargle|morple]
	[swoosh|]
]
[extra|
	[|]
	[2|]
]
`);
	var pq = new pml.Query(sampleData);
	
	describe('.prototype.getLength()', function() {
		it('Returns the correct length.', function() {
			expect(pq.getLength()).toEqual(1);
			expect(pq.getChildren().getLength()).toEqual(6);
		});
	});
	describe('.prototype.getNodes()', function() {
		it('Returns the original list of nodes.', function() {
			expect(pq.getNodes()).toEqual([sampleData]);
			expect(pq.getChildren().getNodes()).toEqual(sampleData.children);
		});
	});
	describe('.prototype.getName()', function() {
		it('Returns the name of the first node.', function() {
			expect(pq.getName()).toEqual('');
			expect(pq.getChildren().getName()).toEqual('foo');
		});
	});
	describe('.prototype.getValue()', function() {
		it('Returns the value of the first node.', function() {
			expect(pq.getValue()).toEqual(undefined);
			expect(pq.getChildren().getValue()).toEqual('A');
		});
	});
	describe('.prototype.getNames()', function() {
		it('Returns each name from the list.', function() {
			expect(pq.getNames()).toEqual(['']);
			expect(pq.getChildren().getNames()).toEqual(['foo', 'bar', 'baz', 'bar', 'quux', 'extra']);
		});
	});
	describe('.prototype.getValues()', function() {
		it('Returns each value from the list.', function() {
			expect(pq.getValues()).toEqual([]);
			expect(pq.getChildren().getValues()).toEqual(['A', '', 'C', 'D']);
		});
	});
	describe('.prototype.getLeaves()', function() {
		it('Filters to leaf nodes.', function() {
			expect(pq.getLeaves().getLength()).toEqual(0);
			expect(pq.getChildren().getLeaves().getLength()).toEqual(4);
		});
	});
	describe('.prototype.getBranches()', function() {
		it('Filters to branch nodes.', function() {
			expect(pq.getBranches().getLength()).toEqual(1);
			expect(pq.getChildren().getBranches().getLength()).toEqual(2);
		});
	});
});