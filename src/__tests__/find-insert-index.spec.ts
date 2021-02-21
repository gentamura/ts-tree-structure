import findInsertIndex from '../find-insert-index';

describe('findInsertIndex', () => {
  it('should get the index to insert the element in the array according to the comparator', () => {
    type El = { id: number };

    const compareFn = (a: El, b: El) => {
      return a.id - b.id;
    };

    const arr = [
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
      { id: 8 },
      { id: 9 },
      { id: 10 },
      { id: 11 },
      { id: 12 },
      { id: 13 },
      { id: 14 },
      { id: 15 },
    ];

    expect(findInsertIndex(compareFn, [], { id: 7 })).toBe(0);
    expect(findInsertIndex(compareFn, [{ id: 7 }], { id: 7 })).toBe(1);
    expect(findInsertIndex(compareFn, arr, { id: 7 })).toBe(7);
  });
});