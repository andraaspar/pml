/// <reference path='ReaderBase.ts'/>

module pml {
	export class Tidier extends ReaderBase {

		private indentChar: string = '\t';
		private eolChar: string = '\n';
		private convertIgnoredValueToPair: boolean = false;
		
		private charId: number;
		private valueBuffer = '';
		private hasChildren: boolean[] = [];
		private commentLevel = 0;
		private level = 0;
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
			this.level = 0;
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
			if (this.level > 0) {
				this.addTidyMessage(MessageKind.WARNING, result, 'Added ' + this.level + ' missing value end delimiter(s).');
				for (var i = 0; i < this.level; i++) {
					src += this.getValueEnd();
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
			var keyStart = this.getKeyStart();
			var valueStart = this.getValueStart();
			var valueEnd = this.getValueEnd();
			
			if (this.level == 0 && this.charId == 0) {
				this.hasChildren[this.level] = this.checkAheadForChildren(src);
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
							if (this.hasChildren[this.level]) {
								result += '\n' + this.getIndent(this.level);
							}
						}
					}
					if (this.hasChildren[this.level]) {
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
						if (this.hasChildren[this.level]) {
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
					if (char == keyStart) {

						if (this.inIgnoredValue) {
							result = this.endIgnoredValueConversion(result);
						}
						this.hasChildren[this.level] = true;
						if (this.inKey) {
							result = result.replace(/[\s\n]+$/g, '');
							this.addTidyMessage(MessageKind.WARNING, result, 'Added missing value start delimiter.');
							result += valueStart;
						}
						this.inKey = true;
						result += '\n' + this.getIndent(this.level);
						result += char;
						this.level++;

						this.hasChildren[this.level] = this.checkAheadForChildren(src);

					} else if (char == valueStart) {

						this.inKey = false;
						result += char;

					} else if (char == valueEnd) {

						if (this.inKey) {
							this.addTidyMessage(MessageKind.WARNING, result, 'Added missing value start delimiter.');
							result += valueStart;
						} else if (this.inIgnoredValue) {
							result = this.endIgnoredValueConversion(result);
						}
						if (this.hasChildren[this.level]) {
							result += '\n' + this.getIndent(this.level - 1);
						} else {
							result += this.valueBuffer;
							this.valueBuffer = '';
						}
						if (this.level) {
							// Ignore invalid closing delimiter
							result += char;

							this.hasChildren[this.level] = false;
							this.level--;
							this.inKey = false;
						} else {
							this.addTidyMessage(MessageKind.WARNING, result, 'Invalid value end delimiter removed.');
						}

					} else {


						if (this.inKey) {

							result += char;

						} else if (this.inIgnoredValue) {

							result += char;

						} else {

							if (this.hasChildren[this.level]) {

								if (/\s/.test(char)) {
									// Ignore white space
								} else {
									this.inIgnoredValue = true;
									this.inKey = false;
									result += '\n' + this.getIndent(this.level);
									this.addTidyMessage(MessageKind.WARNING, result,
										'Ignored value found and converted to a ' + (this.convertIgnoredValueToPair ? 'pair' : 'comment') + '.');
									if (this.convertIgnoredValueToPair) {
										result += keyStart + valueStart;
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
			if (this.convertIgnoredValueToPair) {
				result += this.getValueEnd();
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
			var keyStart = this.getKeyStart();
			var valueEnd = this.getValueEnd();

			for (var i = this.charId + 1, n = src.length; i < n; i++) {
				var char = src.charAt(i);

				if (char == commentStart) {

					commentLevel++;

				} else if (char == commentEnd) {

					commentLevel--;

				} else if (commentLevel <= 0) {

					if (char == keyStart) {

						result = true;
						break;

					} else if (char == valueEnd) {

						result = false;
						break;

					}
				}
			}
			return result;
		}

		getConvertIgnoredValueToPair(): boolean {
			return this.convertIgnoredValueToPair;
		}

		setConvertIgnoredValueToPair(v: boolean): void {
			this.convertIgnoredValueToPair = v;
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