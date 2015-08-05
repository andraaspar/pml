

module pml {
	export class Tidy {

		private commentStart: string;
		private tagStart: string;
		private valueDelimiter: string;
		private tagEnd: string;
		private commentEnd: string;

		private indentChar: string = '\t';
		private eolChar: string = '\n';
		private convertIgnoredValueToTag: boolean = false;

		constructor() {

		}

		tidy(src: string): string {
			this.readDelimiters(src);
			this.checkDelimiters();
			
			// Normalize line ends
			src = src.replace(/\r\n|\r|\n/g, '\n');

			src = this.tidyLoop(src);
			
			// Set EOL
			src = src.replace('\n', this.eolChar);

			return src;
		}

		protected readDelimiters(src: string): void {
			this.commentStart = src.slice(0, 1);
			this.tagStart = src.slice(1, 2);
			this.valueDelimiter = src.slice(2, 3);
			this.tagEnd = src.slice(3, 4);
			this.commentEnd = src.slice(4, 5);
		}

		protected checkDelimiters(): void {
			var delimiters = [this.commentStart, this.tagStart, this.valueDelimiter, this.tagEnd, this.commentEnd];
			var names = ['Comment start', 'Tag start', 'Value', 'Tag end', 'Comment end'];
			for (var i = 0, n = delimiters.length; i < n; i++) {
				if (!delimiters[i]) {
					throw names[i] + ' delimiter is missing.';
				}
				if (/[\s\r\n]/.test(delimiters[i])) {
					throw names[i] + ' delimiter is a whitespace or line break character. Tidy does not support this.';
				}
				var i2 = illa.ArrayUtil.indexOf(delimiters, delimiters[i], i + 1);
				if (i2 > -1) {
					throw names[i] + ' delimiter clashes with ' + names[i2] + ' delimiter.';
				}
			}
		}

		protected tidyLoop(src: string): string {
			var result = '';

			var valueBuffer = '';
			var tagBuffer: string[] = [];
			var hasChildren: boolean[] = [];
			var commentLevel = 0;
			var tagLevel = 0;
			var inKey = false;
			var inIgnoredValue = false;

			for (var i = 0, n = src.length; i < n; i++) {
				var char = src.charAt(i);

				if (char == this.commentStart) {

					if (inIgnoredValue) {
						result = result.replace(/[\s\n]+$/g, '');
						if (this.convertIgnoredValueToTag) {
							result += this.tagEnd;
						} else {
							result += this.commentEnd;
						}
						inIgnoredValue = false;
					}

					commentLevel++;
					if (commentLevel == 1) {
						if (!inKey) {
							if (hasChildren[tagLevel]) {
								result += '\n' + this.getIndent(tagLevel);
							}
						}
					}
					if (hasChildren[tagLevel]) {
						result += char;
					} else {
						valueBuffer = valueBuffer.replace(/^[\s\n]+/g, '');
						if (valueBuffer) {
							valueBuffer += char;
						} else {
							result += char;
						}
					}

				} else if (char == this.commentEnd) {

					if (commentLevel > 0) {
						// Ignore invalid comment end delimiters
						
						commentLevel--;
						if (hasChildren[tagLevel]) {
							result += char;
						} else {
							if (valueBuffer) {
								valueBuffer += char;
							} else {
								result += char;
							}
						}
					}

				} else if (commentLevel > 0) {

					if (inKey) {
						result += char;
					} else {
						if (valueBuffer) {
							valueBuffer += char;
						} else {
							result += char;
						}
					}

				} else {
					if (char == this.tagStart) {

						if (inIgnoredValue) {
							result = result.replace(/[\s\n]+$/g, '');
							if (this.convertIgnoredValueToTag) {
								result += this.tagEnd;
							} else {
								result += this.commentEnd;
							}
							inIgnoredValue = false;
						}
						hasChildren[tagLevel] = true;
						if (inKey) {
							result += this.valueDelimiter;
						} else {
							if (valueBuffer) {
								valueBuffer = valueBuffer.replace(/^[\s\n]+|[\s\n]+$/g, '');
								if (valueBuffer) {
									result += '\n' + this.getIndent(tagLevel);
									if (this.convertIgnoredValueToTag) {
										result += this.tagStart + this.valueDelimiter + valueBuffer + this.tagEnd;
									} else {
										result += this.commentStart + valueBuffer + this.commentEnd;
									}
									valueBuffer = '';
								}
							}
						}
						inKey = true;
						result += '\n' + this.getIndent(tagLevel);
						result += char;
						tagLevel++;

						hasChildren[tagLevel] = this.checkAheadForChildren(src, i + 1);

					} else if (char == this.valueDelimiter) {

						inKey = false;
						result += char;

					} else if (char == this.tagEnd) {

						if (inKey) {
							result += this.valueDelimiter;
						} else if (inIgnoredValue) {
							result = result.replace(/[\s\n]+$/g, '');
							if (this.convertIgnoredValueToTag) {
								result += this.tagEnd;
							} else {
								result += this.commentEnd;
							}
							inIgnoredValue = false;
						}
						if (hasChildren[tagLevel]) {
							result += '\n' + this.getIndent(tagLevel - 1);
						} else {
							result += valueBuffer;
							valueBuffer = '';
						}
						if (tagLevel) {
							// Ignore invalid closing tag
							result += char;

							hasChildren[tagLevel] = false;
							tagLevel--;
							inKey = false;
						}

					} else {


						if (inKey) {

							result += char;

						} else if (inIgnoredValue) {

							result += char;

						} else {

							if (hasChildren[tagLevel]) {

								if (/\s/.test(char)) {
									// Ignore white space
								} else {
									inIgnoredValue = true;
									inKey = false;
									result += '\n' + this.getIndent(tagLevel);
									if (this.convertIgnoredValueToTag) {
										result += this.tagStart + this.valueDelimiter;
									} else {
										result += this.commentStart;
									}
									result += char;
								}

							} else {

								valueBuffer += char;

							}

						}

					}
				}

			}

			return result;
		}

		protected getIndent(level: number): string {
			var result = '';
			for (var i = 0; i < level; i++) {
				result += this.indentChar;
			}
			return result;
		}

		protected checkAheadForChildren(src: string, i: number): boolean {
			var result = false;

			var commentLevel = 0;

			for (var n = src.length; i < n; i++) {
				var char = src.charAt(i);

				if (char == this.commentStart) {

					commentLevel++;

				} else if (char == this.commentEnd) {

					commentLevel--;

				} else if (commentLevel <= 0) {

					if (char == this.tagStart) {

						result = true;
						break;

					} else if (char == this.tagEnd) {

						result = false;
						break;

					}
				}
			}
			return result;
		}

		getConvertIgnoredValueToTag(): boolean {
			return this.convertIgnoredValueToTag;
		}

		setConvertIgnoredValueToTag(v: boolean): void {
			this.convertIgnoredValueToTag = v;
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
		
		getCommentStart(): string {
			return this.commentStart;
		}
		
		getTagStart(): string {
			return this.tagStart;
		}
		
		getValueDelimiter(): string {
			return this.valueDelimiter;
		}
		
		getTagEnd(): string {
			return this.tagEnd;
		}
		
		getCommentEnd(): string {
			return this.commentEnd;
		}
	}
}