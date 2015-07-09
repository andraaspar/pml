/// <reference path='../../lib/illa/ArrayUtil.ts'/>

/// <reference path='Element.ts'/>

module pml {
	export class Stringer {

		private commentStart: string;
		private tagStart: string;
		private valueDelimiter: string;
		private tagEnd: string;
		private commentEnd: string;

		constructor(
			private preferredCommentStart: string = '',
			private preferredTagStart: string = '',
			private preferredValueDelimiter: string = '',
			private preferredTagEnd: string = '',
			private preferredCommentEnd: string = ''
			) {

		}

		stringify(src: Element): string {
			this.checkSeparators(src);
			
			var result = '';
			if (src.parent) {
				result += this.tagStart + src.name + this.valueDelimiter;
			} else {
				result += this.commentStart + this.tagStart + this.valueDelimiter + this.tagEnd + this.commentEnd;
			}
			if (src.children) {
				for (var i = 0, n = src.children.length; i < n; i++) {
					result += this.stringify(src.children[i]);
				}
			} else {
				result += src.value;
			}
			if (src.parent) result += this.tagEnd;
			return result;
		}

		private checkSeparators(src: Element): void {
			this.commentStart = this.preferredCommentStart.charAt(0) || '{';
			this.tagStart = this.preferredTagStart.charAt(0) || '[';
			this.valueDelimiter = this.preferredValueDelimiter.charAt(0) || '|';
			this.tagEnd = this.preferredTagEnd.charAt(0) || ']';
			this.commentEnd = this.preferredCommentEnd.charAt(0) || '}';

			while (!this.getIsCharacterSafe(src, this.commentStart)) {
				this.commentStart = this.getNewCharacter(this.commentStart);
			}
			while (!this.getIsCharacterSafe(src, this.tagStart)) {
				this.tagStart = this.getNewCharacter(this.tagStart);
			}
			while (!this.getIsCharacterSafe(src, this.valueDelimiter)) {
				this.valueDelimiter = this.getNewCharacter(this.valueDelimiter);
			}
			while (!this.getIsCharacterSafe(src, this.tagEnd)) {
				this.tagEnd = this.getNewCharacter(this.tagEnd);
			}
			while (!this.getIsCharacterSafe(src, this.commentEnd)) {
				this.commentEnd = this.getNewCharacter(this.commentEnd);
			}
		}

		private getIsCharacterSafe(src: Element, c: string): boolean {
			if (src.name.indexOf(c) == -1) {
				if (src.children) {
					for (var i = 0, n = src.children.length; i < n; i++) {
						if (!this.getIsCharacterSafe(src.children[i], c)) {
							return false;
						}
					}
					return true;
				} else {
					return src.value.indexOf(c) == -1;
				}
			}
			return false;
		}

		private getNewCharacter(prevChar: string): string {
			var charCodes = [
				this.commentStart.charCodeAt(0),
				this.tagStart.charCodeAt(0),
				this.valueDelimiter.charCodeAt(0),
				this.tagEnd.charCodeAt(0),
				this.commentEnd.charCodeAt(0)
			];
			var charCode = prevChar.charCodeAt(0);
			do {
				charCode++;
			} while (illa.ArrayUtil.indexOf(charCodes, charCode) != -1);
			return String.fromCharCode(charCode);
		}
	}
}