/// <reference path='ReaderBase.ts'/>

module pml {
	export class Linter extends ReaderBase {
		
		private source: string;

		private whiteSpaceRE = /\s/;
		private level: number;
		private commentLevel: number;
		private isName: boolean;
		private hasValue: boolean[];
		private hasChildren: boolean[];
		private lineId: number;
		private charId: number;

		constructor() {
			super();
			this.setThrowOnError(false);
			this.setLogMessages(false);
		}

		lint(src: string): Message[] {
			this.source = src;
			
			this.clearMessages();
			
			this.lineId = 0;
			this.charId = 0;

			this.readDelimiters(this.source);
			this.checkDelimiters();

			if (!this.getMessageKindCount(MessageKind.ERROR)) {
				// Continue only if delimiters are alright
				
				this.checkStructure(src);
			}
			return this.getMessages();
		}
		
		protected addLinterMessage(kind: MessageKind, message: string): void {
			var messages = this.getMessages();
			var lastMessage = messages[messages.length - 1];
			var isTheSame = lastMessage &&
				lastMessage.kind === kind &&
				lastMessage.line === this.lineId + 1 &&
				lastMessage.charEnd === this.charId && // One character before the current
				lastMessage.message === message;
			if (isTheSame) {
				lastMessage.charEnd++;
			} else {
				var m = new Message(kind, this.lineId + 1, this.charId + 1, message);
				this.addMessage(m);
			}
		}

		protected addLinterError(message: string): void {
			this.addLinterMessage(MessageKind.ERROR, message);
		}

		protected addLinterWarning(message: string): void {
			this.addLinterMessage(MessageKind.WARNING, message);
		}

		protected checkStructure(src: string): void {
			var lines = src.split(/\r\n|\n|\r/g);
			this.level = 0;
			this.commentLevel = 0;
			this.isName = false;
			this.hasValue = [];
			this.hasChildren = [];
			this.lineId = 0;
			
			var commentStart = this.getCommentStart();
			var commentEnd = this.getCommentEnd();
			var nodeStart = this.getNodeStart();
			var nameEnd = this.getNameEnd();
			var nodeEnd = this.getNodeEnd();

			for (var n = lines.length; this.lineId < n; this.lineId++) {

				var line = lines[this.lineId];
				this.charId = 0;

				for (var o = line.length; this.charId < o; this.charId++) {

					var char = line.charAt(this.charId);

					if (char == commentStart) {
						
						// Comments are valid everywhere
						
						this.commentLevel++;

					} else {
						
						// Not a comment start
						
						if (this.commentLevel > 0) {
							
							// Context: in a comment
							
							if (char == commentEnd) {
								this.commentLevel--;
							}

						} else if (char == commentEnd) {
							
							// Context: not in a comment and char is a comment end delimiter
							
							this.addLinterError('Unexpected comment end delimiter.');

						} else {
							
							// Context: in a node or root
							
							if (this.isName) {
								
								// Context: in name
								
								if (char == nameEnd) {

									this.isName = false;

								} else if (char == nodeStart) {

									this.addLinterError('Invalid location for node start delimiter.');
									
									this.isName = false;
									this.charId--;
									continue;

								} else if (char == nodeEnd) {

									this.addLinterError('Invalid location for node end delimiter.');
									
									this.isName = false;
									this.charId--;
									continue;

								}

							} else {
								
								// Context: in value
								
								if (char == nameEnd) {

									this.addLinterError('Invalid location for name end delimiter.');

								} else if (char == nodeStart) {

									this.hasChildren[this.level] = true;
									
									if (this.hasValue[this.level]) {
										this.addLinterWarning('Node has both children and value.');
									}
									
									this.level++;
									this.isName = true;

								} else if (char == nodeEnd) {

									this.hasValue[this.level] = false;
									this.hasChildren[this.level] = false;
									this.level--;
									
									if (this.level < 0) {
										this.addLinterError('Invalid location for node end delimiter.');
										this.level = 0;
									}
									
									this.isName = false;

								} else if (!this.whiteSpaceRE.test(char)) {

									this.hasValue[this.level] = true;
									
									if (this.hasChildren[this.level]) {
										this.addLinterWarning('Node has both children and value.');
									}

								}

							}

						}
					}
				}
			}
			
			if (this.commentLevel > 0) {
				this.addLinterWarning('Comment not closed.');
			}
			if (this.level > 0) {
				this.addLinterError('Node not closed.');
			}
		}
	}
}