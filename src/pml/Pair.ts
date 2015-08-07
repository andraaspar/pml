

module pml {
	export class Pair {
		key: string;
		value: string;
		children: Pair[];
		parent: Pair;
		nextSibling: Pair;
		previousSibling: Pair;
	}
}