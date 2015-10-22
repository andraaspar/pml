describe('pml.Query', function() {
	describe('Getters', function() {
		var sampleData = pml.Parser.parse(`{[|]}
[foo|A]
[bar|B]
[baz|C]
`);
		var pq = new pml.Query(sampleData);
		
		it('Returns the correct length.', function() {
			expect(pq.getLength()).toEqual(1);
			expect(pq.getChildren().getLength()).toEqual(3);
		});
	});
});