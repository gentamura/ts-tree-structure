import mergeSort from '../mergesort';

describe('mergeSort', () => {
  it('should stable sort the array according to the comparator', () => {
    type El = {
      id: number
      stable: number
    };

    const compareFn = (key: keyof El) => (a: El, b: El) => {
      return b[key] - a[key];
    };

    const originalArray = [
      { id: 122, stable: 1 },
      { id: 121, stable: 1 },
      { id: 121, stable: 2 },
      { id: 121, stable: 3 },
      { id: 121, stable: 4 },
      { id: 121, stable: 5 },
      { id: 121, stable: 6 },
      { id: 121, stable: 7 },
      { id: 121, stable: 8 },
      { id: 121, stable: 9 },
      { id: 121, stable: 10 },
      { id: 121, stable: 11 },
      { id: 121, stable: 12 },
      { id: 121, stable: 13 },
      { id: 121, stable: 14 },
      { id: 121, stable: 15 },
      { id: 122, stable: 2 },
    ];

    const sortedArrayById = mergeSort(compareFn('id'), originalArray);

    expect(sortedArrayById.length).toBe(17);

    expect(sortedArrayById).toEqual([
      { id: 122, stable: 1 },
      { id: 122, stable: 2 },
      { id: 121, stable: 1 },
      { id: 121, stable: 2 },
      { id: 121, stable: 3 },
      { id: 121, stable: 4 },
      { id: 121, stable: 5 },
      { id: 121, stable: 6 },
      { id: 121, stable: 7 },
      { id: 121, stable: 8 },
      { id: 121, stable: 9 },
      { id: 121, stable: 10 },
      { id: 121, stable: 11 },
      { id: 121, stable: 12 },
      { id: 121, stable: 13 },
      { id: 121, stable: 14 },
      { id: 121, stable: 15 },
    ]);

    const sortedArrayByStable = mergeSort(compareFn('stable'), originalArray);

    expect(sortedArrayByStable.length).toBe(17);

    expect(sortedArrayByStable).toEqual([
      { id: 121, stable: 15 },
      { id: 121, stable: 14 },
      { id: 121, stable: 13 },
      { id: 121, stable: 12 },
      { id: 121, stable: 11 },
      { id: 121, stable: 10 },
      { id: 121, stable: 9 },
      { id: 121, stable: 8 },
      { id: 121, stable: 7 },
      { id: 121, stable: 6 },
      { id: 121, stable: 5 },
      { id: 121, stable: 4 },
      { id: 121, stable: 3 },
      { id: 121, stable: 2 },
      { id: 122, stable: 2 },
      { id: 122, stable: 1 },
      { id: 121, stable: 1 },
    ]);
  });

  it('should return a new array even if no sorting is needed.', () => {
    const comparatorFn = (a: number, b: number) => {
      return a - b;
    };

    const arr1 = [1];
    const arr2 = [1, 2];

    expect(mergeSort(comparatorFn, arr1)).toEqual(arr1);
    expect(mergeSort(comparatorFn, arr2)).toEqual(arr2);
  });
});