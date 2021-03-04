# TreeData

Manipulate and traverse tree-like structures in TypeScript.

![Build Status](https://github.com/gentamura/tree-data/workflows/build-test/badge.svg)

## Installation

### Node

TreeData is available as an npm module so you can install it with `npm install tree-data` and use it in your script:

#### ES Module
```ts
import TreeData from 'tree-data';

const tree = new TreeData();
const root = tree.parse({ id: 1, name: 'foo', children: [{ id: 11, name: 'bar' }]});
```

#### Common.js
```js
const TreeData = require('tree-data');

const tree = new TreeData();
const root = tree.parse({ id: 1, name: 'foo', children: [{ id: 11, name: 'bar' }]});
```

#### UMD
```html
<script src="https://unpkg.com/tree-data/"></script>
<script>
  var tree = new TreeData();
  var root = tree.parse({ id: 1, name: 'foo', children: [{ id: 11, name: 'bar' }]});
</script>
```

#### TypeScript
Type definitions are already bundled with the package, which should just work with npm install.

You can maually find the definition files in the `src` folder.

## API Reference

### Create a new TreeData

Create a new TreeData with the given options.

```js
const tree = new TreeData()
```

### Parse the hierarchy object

Parse the given user defined model and return the root Node object.

```js
tree.parse(model): Node
```

### Is Root?

Return `true` if this Node is the root, `false` otherwise.

```js
node.isRoot(): boolean
```

### Has Children?

Return `true` if this Node has one or more children, `false` otherwise.

```js
node.hasChildren(): boolean
```

### Add a child

Add the given node as child of this one. Return the child Node.

```js
parentNode.addChild(childNode): Node
```

### Add a child at a given index

Add the given node as child of this one at the given index. Return the child Node.

```js
parentNode.addChildAtIndex(childNode, index): Node
```

### Set the index of a node among its siblings

Sets the index of the node among its siblings to the given value. Return the node itself.

```js
node.setIndex(index): Node
```

### Get the index of a node among its siblings

Gets the index of the node relative to its siblings. Return the index value.

```js
node.getIndex(): number
```

### Get the node path

Get the array of Nodes representing the path from the root to this Node (inclusive).

```js
node.getPath(): Node[]
```

### Delete a node from the tree

Drop the subtree starting at this node. Returns the node itself, which is now a root node.

```js
node.drop(): Node
```

*Warning* - Dropping a node while walking the tree is not supported. You must first collect the nodes to drop using one of the traversal functions and then drop them. Example:

```js
root.all( /* predicate */ ).forEach((node) => {
  node.drop();
});
```

### Find a node

Starting from this node, find the first Node that matches the predicate and return it. The **predicate** is a function wich receives the visited Node and returns `true` if the Node should be picked and `false` otherwise.

```js
node.first(predicate): Node
```

### Find all nodes

Starting from this node, find all Nodes that match the predicate and return these.

```js
node.all(predicate): Node[]
```

### Walk the tree

Starting from this node, traverse the subtree calling the action for each visited node. The action is a function which receives the visited Node as argument. The traversal can be halted by returning `false` from the action.

```js
node.walk([options], action): void
```

**Note** - `first`, `all` and `walk` can optionally receive as first argument an object with traversal options. Currently the only supported option is the traversal `strategy` which can be any of the following:

* `{strategy: 'pre'}` - Depth-first pre-order *[default]*;
* `{strategy: 'post'}` - Depth-first post-order;
* `{strategy: 'breadth'}` - Breadth-first.

These functions can also take, as the last parameter, the *context* on which the action will be called.

## Contributing

### Setup

Fork this repository and run `npm install` on the project root folder to make sure you have all project dependencies installed.

### Code Linting

Run `npm run lint`

This will check both source and tests for code correctness and style compliance.

### Running Tests

Run `npm test`

## License

[MIT](LICENSE.md)
