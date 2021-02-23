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

      it('should add child at index 0 of a leaf', function () {
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
  });
});
