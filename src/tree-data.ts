import type { Model } from './types';
import Node from './node';

class TreeData {
  private _addChildToNode<T>(node: Node<T>, child: Node<T>) {
    child.parent = node;
    node.children.push(child);
  }

  parse<T>(model: Model<T>): Node<T> {
    const node = new Node(model);

    if (model.children) {
      model.children.forEach((child: Model<T>) => {
        this._addChildToNode(node, this.parse(child));
      });
    }

    return node;
  }
}

export default TreeData;
