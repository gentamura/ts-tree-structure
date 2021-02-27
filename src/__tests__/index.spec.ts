import TreeData, { Node } from '../index';

type NodeType = { id: number };

describe('TreeData', () => {
  const idEq = (id: number) => (node: Node<NodeType>) => {
    return node.model.id === id;
  };

  describe('with default configuration', () => {
    let treeData: TreeData;

    beforeEach(() => {
      treeData = new TreeData();
    });

    describe('parse()', () => {
      it('should create a root node when given a model without children', () => {
        const root = treeData.parse({ id: 1 });

        expect(root.parent).toBeUndefined();
        expect(Array.isArray(root.children)).toBe(true);
        expect(root.children.length).toEqual(0);
        expect(root.model).toEqual({ id: 1 });
      });

      it('should create a root and the respective children when given a model with children', () => {
        const root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [
                { id: 111 },
              ],
            },
            {
              id: 12,
              children: [
                { id: 121 },
                { id: 122 },
                { id: 123 },
                { id: 124 },
                { id: 125 },
                { id: 126 },
                { id: 127 },
                { id: 128 },
                { id: 129 },
                { id: 1210 },
                { id: 1211 },
              ]
            }
          ]
        });

        expect(root.parent).toBeUndefined();
        expect(Array.isArray(root.children)).toBe(true);
        expect(root.children.length).toEqual(2);
        expect(root.model).toEqual({
          id: 1,
          children: [
            {
              id: 11,
              children: [
                { id: 111 },
              ],
            },
            {
              id: 12,
              children: [
                { id: 121 },
                { id: 122 },
                { id: 123 },
                { id: 124 },
                { id: 125 },
                { id: 126 },
                { id: 127 },
                { id: 128 },
                { id: 129 },
                { id: 1210 },
                { id: 1211 },
              ]
            }
          ]
        });
        expect(root).toEqual(root.children[0].parent);
        expect(root).toEqual(root.children[1].parent);

        const node12 = root.children[1];
        expect(Array.isArray(node12.children)).toBe(true);
        expect(node12.children.length).toEqual(11);
        expect(node12.model).toEqual({
          id: 12,
          children: [
            { id: 121 },
            { id: 122 },
            { id: 123 },
            { id: 124 },
            { id: 125 },
            { id: 126 },
            { id: 127 },
            { id: 128 },
            { id: 129 },
            { id: 1210 },
            {id: 1211 },
          ]
        });
        expect(node12).toEqual(node12.children[0].parent);
        expect(node12).toEqual(node12.children[1].parent);
      });
    });

    describe('addChild()', () => {
      let root: Node<NodeType>;

      beforeEach(() => {
        root = treeData.parse({ id: 1, children: [{ id: 11 }, { id: 12 }] });
      });

      it('should add child to the end', () => {
        root.addChild(treeData.parse({ id: 13 }));
        root.addChild(treeData.parse({ id: 10 }));
        expect(root.model.children).toEqual([{ id: 11 }, { id: 12 }, { id: 13 }, { id: 10 }]);
      });

      it('should add child at index', () => {
        root.addChildAtIndex(treeData.parse({ id: 13 }), 1);
        expect(root.model.children).toEqual([{ id: 11 }, { id: 13 }, { id: 12 }]);
        expect(root.children[1].model.id).toEqual(13);
      });

      it('should add child at the end when index matches the children number', () => {
        root.addChildAtIndex(treeData.parse({ id: 13 }), 2);
        expect(root.model.children).toEqual([{ id: 11 }, { id: 12 }, { id: 13 }]);
      });

      it('should add child at index 0 of a leaf', () => {
        const leaf = root.first(idEq(11))!;
        leaf.addChildAtIndex(treeData.parse({ id: 111 }), 0);
        expect(leaf.model.children).toEqual([{ id: 111 }]);
      });

      it('should throw an error when adding child at negative index', () => {
        const child = treeData.parse({ id: 13 });
        expect(() => root.addChildAtIndex(child, -1)).toThrow(new Error('Invalid index.'));
      });

      it('should throw an error when adding child at a too high index', () => {
        const child = treeData.parse({ id: 13 });
        expect(() => root.addChildAtIndex(child, 3)).toThrow(new Error('Invalid index.'));
      });
    });

    describe('setIndex()', () => {
      let root: Node<NodeType>;

      beforeEach(() => {
        root = treeData.parse({ id: 1, children: [{ id: 11 }, { id: 12 }, { id: 13 }] });
      });

      it('should set the index of the node among its siblings', () => {
        const child = root.children[0];

        for (let i = 0; i < root.children.length; i++) {
          child.setIndex(i);
          expect(child.getIndex()).toEqual(i);
          expect(root.model.children?.indexOf(child.model)).toEqual(i);
        }
      });

      it('keeps the order of all other nodes', () => {
        let oldOrder, i, j, k, l;
        const child = root.children[0];

        for (i = 0; i < root.children.length; i++) {
          oldOrder = [];
          for (j = 0; j < root.children.length; j++) {
            if (root.children[j] !== child) {
              oldOrder.push(root.children[j]);
            }
          }

          child.setIndex(i);

          for (k = 0; k < root.children.length; k++) {
            for (l = 0; l < root.children.length; l++) {
              if (root.children[k] !== child && root.children[l] !== child) {
                expect(k < l).toEqual(oldOrder.indexOf(root.children[k]) < oldOrder.indexOf(root.children[l]));
              }
            }
          }
        }
      });

      it('should return itself', () => {
        const child = root.children[0];
        expect(child.setIndex(1)).toEqual(child);
      });

      it('should throw an error when node is a root and the index is not zero', () => {
        expect(() => root.setIndex(1)).toThrow(new Error('Invalid index.'));
      });

      it('should allow to set the root node index to zero', () => {
        expect(root.setIndex(0)).toEqual(root);
      });

      it('should throw an error when setting to a negative index', () => {
        expect(() => root.children[0].setIndex(-1)).toThrow(new Error('Invalid index.'));
      });

      it('should throw an error when setting to a too high index', () => {
        expect(() => root.children[0].setIndex(root.children.length)).toThrow(new Error('Invalid index.'));
      });
    });

    describe('getPath()', () => {
      let root: Node<NodeType>;

      beforeEach(() => {
        root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      it('should get an array with the root node if called on the root node', () => {
        const pathToRoot = root.getPath();
        expect(pathToRoot.length).toEqual(1);
        expect(pathToRoot[0].model.id).toEqual(1);
      });

      it('should get an array of nodes from the root to the node (included)', () => {
        const pathToNode121 = root.first(idEq(121))!.getPath();

        expect(pathToNode121.length).toEqual(3);
        expect(pathToNode121[0].model.id).toEqual(1);
        expect(pathToNode121[1].model.id).toEqual(12);
        expect(pathToNode121[2].model.id).toEqual(121);
      });
    });

    describe('traversal', () => {
      let root: Node<NodeType>, mock121: Function, mock12: Function;

      const callback121 = (node: Node<NodeType>) => {
        if (node.model.id === 121) {
          return false;
        }
      };

      const callback12 = (node: Node<NodeType>) => {
        if (node.model.id === 12) {
          return false;
        }
      };

      beforeEach(() => {
        root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });

        mock121 = jest.fn(callback121);
        mock12 = jest.fn(callback12);
      });

      describe('walk depthFirstPreOrder by default', () => {
        it('should traverse the nodes until the callback returns false', () => {
          root.walk(mock121);
          expect(mock121).toHaveBeenCalledTimes(5);
          expect(mock121).toHaveBeenNthCalledWith(1, root.first(idEq(1)));
          expect(mock121).toHaveBeenNthCalledWith(2, root.first(idEq(11)));
          expect(mock121).toHaveBeenNthCalledWith(3, root.first(idEq(111)));
          expect(mock121).toHaveBeenNthCalledWith(4, root.first(idEq(12)));
          expect(mock121).toHaveBeenNthCalledWith(5, root.first(idEq(121)));
        });
      });

      describe('walk depthFirstPostOrder', () => {
        it('should traverse the nodes until the callback returns false', () => {
          root.walk(mock121, { strategy: 'post' });
          expect(mock121).toHaveBeenCalledTimes(3);
          expect(mock121).toHaveBeenNthCalledWith(1, root.first(idEq(111)));
          expect(mock121).toHaveBeenNthCalledWith(2, root.first(idEq(11)));
          expect(mock121).toHaveBeenNthCalledWith(3, root.first(idEq(121)));
        });
      });

      describe('walk depthFirstPostOrder (2)', () => {
        it('should traverse the nodes until the callback returns false', () => {
          root.walk(mock12, { strategy: 'post' });
          expect(mock12).toHaveBeenCalledTimes(5);
          expect(mock12).toHaveBeenNthCalledWith(1, root.first(idEq(111)));
          expect(mock12).toHaveBeenNthCalledWith(2, root.first(idEq(11)));
          expect(mock12).toHaveBeenNthCalledWith(3, root.first(idEq(121)));
          expect(mock12).toHaveBeenNthCalledWith(4, root.first(idEq(122)));
          expect(mock12).toHaveBeenNthCalledWith(5, root.first(idEq(12)));
        });
      });

      describe('walk breadthFirst', () => {
        it('should traverse the nodes until the callback returns false', () => {
          root.walk(mock121, { strategy: 'breadth' });
          expect(mock121).toHaveBeenCalledTimes(5);
          expect(mock121).toHaveBeenNthCalledWith(1, root.first(idEq(1)));
          expect(mock121).toHaveBeenNthCalledWith(2, root.first(idEq(11)));
          expect(mock121).toHaveBeenNthCalledWith(3, root.first(idEq(12)));
          expect(mock121).toHaveBeenNthCalledWith(4, root.first(idEq(111)));
          expect(mock121).toHaveBeenNthCalledWith(5, root.first(idEq(121)));
        });
      });
    });

    describe('all()', () => {
      let root: Node<NodeType>;

      beforeEach(() => {
        root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      it('should get an empty array if no nodes match the predicate', () => {
        const idLt0 = root.all(node => node.model.id < 0);

        expect(idLt0.length).toEqual(0);
      });

      it('should get all nodes if no predicate is given', () => {
        const allNodes = root.all();

        expect(allNodes.length).toEqual(6);
      });

      it('should get an array with the node itself if only the node matches the predicate', () => {
        const idEq1 = root.all(idEq(1));

        expect(idEq1.length).toEqual(1);
        expect(idEq1[0]).toEqual(root);
      });

      it('should get an array with all nodes that match a given predicate', () => {
        const idGt100 = root.all(node => node.model.id > 100);

        expect(idGt100.length).toEqual(3);
        expect(idGt100[0].model.id).toEqual(111);
        expect(idGt100[1].model.id).toEqual(121);
        expect(idGt100[2].model.id).toEqual(122);
      });

      it('should get an array with all nodes that match a given predicate (2)', () => {
        const idGt10AndChildOfRoot = root.all(node => node.model.id > 10 && node.parent === root);

        expect(idGt10AndChildOfRoot.length).toEqual(2);
        expect(idGt10AndChildOfRoot[0].model.id).toEqual(11);
        expect(idGt10AndChildOfRoot[1].model.id).toEqual(12);
      });

      it('should get an array including all nodes with a different strategy', () => {
        const nodes = root.all({ strategy: 'post' });

        expect(nodes.length).toEqual(6);
        expect(nodes[0].model.id).toEqual(111);
        expect(nodes[1].model.id).toEqual(11);
        expect(nodes[2].model.id).toEqual(121);
        expect(nodes[3].model.id).toEqual(122);
        expect(nodes[4].model.id).toEqual(12);
        expect(nodes[5].model.id).toEqual(1);
      });

      it('should get an array including all nodes with a different strategy (2)', () => {
        const nodes = root.all({ strategy: 'breadth' });

        expect(nodes.length).toEqual(6);
        expect(nodes[0].model.id).toEqual(1);
        expect(nodes[1].model.id).toEqual(11);
        expect(nodes[2].model.id).toEqual(12);
        expect(nodes[3].model.id).toEqual(111);
        expect(nodes[4].model.id).toEqual(121);
        expect(nodes[5].model.id).toEqual(122);
      });
    });

    describe('first()', () => {
      let root: Node<NodeType>;

      beforeEach(() => {
        root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{id: 121}, {id: 122}]
            }
          ]
        });
      });

      it('should get the first node when the predicate returns true', () => {
        const first = root.first(() => true);

        expect(first?.model.id).toEqual(1);
      });

      it('should get the first node when no predicate is given', () => {
        const first = root.first();

        expect(first?.model.id).toEqual(1);
      });

      it('should get the first node with a different strategy when the predicate returns true', () => {
        const first = root.first(() => true, { strategy: 'post' });

        expect(first?.model.id).toEqual(111);
      });

      it('should get the first node with a different strategy when no predicate is given', () => {
        const first = root.first({ strategy: 'post' });

        expect(first?.model.id).toEqual(111);
      });

      it('should get the first node with a different strategy when no predicate is given (2)', () => {
        const first = root.first({ strategy: 'breadth' });

        expect(first?.model.id).toEqual(1);
      });
    });

    describe('drop()', function () {
      let root: Node<NodeType>;

      beforeEach(function () {
        root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      it('should give back the dropped node, even if it is the root', () => {
        expect(root.drop()).toEqual(root);
      });

      it('should give back the dropped node, which no longer be found in the original root', () => {
        expect(root.first(idEq(11))?.drop().model).toEqual({ id: 11, children: [{ id: 111 }]});
        expect(root.first(idEq(11))).toBeUndefined();
        expect(root.first(idEq(111))).toBeUndefined();
      });
    });

    describe('hasChildren()', () => {
      let root: Node<NodeType>;

      beforeEach(() => {
        root = treeData.parse({
          id: 1,
          children: [
            {
              id: 11,
              children: [{ id: 111 }]
            },
            {
              id: 12,
              children: [{ id: 121 }, { id: 122 }]
            }
          ]
        });
      });

      it('should return true for node with children', () => {
        expect(root.hasChildren()).toBe(true)
      });

      it('should return false for node without children', () => {
        expect(root.first(idEq(111))?.hasChildren()).toBe(false);
      });
    });
  });
});
