class TreeData {
  config: any;

  constructor(config?: any) {
    this.config = config;
  }

  _addChildToNode(node: Node, child: Node) {
    child.parent = node;
    node.children.push(child);
  }

  parse(model: any): Node {
    const node = new Node(this.config, model);

    if (model.children) {
      model.children.forEach((child: any) => {
        this._addChildToNode(node, this.parse(child));
      });
    }

    return node;
  }
}

class Node {
  config: any;
  model: any;
  children: any;
  parent: any;

  constructor(config: any, model: any) {
    this.config = config;
    this.model = model;
    this.children = [];
  }
}

export default TreeData;