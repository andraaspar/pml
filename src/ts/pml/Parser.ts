/// <reference path='Element.ts'/>

module pml {
	export class Parser {
		
		private commentStart: string;
		private tagStart: string;
		private valueDelimiter: string;
		private tagEnd: string;
		private commentEnd: string;
		
		constructor() {
			
		}
		
		parse(src: string): Element {
			this.readDelimiters(src);
			var commentlessSrc = this.removeComments(src);
			return this.readElements(commentlessSrc);
		}
		
		protected readDelimiters(src: string): void {
			this.commentStart = src.slice(0, 1);
			this.tagStart = src.slice(1, 2);
			this.valueDelimiter = src.slice(2, 3);
			this.tagEnd = src.slice(3, 4);
			this.commentEnd = src.slice(4, 5);
		}
		
		protected removeComments(src: string): string {
			var commentSplit = src.split(this.commentStart);
			var commentlessSrc = commentSplit[0];
			var commentDepth = 0;
			
			for (var i = 1, n = commentSplit.length; i < n; i++) {
				commentDepth++;
				var sectionSplit = commentSplit[i].split(this.commentEnd);
				commentDepth -= sectionSplit.length - 1;
				if (commentDepth == 0) {
					commentlessSrc += sectionSplit[sectionSplit.length - 1];
				}
			}
			
			return commentlessSrc;
		}
		
		protected readElements(src: string): Element {
			var rootElement = new Element();
			rootElement.name = 'root';
			rootElement.children = [];
			
			var splitSrc = src.split(this.tagStart);
			var parentElement = rootElement;
			var previousElement: Element;
			
			for (var i = 1, n = splitSrc.length; i < n; i++) {
				var element = new Element();
				var tailSplit = splitSrc[i].split(this.tagEnd);
				var hasChildren = tailSplit.length == 1;
				var parentsClosed = tailSplit.length - 2;
				this.readTagContent(element, tailSplit[0], hasChildren);
				parentElement.children.push(element);
				element.parent = parentElement;
				if (previousElement) {
					previousElement.nextSibling = element;
					element.previousSibling = previousElement;
				}
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
			var contentSplit = src.split(this.valueDelimiter);
			element.name = contentSplit[0];
			if (!hasChildren) {
				element.value = contentSplit[1];
			}
		}
	}
}