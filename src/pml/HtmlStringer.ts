/// <reference path='../../lib/illa/ArrayUtil.ts'/>
/// <reference path='../../lib/illa/StringUtil.ts'/>

/// <reference path='Node.ts'/>

module pml {
	export class HtmlStringer {

		private noEndTags: string[] = [
			'area',
			'base',
			'br',
			'col',
			'embed',
			'hr',
			'img',
			'input',
			'keygen',
			'link',
			'meta',
			'param',
			'source',
			'track',
			'wbr'
		];
		private inlineTags: string[] = [
			'b',
			'big',
			'i',
			'small',
			'tt',
			'abbr',
			'acronym',
			'cite',
			'code',
			'dfn',
			'em',
			'kbd',
			'strong',
			'samp',
			'var',
			'bdo',
			'br',
			'img',
			'map',
			'object',
			'q',
			'script',
			'span',
			'sub',
			'sup',
			'button',
			'input',
			'label',
			'select'
		];
		private inlineDependingOnContentTags: string[] = [
			'a'
		];
		private nonReplaceableCharacterTags: string[] = [
			'!--',
			'script',
			'style'
		];
		private preformattedTags: string[] = [
			'pre'
		];
		private noLineBreakExpansionTags: string[] = [
			'!--',
			'title'
		];

		private prettyPrint: boolean = true;
		private indentChar: string = '\t';
		private eolChar: string = '\n';
		private tabExpansion: string = '    ';
		private attributeChar: string = '@';
		private expandLineBreaks: boolean = false;
		private expandTabs: boolean = false;

		constructor() {

		}

		stringify(src: Node, level = -1): string {
			var result = '';
			
			var indent = '';
			for (var i = 0; i < level; i++) {
				indent += this.indentChar;
			}

			if (src.parent && src.name == '') {
				// If text node
				
				result += this.prepareText(src, indent);

			} else if (src.name.charAt(0) != this.attributeChar) {
				// If not attribute
				
				var startsWithExclamationMark = src.name.charAt(0) == '!';
				var isComment = src.name == '!--';
				var startsWithQuestionMark = src.name.charAt(0) == '?';
				var hasEnd = !startsWithExclamationMark && !startsWithQuestionMark && illa.ArrayUtil.indexOf(this.noEndTags, src.name) == -1
				var isBlock = this.checkIsBlock(src);
				

				if (src.parent) {
					// If not root
					
					if (this.prettyPrint) {
						if (isBlock || this.checkIsBlock(src.previousSibling)) {
							// Add EOL + indent if block or previous was block
							result += this.eolChar;
							result += indent;
						}
					}
					
					// Render start tag
					
					result += '<';
					result += illa.StringUtil.escapeHTML(src.name);

					if (src.children) {
						// Render attributes
						
						for (var i = 0, n = src.children.length; i < n; i++) {
							var child = src.children[i];
							if (child.name.charAt(0) == this.attributeChar) {
								var attributeName = child.name.slice(1);
								if (attributeName || child.value) result += ' ';
								
								// Attribute name is not required for old DOCTYPE support
								
								if (attributeName) {
									result += illa.StringUtil.escapeHTML(attributeName);
								}
								if (child.value) {
									if (attributeName) result += '=';
									result += '"' + illa.StringUtil.escapeHTML(child.value) + '"';
								}
							}
						}
					}
					
					// Render start tag end
					
					if (startsWithQuestionMark) result += '?';
					if (!hasEnd && !startsWithExclamationMark) result += '/';
					if (!isComment) result += '>';
				}

				if (hasEnd || isComment) {
					if (src.children) {
						for (var i = 0, n = src.children.length; i < n; i++) {
							var child = src.children[i];
							result += this.stringify(child, level + 1);
						}
					} else {
						result += this.prepareText(src, indent);
					}
				}

				if (src.parent && hasEnd) {
					if (this.prettyPrint) {
						if (this.checkHasBlockContent(src)) {
							result += this.eolChar;
							result += indent;
						}
					}

					result += '</';
					result += illa.StringUtil.escapeHTML(src.name);
					result += '>';
				}

				if (isComment) {
					result += '-->';
				}
			}

			return result;
		}

