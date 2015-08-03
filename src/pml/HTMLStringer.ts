/// <reference path='../../lib/illa/StringUtil.ts'/>

/// <reference path='Element.ts'/>

module pml {
	export class HTMLStringer {
		
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
		private inlineTags = [
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
		private inlineDependingOnContentTags = [
			'a'
		];
		private nonReplaceableCharacterTags = [
			'script',
			'style'
		];
		
		private prettyPrint: boolean = true;
		private indentChar: string = '\t';
		private eolChar: string = '\n';
		private tabChar: string = '    ';
		
		constructor() {
			
		}
		
		stringify(src: Element, level = -1): string {
			var result = '';
			
			if (src.parent && src.name == '') {
				// If text node
				
				var isNonReplaceableCharacterTag = this.checkIsNonReplaceableCharacterTag(src.parent);
				result += this.prepareText(src.value, !isNonReplaceableCharacterTag, !isNonReplaceableCharacterTag);
				
			} else if (src.name.charAt(0) != '@') {
				// If not attribute
				
				var startsWithExclamationMark = src.name.charAt(0) == '!';
				var isComment = src.name == '!--';
				var startsWithQuestionMark = src.name.charAt(0) == '?';
				var hasEnd = !startsWithExclamationMark && !startsWithQuestionMark && illa.ArrayUtil.indexOf(this.noEndTags, src.name) == -1
				var isBlock = this.checkIsBlock(src);
				var indent = '';
				
				if (src.parent) {
					// If not root
					if (isBlock || this.checkIsBlock(src.previousSibling)) {
						// Add EOL + indent if block or previous was block
						result += this.eolChar;
						for (var i = 0; i < level; i++) {
							indent += this.indentChar;
						}
						result += indent;
					}
					
					// Render start tag
					
					result += '<';
					result += illa.StringUtil.escapeHTML(src.name);
					
					if (src.children) {
						// Render attributes
						
						for (var i = 0, n = src.children.length; i < n; i++) {
							var child = src.children[i];
							if (child.name.charAt(0) == '@') {
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
						var isNonReplaceableCharacterTag = this.checkIsNonReplaceableCharacterTag(src);
						result += this.prepareText(src.value, !isNonReplaceableCharacterTag, !isNonReplaceableCharacterTag);
					}
				}
				
				if (src.parent && hasEnd) {
					if (this.checkHasBlockContent(src)) {
						result += this.eolChar;
						result += indent;
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
		
		protected prepareText(src: string = '', escapeHTML: boolean = true, expandTabs: boolean = true): string {
			var result = src;
			if (escapeHTML) {
				result = illa.StringUtil.escapeHTML(result);
			}
			//result = result.replace(/(?:\r\n|\n|\r)/g, '<br/>');
			if (expandTabs) {
				result = result.replace(/\t/g, this.tabChar);
			}
			return result;
		}
		
		protected checkIsNonReplaceableCharacterTag(src: Element): boolean {
			if (!src) return false;
			return illa.ArrayUtil.indexOf(this.nonReplaceableCharacterTags, src.name) > -1;
		}
		
		protected checkIsInlineDependingOnContent(src: Element): boolean {
			if (!src) return false;
			return illa.ArrayUtil.indexOf(this.inlineDependingOnContentTags, src.name) > -1;
		}
		
		protected checkIsBlock(src: Element): boolean {
			if (!src) return false;
			switch (src.name.charAt(0)) {
				case '':
				case '@':
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
		
		protected checkHasBlockContent(src: Element): boolean {
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
	}
}