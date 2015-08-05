/// <reference path='../../../lib/jQuery.d.ts'/>

/// <reference path='../../../src/pml/HtmlStringer.ts'/>
/// <reference path='../../../src/pml/Parser.ts'/>
/// <reference path='../../../src/pml/Stringer.ts'/>
/// <reference path='../../../src/pml/Tidy.ts'/>

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

			parser.getLinter().setThrowOnError(false);

			var root = parser.parse(data);
			illa.Log.info(parser.getLinter().getMessageKindCount(pml.MessageKind.ERROR) + ' errors, ' + parser.getLinter().getMessageKindCount(pml.MessageKind.WARNING) + ' warnings.');

			var stringer = new pml.Stringer(['«»', '◄►'], ['•']);
			illa.Log.info(stringer.stringify(root));

			var htmlStringer = new pml.HtmlStringer();
			htmlStringer.setExpandLineBreaks(true);
			htmlStringer.setExpandTabs(true);
			
			var htmlOut = htmlStringer.stringify(root);
			illa.Log.info(htmlOut);

			var iframe = jQuery('<iframe>').appendTo('body');
			(<HTMLIFrameElement>iframe.get(0)).src = 'data:text/html;charset=utf-8,' + htmlOut;
			
			var tidy = new pml.Tidy();
			tidy.setConvertIgnoredValueToTag(true);
			illa.Log.info(tidy.tidy(data));
		}
	}
}