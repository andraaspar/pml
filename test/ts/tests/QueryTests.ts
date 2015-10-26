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
	
	describe('.prototype.children()', function() {
		it('Selects child nodes.', function() {
			expect(pq.children().getNodes()).toEqual(sampleData.children);
		});
	});
	describe('.prototype.getLength()', function() {
		it('Returns the correct length of root.', function() {
			expect(pq.getLength()).toEqual(1);
		});
		it('Returns the correct length of children.', function() {
			expect(pq.children().getLength()).toEqual(6);
		});
	});
	describe('.prototype.getNodes()', function() {
		it('Returns the root in an array.', function() {
			expect(pq.getNodes()).toEqual([sampleData]);
		});
		it('Returns the original list of nodes of root’s children.', function() {
			expect(pq.children().getNodes()).toEqual(sampleData.children);
		});
	});
	describe('.prototype.getName()', function() {
		it('Returns an empty string for root’s name.', function() {
			expect(pq.getName()).toEqual('');
		});
		it('Returns the name of the first node from a list.', function() {
			expect(pq.children().getName()).toEqual('foo');
		});
	});
	describe('.prototype.getValue()', function() {
		it('Returns undefined for a branches value.', function() {
			expect(pq.getValue()).toEqual(undefined);
		});
		it('Returns the value of the first node of the list.', function() {
			expect(pq.children().getValue()).toEqual('A');
		});
	});
	describe('.prototype.getNames()', function() {
		it('Returns the names of all nodes as an array.', function() {
			expect(pq.children().getNames()).toEqual(['foo', 'bar', 'baz', 'bar', 'quux', 'extra']);
		});
	});
	describe('.prototype.getValues()', function() {
		it('Returns an empty array when no leaves are selected.', function() {
			expect(pq.getValues()).toEqual([]);
		});
		it('Returns each leaf value from a list of branches and leaves.', function() {
			expect(pq.children().getValues()).toEqual(['A', '', 'C', 'D']);
		});
	});
	describe('.prototype.getIndex()', function() {
		it('Returns -1 for root.', function() {
			expect(pq.getIndex()).toEqual(-1);
		});
		it('Returns the index of the first node.', function() {
			expect(pq.children().branches().getIndex()).toEqual(4);
		});
	});
	describe('.prototype.leaves()', function() {
		it('Filters to leaf nodes.', function() {
			expect(pq.children().leaves().getNodes()).toEqual(sampleData.children.slice(0, 4));
		});
	});
	describe('.prototype.branches()', function() {
		it('Filters to branch nodes.', function() {
			expect(pq.children().branches().getNodes()).toEqual(sampleData.children.slice(4, 6));
		});
	});
	describe('.prototype.descendants()', function() {
		it('Selects descendant nodes.', function() {
			var pq = new pml.Query(pml.Parser.parse(`{[|]}
[a|
	[b|]
	[c|]
]
[d|
	[e|
		[f|]
	]
	[g|
		[h|]
	]
]
[i|]
`));
			expect(pq.descendants().getNames()).toEqual('abcdefghi'.split(''));
		});
	});
});