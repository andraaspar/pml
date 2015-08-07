/// <reference path='../../lib/illa/ArrayUtil.ts'/>

/// <reference path='Pair.ts'/>

module pml {
	export class Stringer {
		
		private static instance: Stringer;
		
		private commentStart: string;
		private keyStart: string;
		private valueStart: string;
		private valueEnd: string;
		private commentEnd: string;
		
		private prettyPrint: boolean = true;
		private indentChar: string = '\t';
		private eolChar: string = '\n';

		constructor(
			private preferredSeparatorPairs: string[] = ['{}', '[]', '()', '<>', '«»', '◄►', '├┤', '╠╣'],
			private preferredSingleSeparators: string[] = ['~', '|', '\\', '•', '→', '⁞', '▪', '╪']
			) {

		}
		
		static getInstance(): Stringer {
			if (!this.instance) {
				this.instance = new Stringer();
			}
			return this.instance;
		}
		
		static stringify(src: Pair): string {
			return this.getInstance().stringifyInternal(src);
		}
		
		stringify(src: Pair): string {
			return this.stringifyInternal(src);
		}

		protected stringifyInternal(src: Pair, level = -1): string {
			this.checkSeparators(src);
			
			var result = '';
			var indent = '';
			if (src.parent) {
				// Only indent pair if it is not the root
				if (this.prettyPrint) {
					result += this.eolChar;
					for (var i = 0; i < level; i++) {
						indent += this.indentChar;
					}
					result += indent;
				}
				
				// Only render pair if it is not the root
				result += this.keyStart + src.key + this.valueStart;
			} else {
				// For the root pair, render the header characters
				result += this.commentStart + this.keyStart + this.valueStart + this.valueEnd + this.commentEnd;
			}
			if (src.children) {
				for (var i = 0, n = src.children.length; i < n; i++) {
					result += this.stringifyInternal(src.children[i], level + 1);
				}
				
				if (this.prettyPrint) {
					// Indent value end if this is not the root
					if (src.parent) result += indent;
				}
			} else {
				result += src.value;
			}
			if (src.parent) {
				if (src.children) {
					// If has children, put EOL before value end
					result += this.eolChar;
					result += indent;
				}
				// If not root, add value end
				result += this.valueEnd;
			}
			return result;
		}

		private checkSeparators(src: Pair): void {
			var unsafeIndex = this.checkAreSeparatorsSafe(src);
			while (unsafeIndex > -1) {
				switch (unsafeIndex) {
					case 0:
					case 4:
						var newPair = this.getNewSeparatorPair(src);
						this.commentStart = newPair[0];
						this.commentEnd = newPair[1];
						break;
					case 1:
					case 3:
						var newPair = this.getNewSeparatorPair(src);
						this.keyStart = newPair[0];
						this.valueEnd = newPair[1];
						break;
					case 2:
						this.valueStart = this.getNewSingleSeparator(src);
						break;
					default:
						throw 'Invalid index.';
				}
				unsafeIndex = this.checkAreSeparatorsSafe(src);
			}
		}
		
		private getSeparators(): string[] {
			return [this.commentStart, this.keyStart, this.valueStart, this.valueEnd, this.commentEnd];
		}
		
		private checkAreSeparatorsSafe(src: Pair): number {
			var separators = this.getSeparators();
			for (var i = 0, n = separators.length; i < n; i++) {
				var separator = separators[i];
				if (!this.checkSeparatorIsValid(separators, separator) || !this.checkIsCharacterSafeForContent(src, separator)) {
					return i;
				}
			}
			return -1;
		}
		
		private checkSeparatorIsValid(separators: string[], separator: string): boolean {
			if (!separator || separator.length != 1 || /[\s \r\n]/.test(separator)) {
				return false;
			}
			var index = illa.ArrayUtil.indexOf(separators, separator);
			if (index > -1) {
				var index2 = illa.ArrayUtil.indexOf(separators, separator, index + 1);
				if (index2 > -1) {
					return false;
				}
			}
			return true;
		}
		
