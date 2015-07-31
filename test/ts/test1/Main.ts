/// <reference path='../../../lib/illa/_module.ts'/>
/// <reference path='../../../lib/illa/Arrkup.ts'/>
/// <reference path='../../../lib/illa/Log.ts'/>

/// <reference path='../../../lib/jQuery.d.ts'/>

/// <reference path='../../../src/pml/Parser.ts'/>
/// <reference path='../../../src/pml/Stringer.ts'/>

module test1 {
	export class Main {
		
		private static instance = new Main();
		
		constructor() {
			jQuery(illa.bind(this.onDomLoaded, this));
		}
		
		onDomLoaded(): void {
			illa.Log.info('DOM loaded.');
			
			jQuery.ajax({
				url: 'content/{{test.pml}}'
			}).done(illa.bind(this.onPmlLoaded, this));
		}
		
		onPmlLoaded(data: string, textStatus: string, jqXHR: jQuery.IXHR): void {
			illa.Log.info(data);
			
			var parser = new pml.Parser();
			var stringer = new pml.Stringer();
			var root = parser.parse(data);
			root.children[0].name += ['{}', '[]', '|', '=', ':', '-'].join(' ');
			illa.Log.info(stringer.stringify(root));
		}
	}
}