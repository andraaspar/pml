/// <reference path='../../../lib/jQuery.d.ts'/>

/// <reference path='../../../lib/illa/Log.ts'/>

/// <reference path='../../../src/pml/HtmlParser.ts'/>
/// <reference path='../../../src/pml/Stringer.ts'/>

module test2 {
	export class Main {

		private static instance = new Main();

		constructor() {
			jQuery(illa.bind(this.onDomLoaded, this));
		}

		onDomLoaded(): void {
			illa.Log.info('DOM loaded.');

			jQuery.ajax({
				url: 'content/{{test.html}}'
			}).done(illa.bind(this.onPmlLoaded, this));
		}

		onPmlLoaded(data: string, textStatus: string, jqXHR: jQuery.IXHR): void {
			illa.Log.info(data);
			
			var htmlParser = new pml.HtmlParser();

			var root = htmlParser.parse(data);
			
			console.log(root);

			var stringer = new pml.Stringer();
			illa.Log.info(stringer.stringify(root));
		}
	}
}