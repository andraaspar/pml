/// <reference path='../../lib/illa/Log.ts'/>

module pml {
	export enum LinterMessageKind {
		WARNING, ERROR
	}

	export class LinterMessage {
		
		public charEnd: number;
		
		constructor(
			public kind: LinterMessageKind,
			public line: number,
			public char: number,
			public message: string
			) {
			this.charEnd = this.char;
		}
	}

	export class Linter {

		private commentStart: string;
		private tagStart: string;
		private valueDelimiter: string;
		private tagEnd: string;
		private commentEnd: string;

		private messages: LinterMessage[];
		private warnings: LinterMessage[];
		private errors: LinterMessage[];

		private whiteSpaceRE = /\s/;
		private level: number;
		private commentLevel: number;
		private isKey: boolean;
		private hasValue: boolean[];
		private hasChildren: boolean[];
		private lineId: number;
		private charId: number;
		
		private throwOnError: boolean = false;
		private logMessages: boolean = false;

		constructor() {

		}

		lint(src: string): void {
			this.messages = [];
			this.warnings = [];
			this.errors = [];
			
			this.lineId = 0;
			this.charId = 0;

			this.readDelimiters(src);
			this.checkDelimiters();

			if (!this.errors.length) {
				
				// Continue only if delimiters are alright
				
				this.checkStructure(src);
			}
		}

		protected addError(message: string): void {
			if (!this.checkIsLastMessageTheSame(LinterMessageKind.ERROR, message)) {
				var error = new LinterMessage(LinterMessageKind.ERROR, this.lineId + 1, this.charId + 1, message);
				this.errors.push(error);
				this.messages.push(error);
				
				if (this.throwOnError) {
					throw 'pml.Linter ERROR: ' + error.line + ':' + error.char + ': ' + message;
				}
				
				if (this.logMessages) {
					illa.Log.error('pml.Linter: ' + error.line + ':' + error.char + ': ' + error.message);
				}
			}
		}

		protected addWarning(message: string): void {
			if (!this.checkIsLastMessageTheSame(LinterMessageKind.WARNING, message)) {
				var warning = new LinterMessage(LinterMessageKind.WARNING, this.lineId + 1, this.charId + 1, message);
				this.warnings.push(warning);
				this.messages.push(warning);
				
				if (this.logMessages) {
					illa.Log.warn('pml.Linter: ' + warning.line + ':' + warning.char + ': ' + warning.message);
				}
			}
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
				this.charId = i;
				if (!delimiters[i]) {
					this.addError(names[i] + ' delimiter is missing.');
				}
				if (/[\s \r\n]/.test(delimiters[i])) {
					this.addError(names[i] + ' delimiter is a whitespace or line break character. Linter does not support this.');
				}
				var i2 = illa.ArrayUtil.indexOf(delimiters, delimiters[i], i + 1);
				if (i2 > -1) {
					this.addError(names[i] + ' delimiter clashes with ' + names[i2] + ' delimiter.');
				}
			}
		}

		protected checkIsLastMessageTheSame(kind: LinterMessageKind, message: string): boolean {
			var lastMessage = this.messages[this.messages.length - 1];
			var isTheSame = lastMessage &&
				lastMessage.kind === kind &&
				lastMessage.line === this.lineId + 1 &&
				lastMessage.charEnd === this.charId && // One character before the current
				lastMessage.message === message;
			if (isTheSame) {
				lastMessage.charEnd++;
			}
			return isTheSame;
		}

		protected checkStructure(src: string): void {
			var lines = src.split(/\r\n|\n|\r/g);
			this.level = 0;
			this.commentLevel = 0;
			this.isKey = false;
			this.hasValue = [];
			this.hasChildren = [];
			this.lineId = 0;

			for (var n = lines.length; this.lineId < n; this.lineId++) {

				var line = lines[this.lineId];
				this.charId = 0;

				for (var o = line.length; this.charId < o; this.charId++) {

					var char = line.charAt(this.charId);

					if (char == this.commentStart) {
						
						// Comments are valid everywhere
						
						this.commentLevel++;

					} else {
						
						// Not a comment start
						
						if (this.commentLevel > 0) {
							
							// Context: in a comment
							
							if (char == this.commentEnd) {
								this.commentLevel--;
							}

						} else if (char == this.commentEnd) {
							
							// Context: not in a comment and char is a comment end delimiter
							
							this.addError('Unexpected comment end delimiter.');

						} else {
							
							// Context: in a tag or root
							
							if (this.isKey) {
								
								// Context: in tag key
								
								if (char == this.valueDelimiter) {

									this.isKey = false;

								} else if (char == this.tagStart) {

									this.addError('Invalid location for tag start delimiter.');
									
									this.isKey = false;
									this.charId--;
									continue;

								} else if (char == this.tagEnd) {

									this.addError('Invalid location for tag end delimiter.');
									
									this.isKey = false;
									this.charId--;
									continue;

								}

							} else {
								
								// Context: in tag value
								
								if (char == this.valueDelimiter) {

									this.addError('Invalid location for value delimiter.');

								} else if (char == this.tagStart) {

									this.hasChildren[this.level] = true;
									
									if (this.hasValue[this.level]) {
										this.addWarning('Tag has both children and value.');
									}
									
									this.level++;
									this.isKey = true;

								} else if (char == this.tagEnd) {

									this.hasValue[this.level] = false;
									this.hasChildren[this.level] = false;
									this.level--;
									
									if (this.level < 0) {
										this.addError('Invalid location for tag end delimiter.');
										this.level = 0;
									}
									
									this.isKey = false;

								} else if (!this.whiteSpaceRE.test(char)) {

									this.hasValue[this.level] = true;
									
									if (this.hasChildren[this.level]) {
										this.addWarning('Tag has both children and value.');
									}

								}

							}

						}
					}
				}
			}
			
			if (this.commentLevel > 0) {
				this.addWarning('Comment not closed.');
			}
			if (this.level > 0) {
				this.addError('Tag not closed.');
			}
		}
		
		getMessages(): LinterMessage[] {
			return this.messages;
		}
		
		getWarnings(): LinterMessage[] {
			return this.warnings;
		}
		
		getErrors(): LinterMessage[] {
			return this.errors;
		}
		
		getThrowOnError(): boolean {
			return this.throwOnError;
		}
		
		setThrowOnError(v: boolean): void {
			this.throwOnError = v;
		}
		
		getLogMessages(): boolean {
			return this.logMessages;
		}
		
		setLogMessages(v: boolean): void {
			this.logMessages = v;
		}
	}
}