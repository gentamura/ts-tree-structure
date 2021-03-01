import type { NodeVisitorFunction } from './types';
import Node from './node';

class WalkStrategy<T> {
  pre(node: Node<T>, callback: NodeVisitorFunction<T>): boolean {
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

  post(node: Node<T>, callback: NodeVisitorFunction<T>): boolean {
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

  breadth(node: Node<T>, callback: NodeVisitorFunction<T>): void {
    const queue = [node];

    (function processQueue() {
      if (queue.length === 0) {
        return;
      }

      const node = queue.shift();
      if (node) {
        const len = node.children.length;

        for (let i = 0; i < len; i++) {
          queue.push(node.children[i]);
        }

        if (callback(node) !== false) {
          processQueue();
        }
      }
    })();
  }
}

export default WalkStrategy;
