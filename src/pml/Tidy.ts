/// <reference path='ReaderBase.ts'/>

module pml {
	export class Tidy extends ReaderBase {

		private indentChar: string = '\t';
		private eolChar: string = '\n';
		private convertIgnoredValueToTag: boolean = false;

		constructor() {
			super();
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

		protected tidyLoop(src: string): string {
			var result = '';

			var valueBuffer = '';
			var tagBuffer: string[] = [];
			var hasChildren: boolean[] = [];
			var commentLevel = 0;
			var tagLevel = 0;
			var inKey = false;
			var inIgnoredValue = false;
			
			var commentStart = this.getCommentStart();
			var commentEnd = this.getCommentEnd();
			var tagStart = this.getTagStart();
			var tagEnd = this.getTagEnd();
			var valueDelimiter = this.getValueDelimiter();

			for (var i = 0, n = src.length; i < n; i++) {
				var char = src.charAt(i);

				if (char == commentStart) {

					if (inIgnoredValue) {
						result = this.endIgnoredValueConversion(result);
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

				} else if (char == commentEnd) {

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
					if (char == tagStart) {

						if (inIgnoredValue) {
							result = this.endIgnoredValueConversion(result);
							inIgnoredValue = false;
						}
						hasChildren[tagLevel] = true;
						if (inKey) {
							result += valueDelimiter;
						} else {
							if (valueBuffer) {
								valueBuffer = valueBuffer.replace(/^[\s\n]+|[\s\n]+$/g, '');
								if (valueBuffer) {
									result += '\n' + this.getIndent(tagLevel);
									if (this.convertIgnoredValueToTag) {
										result += tagStart + valueDelimiter + valueBuffer + tagEnd;
									} else {
										result += commentStart + valueBuffer + commentEnd;
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

					} else if (char == valueDelimiter) {

						inKey = false;
						result += char;

					} else if (char == tagEnd) {

						if (inKey) {
							result += valueDelimiter;
						} else if (inIgnoredValue) {
							result = this.endIgnoredValueConversion(result);
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
										result += tagStart + valueDelimiter;
									} else {
										result += commentStart;
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
		
		protected endIgnoredValueConversion(result: string): string {
			result = result.replace(/[\s\n]+$/g, '');
			if (this.convertIgnoredValueToTag) {
				result += this.getTagEnd();
			} else {
				result += this.getCommentEnd();
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
			
			var commentStart = this.getCommentStart();
			var commentEnd = this.getCommentEnd();
			var tagStart = this.getTagStart();
			var tagEnd = this.getTagEnd();

			for (var n = src.length; i < n; i++) {
				var char = src.charAt(i);

				if (char == commentStart) {

					commentLevel++;

				} else if (char == commentEnd) {

					commentLevel--;

				} else if (commentLevel <= 0) {

					if (char == tagStart) {

						result = true;
						break;

					} else if (char == tagEnd) {

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
	}
}