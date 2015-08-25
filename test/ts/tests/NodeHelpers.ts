function addNodeToParent(node: pml.Node, parent: pml.Node): void {
	node.parent = parent;
	var previousSibling = parent.children[parent.children.length - 1];
	if (previousSibling) {
		node.previousSibling = previousSibling;
	}
	if (node.previousSibling) {
		node.previousSibling.nextSibling = node;
	}
	parent.children.push(node);
}

function createNode(name: string, parent?: pml.Node): pml.Node {
	var result = new pml.Node();
	result.name = name;
	if (parent) {
		addNodeToParent(result, parent);
	}
	result.children = [];
	return result;
}

function createLeaf(name: string, value: string, parent?: pml.Node): pml.Node {
	var result = new pml.Node();
	result.name = name;
	result.value = value;
	if (parent) {
		addNodeToParent(result, parent);
	}
	return result;
}