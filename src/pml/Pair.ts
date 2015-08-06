

module pml {
	export class Pair {
		name: string;
		value: string;
		children: Pair[];
		parent: Pair;
		nextSibling: Pair;
		previousSibling: Pair;
	}
}