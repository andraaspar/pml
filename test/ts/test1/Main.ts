/// <reference path='../../../lib/jQuery.d.ts'/>

/// <reference path='../../../src/pml/HtmlStringer.ts'/>
/// <reference path='../../../src/pml/Parser.ts'/>
/// <reference path='../../../src/pml/Stringer.ts'/>
/// <reference path='../../../src/pml/Tidier.ts'/>

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
			
			var tidier = new pml.Tidier();
			tidier.setConvertIgnoredValueToNode(true);
			var tidyData = tidier.tidy(data);
			illa.Log.info(tidyData);
			
			var linter = new pml.Linter();
			linter.setThrowOnError(false);
			linter.lint(tidyData);
			illa.Log.info(linter.getMessageKindCount(pml.MessageKind.ERROR) + ' errors, ' + linter.getMessageKindCount(pml.MessageKind.WARNING) + ' warnings.');
		}
	}
}