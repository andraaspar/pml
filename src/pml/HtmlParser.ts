/// <reference path='HtmlHandler.ts'/>
/// <reference path='Node.ts'/>

module pml {
	export enum HtmlParserContext {
		ATTRIBUTE_NAME,
		ATTRIBUTE_SPACE_BEFORE,
		ATTRIBUTE_SPACE_AFTER,
		ATTRIBUTE_VALUE,
		CLOSING_TAG,
		COMMENT,
		TAG_NAME,
		TAG_SPACE,
		TEXT_NODE
	}
	
	export class HtmlParser extends HtmlHandler {
		
		private charId: number;
		private context: HtmlParserContext;
		private currentNode: Node;
		private src: string;
		private attributeValueEnd: string;
		private closingTagName: string;
		
		constructor() {
			super();
		}
		
		parse(src: string): Node {
			this.src = src.replace(/\r\n|\r/g, '\n');
			
			var rootNode = this.currentNode = new Node();
			rootNode.name = '';
			rootNode.children = [];
			
			this.charId = 0;
			this.closingTagName = '';
			this.setContext(HtmlParserContext.TEXT_NODE);
			
			this.parseLoop();
			
			this.simplify(rootNode);
			
			return rootNode;
		}
		
		protected parseLoop(): void {
			for (; this.charId < this.src.length; this.charId++) {
				var char = this.src[this.charId];
				
				switch (this.context) {
					case HtmlParserContext.TAG_NAME:
						if (char == '>') {
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (char == '/') {
							this.returnToParent();
							this.charId++;
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (/[\s\n]/.test(char)) {
							this.setContext(HtmlParserContext.TAG_SPACE);
						} else {
							this.currentNode.name += char;
						}
						break;
					case HtmlParserContext.TAG_SPACE:
						if (char == '>') {
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (char == '/') {
							this.returnToParent();
							this.charId++;
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (/[^\s\n\/]/.test(char)) {
							this.setContext(HtmlParserContext.ATTRIBUTE_NAME);
						}
						break;
					case HtmlParserContext.ATTRIBUTE_NAME:
						if (char == '=') {
							if (/[\s\n]/.test(this.src[this.charId + 1])) {
								this.setContext(HtmlParserContext.ATTRIBUTE_SPACE_AFTER);
							} else {
								this.charId++;
								this.setContext(HtmlParserContext.ATTRIBUTE_VALUE);
							}
						} else if (/[\s\n]/.test(char)) {
							this.setContext(HtmlParserContext.ATTRIBUTE_SPACE_BEFORE);
						} else if (char == '>') {
							this.returnToParent();
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (char == '/') {
							this.returnToParent();
							this.returnToParent();
							this.charId++;
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (/[\s\n]/.test(char)) {
							this.setContext(HtmlParserContext.ATTRIBUTE_SPACE_BEFORE);
						} else {
							this.currentNode.name += char;
						}
						break;
					case HtmlParserContext.ATTRIBUTE_SPACE_BEFORE:
					case HtmlParserContext.ATTRIBUTE_SPACE_AFTER:
						if (char == '=') {
							if (/[\s\n]/.test(this.src[this.charId + 1])) {
								this.setContext(HtmlParserContext.ATTRIBUTE_SPACE_AFTER);
							} else {
								this.charId++;
								this.setContext(HtmlParserContext.ATTRIBUTE_VALUE);
							}
						} else if (char == '>') {
							this.returnToParent();
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (char == '/') {
							this.returnToParent();
							this.returnToParent();
							this.charId++;
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (!/\s/.test(char)) {
							if (this.getContext() == HtmlParserContext.ATTRIBUTE_SPACE_BEFORE) {
								this.returnToParent();
								this.setContext(HtmlParserContext.ATTRIBUTE_NAME);
							} else {
								this.setContext(HtmlParserContext.ATTRIBUTE_VALUE);
							}
						}
						break;
					case HtmlParserContext.ATTRIBUTE_VALUE:
						if (this.attributeValueEnd && char == this.attributeValueEnd ||
							!this.attributeValueEnd && /[\s\n\/]/.test(char)) {
							this.returnToParent();
							this.setContext(HtmlParserContext.TAG_SPACE);
						} else if (char == '>') {
							this.returnToParent();
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else if (char == '/' && this.src[this.charId + 1] == '>') {
							this.returnToParent();
							this.returnToParent();
							this.charId++;
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else {
							this.currentNode.value += char;
						}
						break;
					case HtmlParserContext.TEXT_NODE:
						if (char == '<') {
							var nextChar = this.src.charAt(this.charId + 1);
							if (nextChar == '/') {
								this.setContext(HtmlParserContext.CLOSING_TAG);
								this.charId++;
							} else if (this.src.substr(this.charId + 1, 3) == '!--') {
								this.setContext(HtmlParserContext.COMMENT);
								this.charId += 3;
							} else {
								this.setContext(HtmlParserContext.TAG_NAME);
							}
						} else {
							this.currentNode.value += char;
						}
						break;
					case HtmlParserContext.COMMENT:
						if (char == '-' && this.src.substr(this.charId, 3) == '-->') {
							this.setContext(HtmlParserContext.TEXT_NODE);
							this.charId += 2;
						} else {
							this.currentNode.value += char;
						}
						break;
					case HtmlParserContext.CLOSING_TAG:
						if (char == '>') {
							this.setContext(HtmlParserContext.TEXT_NODE);
						} else {
							this.closingTagName += char;
						}
						break;
					default:
						throw 'Invalid context.';
				}
			}
		}
		
		protected simplify(node: Node): void {
			if (this.hasChildren(node)) {
				for (var i = 0; i < node.children.length; i++) {
					var child = node.children[i];
					var unignoredNextSibling = this.getUnignoredNextSibling(child);
					var unignoredPreviousSibling = this.getUnignoredPreviousSibling(child);
					
					if (child.name == '') {
						if (child.value == '') {
							
							this.removeNode(child);
							
						} else if (/^[\s\n]*$/g.test(child.value) && // Has whitespace value only
							(unignoredPreviousSibling || unignoredNextSibling) && // Has siblings
							(!unignoredPreviousSibling || this.checkIsBlock(unignoredPreviousSibling)) && // Previous sibling does not exist or is block
							(!unignoredNextSibling || this.checkIsBlock(unignoredNextSibling))) { // Next sibling does not exist or is block
						
							this.removeNode(child);
						}
					}
				}
				if (node.children.length == 1 && node.children[0].name == '' && !this.hasChildren(node.children[0])) {
					node.value = node.children[0].value;
					node.children = undefined;
				} else {
					for (var i = 0, n = node.children.length; i < n; i++) {
						this.simplify(node.children[i]);
					}
				}
			}
		}
		
		protected startNewNode(): void {
			var newNode = new Node();
			newNode.name = '';
			newNode.value = '';
			if (this.currentNode) {
				newNode.parent = this.currentNode;
				if (!this.currentNode.children) {
					this.currentNode.children = [];
				}
				newNode.previousSibling = this.currentNode.children[this.currentNode.children.length - 1];
				if (newNode.previousSibling) newNode.previousSibling.nextSibling = newNode;
				this.currentNode.children.push(newNode);
			}
			this.currentNode = newNode;
		}
		
		protected returnToParent(): void {
			this.currentNode = this.currentNode.parent;
		}
		
		protected removeNode(node: Node): void {
			if (node.parent) {
				node.parent.children.splice(illa.ArrayUtil.indexOf(node.parent.children, node), 1);
				node.parent = undefined;
			}
			if (node.previousSibling) {
				node.previousSibling.nextSibling = node.nextSibling;
			}
			if (node.nextSibling) {
				node.nextSibling.previousSibling = node.previousSibling;
			}
			node.previousSibling = node.nextSibling = undefined;
		}
		
		protected getContext(): HtmlParserContext {
			return this.context;
		}
		
		protected setContext(newContext: HtmlParserContext): void {
			
			var char = this.src[this.charId];
			
			switch (this.context) {
				case HtmlParserContext.ATTRIBUTE_NAME:
				case HtmlParserContext.ATTRIBUTE_SPACE_AFTER:
				case HtmlParserContext.ATTRIBUTE_SPACE_BEFORE:
				case HtmlParserContext.ATTRIBUTE_VALUE:
				case HtmlParserContext.COMMENT:
				case HtmlParserContext.TAG_NAME:
				case HtmlParserContext.TAG_SPACE:
					if (newContext == HtmlParserContext.TEXT_NODE) {
						var firstChar = this.currentNode.name.charAt(0);
						if (firstChar == '!' ||
							firstChar == '?' ||
							!this.checkHasEnd(this.currentNode)) {
							// Auto-close
							this.returnToParent();
						}
					}
					break;
				case HtmlParserContext.CLOSING_TAG:
					var startingNode = this.currentNode;
					try {
						while (this.currentNode.name !== this.closingTagName) {
							// Find parent to close
							this.returnToParent();
						}
					} catch (e) {
						console.log(startingNode);
						throw 'Could not find <' + this.closingTagName + '> as an ancestor of the current <' + startingNode.name + '> tag.';
					}
					// Close parent
					this.returnToParent();
					break;
				case HtmlParserContext.TEXT_NODE:
//					if (/^[\s\n]*$/g.test(this.currentNode.value)) {
//						this.currentNode.value = ' ';
//					}
					this.returnToParent();
					break;
			}
			
			switch (newContext) {
				case HtmlParserContext.TEXT_NODE:
				case HtmlParserContext.TAG_NAME:
				case HtmlParserContext.ATTRIBUTE_NAME:
				case HtmlParserContext.COMMENT:
					this.startNewNode();
					break;
			}
			
			switch (newContext) {
				case HtmlParserContext.ATTRIBUTE_NAME:
					this.currentNode.name += '@';
					this.currentNode.name += char;
					break;
				case HtmlParserContext.ATTRIBUTE_VALUE:
					if (/["']/.test(char)) {
						this.attributeValueEnd = char;
					} else {
						this.attributeValueEnd = '';
						this.currentNode.value += char;
					}
					break;
				case HtmlParserContext.CLOSING_TAG:
					this.closingTagName = '';
					break;
				case HtmlParserContext.COMMENT:
					this.currentNode.name = '!--';
					break;
			}
			
			this.context = newContext;
		}
	}
}