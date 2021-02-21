/**
 * Find the index to insert an element in array keeping the sort order.
 */
function findInsertIndex<T>(compareFn: (a: T, b: T) => number, arr: T[], el: T): number {
  let i, len;

  for (i = 0, len = arr.length; i < len; i++) {
    if (compareFn(arr[i], el) > 0) {
      break;
    }
  }

  return i;
}

export default findInsertIndex;