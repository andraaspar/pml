/// <reference path='Pair.ts'/>
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
		
		parse(src: string): Pair {
			this.source = src;
			
			this.linter.lint(this.source);
			// If it did not throw, we can proceed.
			
			this.readDelimiters(this.source);
			var commentlessSource = this.removeComments(this.source);
			return this.readPairs(commentlessSource);
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
		
		protected readPairs(src: string): Pair {
			var rootPair = new Pair();
			rootPair.name = '';
			rootPair.children = [];
			
			var splitSrc = src.split(this.getKeyStart());
			var parentPair = rootPair;
			var previousPair: Pair;
			
			for (var i = 1, n = splitSrc.length; i < n; i++) {
				var pair = new Pair();
				var tailSplit = splitSrc[i].split(this.getValueEnd());
				var hasChildren = tailSplit.length == 1;
				var parentsClosed = tailSplit.length - 2;
				this.readPairContent(pair, tailSplit[0], hasChildren);
				parentPair.children.push(pair);
				pair.parent = parentPair;
				if (previousPair) {
					previousPair.nextSibling = pair;
					pair.previousSibling = previousPair;
				}
				previousPair = pair;
				if (hasChildren) {
					pair.children = [];
					parentPair = pair;
					previousPair = null;
				} else {
					while (parentsClosed) {
						previousPair = parentPair;
						parentPair = parentPair.parent;
						parentsClosed--;
					}
				}
			}
			
			return rootPair;
		}
		
		protected readPairContent(pair: Pair, src: string, hasChildren: boolean): void {
			var contentSplit = src.split(this.getValueStart());
			pair.name = contentSplit[0];
			if (!hasChildren) {
				pair.value = contentSplit[1] || '';
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