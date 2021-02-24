type ComparatorFunction = (left: any, right: any) => boolean;
type NodeVisitorFunction<T> = (visitingNode: Node<T>) => boolean;

type Model<T> = T & { children?: Model<T>[] };

interface Config {
  modelComparatorFn?: ComparatorFunction;
  [propName: string]: any;
}

type StrategyName = 'pre' | 'post' | 'breadth';

interface Options {
  strategy: StrategyName;
}

class TreeData {
  private config?: Config;

  constructor(config?: Config) {
    this.config = config;
  }

  private _addChildToNode<T>(node: Node<T>, child: Node<T>) {
    child.parent = node;
    node.children.push(child);
  }

  parse<T>(model: Model<T>): Node<T> {
    const node = new Node(this.config, model);

    if (model.children) {
      model.children.forEach((child: Model<T>) => {
        this._addChildToNode(node, this.parse(child));
      });
    }

    return node;
  }
}

export class Node<T> {
  config: Config;
  model: Model<T>;
  children: Node<T>[];
  parent?: Node<T>;
  walkStrategy: WalkStrategy;

  constructor(config: any, model: Model<T>) {
    this.config = config;
    this.model = model;
    this.children = [];
    this.walkStrategy = new WalkStrategy();
  }

  private _addChild(self: Node<T>, child: Node<T>, insertIndex?: number) {
    child.parent = self;
    self.model.children = self.model.children ?? [];

    if (insertIndex == null) {
      self.model.children.push(child.model);
      self.children.push(child);

      return child;
    }

    if (insertIndex < 0 || insertIndex > self.children.length) {
      throw new Error('Invalid index.');
    }

    self.model.children.splice(insertIndex, 0, child.model);
    self.children.splice(insertIndex, 0, child);

    return child;
  }

  addChild(child: Node<T>) {
    return this._addChild(this, child);
  }

  addChildAtIndex(child: Node<T>, index: number) {
    return this._addChild(this, child, index);
  }

  first(fn: NodeVisitorFunction<T>): Node<T> | undefined {
    let first;

    const args = {
      fn,
      options: {
        strategy: 'pre',
      },
    };

    if (args.options.strategy === 'pre') {
      this.walkStrategy.pre(this, (node: Node<T>) => {
        if (args.fn(node)) {
          first = node;
          return false;
        }
      });
    }

    return first;
  }

  isRoot() {
    return this.parent === undefined;
  }

  setIndex(index: number) {
    if (this.parent === undefined) {
      if (index === 0) {
        return this;
      }
      throw new Error('Invalid index.');
    }

    if (index < 0 || index >= this.parent.children.length) {
      throw new Error('Invalid index.');
    }

    const currentIndex = this.parent.children.indexOf(this);

    // Get target node in children by current index.
    const node = this.parent.children.splice(currentIndex, 1)[0];
    // Insert the node in children by new index.
    this.parent.children.splice(index, 0, node);

    // Get target model in children by current index.
    const model = this.parent.model.children!.splice(currentIndex, 1)[0];
    // Insert the model in children by new index.
    this.parent.model.children!.splice(index, 0, model);

    return this;
  }

  getIndex() {
    if (this.parent === undefined) {
      return 0;
    }

    return this.parent.children.indexOf(this);
  };
}

class WalkStrategy {
  pre<T>(node: Node<T>, callback: any) {
    let keepGoing = callback(node);
    let len = node.children.length;

    for (let i = 0; i < len; i++) {
      if (keepGoing === false) {
        return false;
      }
      keepGoing = this.pre(node.children[i], callback);
    }

    return keepGoing;
  }
}

export default TreeData;