		protected prepareText(src: Node, indent: string): string {
			var result = src.value || '';
			if (!this.checkIsNonReplaceableCharacterTag(src)) {
				result = illa.StringUtil.escapeHTML(result);
				if (this.expandLineBreaks && !this.checkIsNoLineBreakExpansionTag(src)) {
					var breakTag = '<br/>';
					if (this.prettyPrint && !this.checkIsPreformattedTag(src)) {
						breakTag += this.eolChar + indent;
					}
					result = result.replace(/(?:\r\n|\n|\r)/g, breakTag);
				}
				if (this.expandTabs) {
					result = result.replace(/\t/g, this.tabExpansion);
				}
			}
			return result;
		}

		protected checkIsPreformattedTag(src: Node): boolean {
			if (!src) return false;
			return illa.ArrayUtil.indexOf(this.preformattedTags, src.name) > -1 || this.checkIsPreformattedTag(src.parent);
		}

		protected checkIsNoLineBreakExpansionTag(src: Node): boolean {
			if (!src) return false;
			return illa.ArrayUtil.indexOf(this.noLineBreakExpansionTags, src.name) > -1 || this.checkIsNoLineBreakExpansionTag(src.parent);
		}

		protected checkIsNonReplaceableCharacterTag(src: Node): boolean {
			if (!src) return false;
			return illa.ArrayUtil.indexOf(this.nonReplaceableCharacterTags, src.name) > -1 || this.checkIsNonReplaceableCharacterTag(src.parent);
		}

		protected checkIsInlineDependingOnContent(src: Node): boolean {
			if (!src) return false;
			return illa.ArrayUtil.indexOf(this.inlineDependingOnContentTags, src.name) > -1;
		}

		protected checkIsBlock(src: Node): boolean {
			if (!src) return false;
			switch (src.name.charAt(0)) {
				case '':
				case this.attributeChar:
				case '!':
				case '?':
					return false;
			}
			if (this.checkIsInlineDependingOnContent(src)) {
				return this.checkHasBlockContent(src);
			} else {
				return illa.ArrayUtil.indexOf(this.inlineTags, src.name) == -1;
			}
		}

		protected checkHasBlockContent(src: Node): boolean {
			if (src && src.children) {
				for (var i = 0, n = src.children.length; i < n; i++) {
					var child = src.children[i];
					if (this.checkIsBlock(child)) {
						return true;
					}
				}
			}
			return false;
		}

		getNoEndTags(): string[] {
			return this.noEndTags;
		}

		setNoEndTags(v: string[]): void {
			this.noEndTags = v;
		}

		getInlineTags(): string[] {
			return this.inlineTags;
		}

		setInlineTags(v: string[]): void {
			this.inlineTags = v;
		}

		getInlineDependingOnContentTags(): string[] {
			return this.inlineDependingOnContentTags;
		}

		setInlineDependingOnContentTags(v: string[]): void {
			this.inlineDependingOnContentTags = v;
		}

		getNonReplaceableCharacterTags(): string[] {
			return this.nonReplaceableCharacterTags;
		}

		setNonReplaceableCharacterTags(v: string[]): void {
			this.nonReplaceableCharacterTags = v;
		}

		getPrettyPrint(): boolean {
			return this.prettyPrint;
		}

		setPrettyPrint(v: boolean): void {
			this.prettyPrint = v;
		}

		getIndentChar(): string {
			return this.indentChar;
		}

		setIndentChar(v: string): void {
			this.indentChar = v;
		}

		getEolChar(): string {
			return this.eolChar;
		}

		setEolChar(v: string): void {
			this.eolChar = v;
		}

		getTabExpansion(): string {
			return this.tabExpansion;
		}

		setTabExpansion(v: string): void {
			this.tabExpansion = v;
		}
		
		getExpandLineBreaks(): boolean {
			return this.expandLineBreaks;
		}
		
		setExpandLineBreaks(v: boolean): void {
			this.expandLineBreaks = v;
		}
		
		getExpandTabs(): boolean {
			return this.expandTabs;
		}
		
		setExpandTabs(v: boolean): void {
			this.expandTabs = v;
		}
		
		getPreformattedTags(): string[] {
			return this.preformattedTags;
		}
		
		setPreformattedTags(v: string[]): void {
			this.preformattedTags = v;
		}
		
		getNoLineBreakExpansionTags(): string[] {
			return this.noLineBreakExpansionTags;
		}
		
		setNoLineBreakExpansionTags(v: string[]): void {
			this.noLineBreakExpansionTags = v;
		}
		
		getAttributeChar(): string {
			return this.attributeChar;
		}
		
		setAttributeChar(v: string): void {
			this.attributeChar = v;
		}
	}
}