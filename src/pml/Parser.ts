/// <reference path='Element.ts'/>
/// <reference path='Linter.ts'/>
/// <reference path='ReaderBase.ts'/>

module pml {
	export class Parser extends ReaderBase {
		
		private source: string;
		
		private linter: Linter;
		private doesLint: boolean = true;
		
		constructor() {
			super();
			this.linter = new Linter();
			this.linter.setThrowOnError(true);
			this.linter.setLogMessages(true);
		}
		
		parse(src: string): Element {
			this.source = src;
			
			this.linter.lint(this.source);
			// If it did not throw, we can proceed.
			
			this.readDelimiters(this.source);
			var commentlessSource = this.removeComments(this.source);
			return this.readElements(commentlessSource);
		}
		
		protected removeComments(src: string): string {
			var commentSplit = src.split(this.getCommentStart());
			var commentlessSrc = commentSplit[0];
			var commentDepth = 0;
			
			for (var i = 1, n = commentSplit.length; i < n; i++) {
				commentDepth++;
				var sectionSplit = commentSplit[i].split(this.getCommentEnd());
				commentDepth -= sectionSplit.length - 1;
				if (commentDepth == 0) {
					commentlessSrc += sectionSplit[sectionSplit.length - 1];
				}
			}
			
			return commentlessSrc;
		}
		
		protected readElements(src: string): Element {
			var rootElement = new Element();
			rootElement.name = '';
			rootElement.children = [];
			
			var splitSrc = src.split(this.getTagStart());
			var parentElement = rootElement;
			var previousElement: Element;
			
			for (var i = 1, n = splitSrc.length; i < n; i++) {
				var element = new Element();
				var tailSplit = splitSrc[i].split(this.getTagEnd());
				var hasChildren = tailSplit.length == 1;
				var parentsClosed = tailSplit.length - 2;
				this.readTagContent(element, tailSplit[0], hasChildren);
				parentElement.children.push(element);
				element.parent = parentElement;
				if (previousElement) {
					previousElement.nextSibling = element;
					element.previousSibling = previousElement;
				}
				previousElement = element;
				if (hasChildren) {
					element.children = [];
					parentElement = element;
					previousElement = null;
				} else {
					while (parentsClosed) {
						previousElement = parentElement;
						parentElement = parentElement.parent;
						parentsClosed--;
					}
				}
			}
			
			return rootElement;
		}
		
		protected readTagContent(element: Element, src: string, hasChildren: boolean): void {
			var contentSplit = src.split(this.getValueDelimiter());
			element.name = contentSplit[0];
			if (!hasChildren) {
				element.value = contentSplit[1] || '';
			}
		}
		
		getDoesLint(): boolean {
			return this.doesLint;
		}
		
		setDoesLint(v: boolean): void {
			this.doesLint = v;
		}
		
		getLinter(): Linter {
			return this.linter;
		}
	}
}