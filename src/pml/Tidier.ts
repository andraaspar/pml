/// <reference path='ReaderBase.ts'/>

module pml {
	export class Tidier extends ReaderBase {

		private indentChar: string = '\t';
		private eolChar: string = '\n';
		private convertIgnoredValueToTag: boolean = false;
		
		private charId: number;
		private valueBuffer = '';
		private hasChildren: boolean[] = [];
		private commentLevel = 0;
		private tagLevel = 0;
		private inKey = false;
		private inIgnoredValue = false;

		constructor() {
			super();
		}

		tidy(src: string): string {
			this.readDelimiters(src);
			this.checkDelimiters();
			
			// Normalize line ends
			src = src.replace(/\r\n|\r|\n/g, '\n');
			
			this.charId = 0;
			this.valueBuffer = '';
			this.hasChildren = [];
			this.commentLevel = 0;
			this.tagLevel = 0;
			this.inKey = false;
			this.inIgnoredValue = false;

			var result = this.tidyLoop(src);
			
			if (this.commentLevel > 0) {
				this.addTidyMessage(MessageKind.WARNING, result, 'Added ' + this.commentLevel + ' missing comment end delimiter(s).');
				for (var i = 0; i < this.commentLevel; i++) {
					src += this.getCommentEnd();
				}
				result = this.tidyLoop(src, result);
			}
			if (this.tagLevel > 0) {
				this.addTidyMessage(MessageKind.WARNING, result, 'Added ' + this.tagLevel + ' missing tag end delimiter(s).');
				for (var i = 0; i < this.tagLevel; i++) {
					src += this.getTagEnd();
				}
				result = this.tidyLoop(src, result);
			}
			
			// Set EOL
			result = result.replace('\n', this.eolChar);

			return result;
		}

		protected tidyLoop(src: string, result: string = ''): string {
			
			var commentStart = this.getCommentStart();
			var commentEnd = this.getCommentEnd();
			var tagStart = this.getTagStart();
			var tagEnd = this.getTagEnd();
			var valueDelimiter = this.getValueDelimiter();
			
			if (this.tagLevel == 0 && this.charId == 0) {
				this.hasChildren[this.tagLevel] = this.checkAheadForChildren(src);
			}

			for (var n = src.length; this.charId < n; this.charId++) {
				var char = src.charAt(this.charId);

				if (char == commentStart) {

					if (this.inIgnoredValue) {
						result = this.endIgnoredValueConversion(result);
					}

					this.commentLevel++;
					if (this.commentLevel == 1) {
						if (!this.inKey) {
							if (this.hasChildren[this.tagLevel]) {
								result += '\n' + this.getIndent(this.tagLevel);
							}
						}
					}
					if (this.hasChildren[this.tagLevel]) {
						result += char;
					} else {
						this.valueBuffer = this.valueBuffer.replace(/^[\s\n]+/g, '');
						if (this.valueBuffer) {
							this.valueBuffer += char;
						} else {
							result += char;
						}
					}

				} else if (char == commentEnd) {

					if (this.commentLevel > 0) {
						// Ignore invalid comment end delimiters
						
						this.commentLevel--;
						if (this.hasChildren[this.tagLevel]) {
							result += char;
						} else {
							if (this.valueBuffer) {
								this.valueBuffer += char;
							} else {
								result += char;
							}
						}
					} else {
						this.addTidyMessage(MessageKind.WARNING, result, 'Invalid comment end delimiter removed.');
					}

				} else if (this.commentLevel > 0) {

					if (this.inKey) {
						result += char;
					} else {
						if (this.valueBuffer) {
							this.valueBuffer += char;
						} else {
							result += char;
						}
					}

				} else {
					if (char == tagStart) {

						if (this.inIgnoredValue) {
							result = this.endIgnoredValueConversion(result);
						}
						this.hasChildren[this.tagLevel] = true;
						if (this.inKey) {
							result = result.replace(/[\s\n]+$/g, '');
							this.addTidyMessage(MessageKind.WARNING, result, 'Added missing value delimiter.');
							result += valueDelimiter;
						}
						this.inKey = true;
						result += '\n' + this.getIndent(this.tagLevel);
						result += char;
						this.tagLevel++;

						this.hasChildren[this.tagLevel] = this.checkAheadForChildren(src);

					} else if (char == valueDelimiter) {

						this.inKey = false;
						result += char;

					} else if (char == tagEnd) {

						if (this.inKey) {
							this.addTidyMessage(MessageKind.WARNING, result, 'Added missing value delimiter.');
							result += valueDelimiter;
						} else if (this.inIgnoredValue) {
							result = this.endIgnoredValueConversion(result);
						}
						if (this.hasChildren[this.tagLevel]) {
							result += '\n' + this.getIndent(this.tagLevel - 1);
						} else {
							result += this.valueBuffer;
							this.valueBuffer = '';
						}
						if (this.tagLevel) {
							// Ignore invalid closing tag
							result += char;

							this.hasChildren[this.tagLevel] = false;
							this.tagLevel--;
							this.inKey = false;
						} else {
							this.addTidyMessage(MessageKind.WARNING, result, 'Invalid tag end delimiter removed.');
						}

					} else {


						if (this.inKey) {

							result += char;

						} else if (this.inIgnoredValue) {

							result += char;

						} else {

							if (this.hasChildren[this.tagLevel]) {

								if (/\s/.test(char)) {
									// Ignore white space
								} else {
									this.inIgnoredValue = true;
									this.inKey = false;
									result += '\n' + this.getIndent(this.tagLevel);
									this.addTidyMessage(MessageKind.WARNING, result,
										'Ignored value found and converted to a ' + (this.convertIgnoredValueToTag ? 'tag' : 'comment') + '.');
									if (this.convertIgnoredValueToTag) {
										result += tagStart + valueDelimiter;
									} else {
										result += commentStart;
									}
									result += char;
								}

							} else {

								this.valueBuffer += char;

							}

						}

					}
				}

			}
			
			return result;
		}
		
		protected addTidyMessage(kind: MessageKind, result: string, message: string): void {
			var lineNo = 1;
			var charNo = 1;
			var lineBreaks = result.match(/\n/g);
			if (lineBreaks) {
				lineNo = lineBreaks.length + 1;
			}
			var lastLineChars = (/\n(.*?)$/g).exec(result);
			if (lastLineChars) {
				charNo = lastLineChars[0].length;
			}
			this.addMessage(new Message(kind, lineNo, charNo, message));
		}
		
		protected endIgnoredValueConversion(result: string): string {
			result = result.replace(/[\s\n]+$/g, '');
			if (this.convertIgnoredValueToTag) {
				result += this.getTagEnd();
			} else {
				result += this.getCommentEnd();
			}
			this.inIgnoredValue = false;
			return result;
		}

		protected getIndent(level: number): string {
			var result = '';
			for (var i = 0; i < level; i++) {
				result += this.indentChar;
			}
			return result;
		}

		protected checkAheadForChildren(src: string): boolean {
			var result = false;

			var commentLevel = 0;
			
			var commentStart = this.getCommentStart();
			var commentEnd = this.getCommentEnd();
			var tagStart = this.getTagStart();
			var tagEnd = this.getTagEnd();

			for (var i = this.charId + 1, n = src.length; i < n; i++) {
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