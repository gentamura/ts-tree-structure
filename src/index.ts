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

type ParseArgs<T> = (NodeVisitorFunction<T> | Options | undefined)[];
interface Args<T> {
  fn: NodeVisitorFunction<T>;
  options: Options;
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
  walkStrategy: WalkStrategy<T>;

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

  private _parseArgs<T>(...args: ParseArgs<T>): Args<T> {
    let parsedArgs: Args<T>;

    if (typeof args[0] === 'function') {
      parsedArgs = {
        fn: args[0],
        options: (typeof args[1] === 'object')
          ? args[1]
          : { strategy: 'pre' },
      };
    } else {
      parsedArgs = {
        fn: (typeof args[1] === 'function')
          ? args[1]
          : (() => true),
        options: args[0] ?? { strategy: 'pre' },
      };
    }

    return parsedArgs;
  }

  first(fn?: NodeVisitorFunction<T>, options?: Options): Node<T> | undefined;
  first(options?: Options): Node<T> | undefined;
  first(...argList: ParseArgs<T>): Node<T> | undefined {
    let first;

    const { fn, options } = this._parseArgs(...argList);

    if (options.strategy === 'pre') {
      this.walkStrategy.pre(this, (node: Node<T>) => {
        if (fn(node)) {
          first = node;
          return false;
        }
      });
    } else if (options.strategy === 'post') {
      this.walkStrategy.post(this, (node: Node<T>) => {
        if (fn(node)) {
          first = node;
          return false;
        }
      });
    }

    return first;
  }

  all(fn?: NodeVisitorFunction<T>, options?: Options): Node<T>[];
  all(options?: Options): Node<T>[];
  all(...argList: ParseArgs<T>): Node<T>[] {
    const all: Node<T>[] = [];

    const { fn, options } = this._parseArgs(...argList);

    switch(options.strategy) {
      case 'pre':
        this.walkStrategy.pre(this, callback);
        break;
      case 'post':
        this.walkStrategy.post(this, callback);
        break;
      case 'breadth':
        this.walkStrategy.breadth(this, callback);
    }

    return all;

    function callback(node: Node<T>) {
      if (fn(node)) {
        all.push(node);
      }
    }
  }

  drop() {
    if (!this.isRoot() && this.parent) {
      const indexOfChild = this.parent.children.indexOf(this);
      this.parent.children.splice(indexOfChild, 1); // Remove Node from data
      this.parent.model.children?.splice(indexOfChild, 1); // remove Model from data
      this.parent = undefined; // Delete object references
      delete this.parent; // Delete object references
    }

    return this;
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

  private _addToPath(path: Node<T>[], node: Node<T>) {
    path.unshift(node);

    if (!node.isRoot()) {
      this._addToPath(path, node.parent!);
    }

    return path;
  }

  getPath() {
    return this._addToPath([], this);
  }

  hasChildren() {
    return this.children.length > 0;
  }

  walk(fn: Function, options: Options = { strategy: 'pre' }) {
    switch (options.strategy) {
      case 'pre':
        this.walkStrategy.pre(this, fn);
        break;
      case 'post':
        this.walkStrategy.post(this, fn);
        break;
      case 'breadth':
        this.walkStrategy.breadth(this, fn);
        break;
    }
  }
}

class WalkStrategy<T> {
  pre(node: Node<T>, callback: Function) {
    const len = node.children.length;
    let keepGoing = callback(node);

    for (let i = 0; i < len; i++) {
      if (keepGoing === false) {
        return false;
      }

      keepGoing = this.pre(node.children[i], callback);
    }

    return keepGoing;
  }

  post(node: Node<T>, callback: Function) {
    const len = node.children.length;
    let keepGoing;

    for (let i = 0; i < len; i++) {
      keepGoing = this.post(node.children[i], callback);

      if (keepGoing === false) {
        return false;
      }
    }

    keepGoing = callback(node);

    return keepGoing;
  }

  breadth(node: Node<T>, callback: Function) {
    const queue = [node];

    (function processQueue() {
      if (queue.length === 0) {
        return;
      }

      const node = queue.shift()!;
      const len = node.children.length;

      for (let i = 0; i < len; i++) {
        queue.push(node.children[i]);
      }

      if (callback(node) !== false) {
        processQueue();
      }
    })();
  }
}

export default TreeData;