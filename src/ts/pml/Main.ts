/// <reference path='../../../lib/illa/_module.ts'/>
/// <reference path='../../../lib/illa/Arrkup.ts'/>
/// <reference path='../../../lib/illa/Log.ts'/>

/// <reference path='../../../lib/jQuery.d.ts'/>

/// <reference path='Parser.ts'/>

module pml {
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
			
			var parser = new Parser();
			illa.Log.info(parser.parse(data));
		}
	}
}