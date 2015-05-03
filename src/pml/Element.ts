

module pml {
	export class Element {
		name: string;
		value: string;
		children: Element[];
		parent: Element;
		nextSibling: Element;
		previousSibling: Element;
	}
}