		private getNewSeparatorPair(src: Pair): [string, string] {
			var separators = this.getSeparators();
			var result: [string, string];
			var isValid = false;
			for (var i = 0, n = this.preferredSeparatorPairs.length; i < n; i++) {
				var preferredSeparatorPair = this.preferredSeparatorPairs[i];
				result = [preferredSeparatorPair.charAt(0), preferredSeparatorPair.charAt(1)];
				var separatorsPlusResult = separators.concat(result);
				isValid = this.checkSeparatorIsValid(separatorsPlusResult, result[0]) &&
					this.checkSeparatorIsValid(separatorsPlusResult, result[1]) &&
					this.checkIsCharacterSafeForContent(src, result[0]) &&
					this.checkIsCharacterSafeForContent(src, result[1]);
				if (isValid) break;
			}
			while (!isValid) {
				separators = separators.concat(result);
				var resultA = this.getNewSeparator(separators);
				result = [resultA, String.fromCharCode(resultA.charCodeAt(0) + 1)];
				isValid = this.checkSeparatorIsValid(separators, result[0]) &&
					this.checkSeparatorIsValid(separators, result[1]) &&
					this.checkIsCharacterSafeForContent(src, result[0]) &&
					this.checkIsCharacterSafeForContent(src, result[1]);
			}
			return result;
		}
		
		private getNewSingleSeparator(src: Pair): string {
			var separators = this.getSeparators();
			var result: string;
			var isValid = false;
			for (var i = 0, n = this.preferredSingleSeparators.length; i < n; i++) {
				result = this.preferredSingleSeparators[i].charAt(0);
				var separatorsPlusResult = separators.concat(result);
				isValid = this.checkSeparatorIsValid(separatorsPlusResult, result) &&
					this.checkIsCharacterSafeForContent(src, result);
				if (isValid) break;
			}
			while (!isValid) {
				separators = separators.concat(result);
				result = this.getNewSeparator(separators);
				isValid = this.checkSeparatorIsValid(separators, result) &&
					this.checkIsCharacterSafeForContent(src, result);
			}
			return result;
		}
		
		private findFallbackSeparators(src: Pair): void {
			while (!this.checkIsCharacterSafeForContent(src, this.commentStart)) {
				this.commentStart = this.getNewCharacter(this.commentStart);
			}
			while (!this.checkIsCharacterSafeForContent(src, this.keyStart)) {
				this.keyStart = this.getNewCharacter(this.keyStart);
			}
			while (!this.checkIsCharacterSafeForContent(src, this.valueStart)) {
				this.valueStart = this.getNewCharacter(this.valueStart);
			}
			while (!this.checkIsCharacterSafeForContent(src, this.valueEnd)) {
				this.valueEnd = this.getNewCharacter(this.valueEnd);
			}
			while (!this.checkIsCharacterSafeForContent(src, this.commentEnd)) {
				this.commentEnd = this.getNewCharacter(this.commentEnd);
			}
		}

		private checkIsCharacterSafeForContent(src: Pair, c: string): boolean {
			if (src.key.indexOf(c) == -1) {
				if (src.children) {
					for (var i = 0, n = src.children.length; i < n; i++) {
						if (!this.checkIsCharacterSafeForContent(src.children[i], c)) {
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
				this.keyStart.charCodeAt(0),
				this.valueStart.charCodeAt(0),
				this.valueEnd.charCodeAt(0),
				this.commentEnd.charCodeAt(0)
			];
			var charCode = prevChar.charCodeAt(0);
			do {
				charCode++;
			} while (illa.ArrayUtil.indexOf(charCodes, charCode) != -1);
			return String.fromCharCode(charCode);
		}
		
		private getNewSeparator(separators: string[]): string {
			var highestCharCode = '┌'.charCodeAt(0);
			for (var i = 0, n = separators.length; i < n; i++) {
				var separator = separators[i];
				highestCharCode = Math.max(highestCharCode, (separator ? separator.charCodeAt(0) : 0));
			}
			return String.fromCharCode(highestCharCode + 1);
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
		
		getPreferredSeparatorPairs(): string[] {
			return this.preferredSeparatorPairs;
		}
		
		setPreferredSeparatorPairs(v: string[]): void {
			this.preferredSeparatorPairs = v;
		}
		
		getPreferredSingleSeparators(): string[] {
			return this.preferredSingleSeparators;
		}
		
		setPreferredSingleSeparators(v: string[]): void {
			this.preferredSingleSeparators = v;
		}
	}
}