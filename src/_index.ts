import mergeSort from './mergesort';
import findInsertIndex from './find-insert-index';

interface Config {
  modelComparatorFn?: <T>(a: T, b: T) => number;
}

interface Model<T> extends Node<T> {
  children: Node<T>[];
}

class TreeData {
  private config: Config;

  constructor(config?: Config) {
    this.config = config ?? {};
    this.config.modelComparatorFn = config && config.modelComparatorFn;
  }

  _addChildToNode<T>(node: Node<T>, child: Node<T>) {
    child.parent = node;
    node.children.push(child);
    return child;
  }

  parse<T>(model: Model<T>): Node<T> {
    // if (!(model instanceof Object)) {
    //   throw new TypeError('Model must be of type object.');
    // }

    const node = new Node(this.config, model);
    const {
      modelComparatorFn,
    } = this.config;

    const children = modelComparatorFn
      ? mergeSort(
          modelComparatorFn,
          model.children,
        )
      : model.children;

    for (let i = 0, childCount = children.length; i < childCount; i++) {
      this._addChildToNode(node, this.parse(children[i]));
    }

    return node;
  }
}

interface Options {
  strategy: StrategyName;
}

type StrategyName = 'pre' | 'post' | 'breadth';

class WalkStrategies<T> {
  private node: Node<T>;

  constructor(node: Node<T>) {
    this.node = node;
  }

  pre(children: any, callback: any): boolean {
    let i, childCount, keepGoing;

    keepGoing = callback(this.node);

    for (i = 0, childCount = children.length; i < childCount; i++) {
      if (keepGoing === false) {
        return false;
      }

      keepGoing = this.pre(children, callback);
    }

    return keepGoing;
  }

  post(children: any, callback: any) {
    let i, childCount, keepGoing;

    for (i = 0, childCount = children.length; i < childCount; i++) {
      keepGoing = this.post(children, callback);

      if (keepGoing === false) {
        return false;
      }
    }

    keepGoing = callback(this.node);

    return keepGoing;
  }

  breadth(children: any, callback: any) {
    let queue = [this.node];

    (function processQueue() {
      if (queue.length === 0) {
        return;
      }

      const node: Node<T> = queue.shift()!;
      for (let i = 0, childCount = node.children.length; i < childCount; i++) {
        queue.push(node.children[i]);
      }

      if (callback(node) !== false) {
        processQueue();
      }
    })();
  }
}

class Node<T> {
  private config: Config;
  private walkStrategies: WalkStrategies<T>;
  public model: Model<T>;
  public children: Node<T>[];
  public parent?: Node<T>;

  constructor(config: Config, model: Model<T>) {
    this.config = config;
    this.model = model;
    this.children = [];
    this.walkStrategies = new WalkStrategies(this);
  }

  private _hasComparatorFunction(node: Node<T>) {
    return typeof node.config.modelComparatorFn === 'function';
  }

  private _addChild(self: Node<T>, child: Node<T>, insertIndex?: number) {
    var index;

    if (!(child instanceof Node)) {
      throw new TypeError('Child must be of type Node.');
    }

    child.parent = self;

    if (!(self.model.children instanceof Array)) {
      self.model.children = [];
    }

    const children: Node<T>[] = self.model.children instanceof Array
      ? self.model.children
      : [];


    if (this._hasComparatorFunction(self) && self.config.modelComparatorFn) {
      // Find the index to insert the child
      index = findInsertIndex(
        self.config.modelComparatorFn,
        children,
        child.model);

      // Add to the model children
      children.splice(index, 0, child.model);

      // Add to the node children
      self.children.splice(index, 0, child);
    } else {
      if (insertIndex === undefined) {
        children.push(child.model);
        self.children.push(child);
      } else {
        if (insertIndex < 0 || insertIndex > self.children.length) {
          throw new Error('Invalid index.');
        }
        children.splice(insertIndex, 0, child.model);
        self.children.splice(insertIndex, 0, child);
      }
    }
    return child;
  }

  public addChild(child: Node<T>) {
    return this._addChild(this, child);
  }

  public addChildAtIndex(child: Node<T>, index: number) {
    if (this._hasComparatorFunction(this)) {
      throw new Error('Cannot add child at index when using a comparator function.');
    }

    return this._addChild(this, child, index);
  };

  public setIndex(index: number) {
    if (this._hasComparatorFunction(this)) {
      throw new Error('Cannot set node index when using a comparator function.');
    }

    if (this.isRoot()) {
      if (index === 0) {
        return this;
      }
      throw new Error('Invalid index.');
    }

    if (this.parent) {
      if (index < 0 || index >= this.parent.children.length) {
        throw new Error('Invalid index.');
      }

      const oldIndex = this.parent.children.indexOf(this);

      this.parent.children.splice(index, 0, this.parent.children.splice(oldIndex, 1)[0]);

      this.parent.model.children
        .splice(index, 0, this.parent.model.children.splice(oldIndex, 1)[0]);
    }

    return this;
  };

  public isRoot() {
    return this.parent === undefined;
  }

  public hasChildren() {
    return this.children.length > 0;
  }

  private _addToPath(node: Node<T>, path: Node<T>[]) {
    path.unshift(node);

    if (!node.isRoot() && node.parent) {
      this._addToPath(node.parent, path);
    }

    return path;
  }

  public getPath() {
    const path: Node<T>[] = [];

    this._addToPath(this, path);

    return path;
  }

  public getIndex() {
    if (this.isRoot()) {
      return 0;
    }

    return this.parent && this.parent.children.indexOf(this);
  }

  public walk(fn: Function, options: Options = { strategy: 'pre' }) {
    this.walkStrategies[options.strategy](this.children, fn);
  }

  all(fn: Function, options: Options = { strategy: 'pre' }) {
    const all: Node<T>[] = [];

    this.walkStrategies[options.strategy](this.children, (node: Node<T>) => {
      if (fn(node)) {
        all.push(node);
      }
    });

    return all;
  }

  first(fn: Function, options: Options = { strategy: 'pre' }) {
    let first;

    this.walkStrategies[options.strategy](this.children, (node: Node<T>) => {
      if (fn(node)) {
        first = node;
        return false;
      }
    });

    return first;
  };

  drop() {
    if (!this.isRoot() && this.parent) {
      const indexOfChild = this.parent.children.indexOf(this);
      this.parent.children.splice(indexOfChild, 1);
      this.parent.model.children.splice(indexOfChild, 1);
      this.parent = undefined;
      delete this.parent;
    }

    return this;
  };
}

export type { Node };
export default TreeData;