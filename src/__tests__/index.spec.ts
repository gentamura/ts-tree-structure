import TreeData from '../index';

describe('TreeData', () => {
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
            {id: 121},
            {id: 122},
            {id: 123},
            {id: 124},
            {id: 125},
            {id: 126},
            {id: 127},
            {id: 128},
            {id: 129},
            {id: 1210},
            {id: 1211}
          ]
        });
        expect(node12).toEqual(node12.children[0].parent);
        expect(node12).toEqual(node12.children[1].parent);
      });
    });
  });
});
