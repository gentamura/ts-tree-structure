/**
 * The merge part of the merge sort algorithm.
 */
function merge<T>(comparatorFn: Function, arr1: T[], arr2: T[]): T[] {
  const result: T[] = [];
  let left1 = arr1.length, left2 = arr2.length;

  while (left1 > 0 && left2 > 0) {
    if (comparatorFn(arr1[0], arr2[0]) <= 0) {
      const firtsArr1 = arr1.shift();
      if (firtsArr1) {
        result.push(firtsArr1);
      }
      left1--;
    } else {
      const firstArr2 = arr2.shift();
      if (firstArr2) {
        result.push(firstArr2);
      }
      left2--;
    }
  }

  if (left1 > 0) {
    result.push.apply(result, arr1);
  } else {
    result.push.apply(result, arr2);
  }

  return result;
}

/**
 * Sort an array using the merge sort algorithm.
 */
function mergeSort<T>(comparatorFn: Function, arr: T[]): T[] {
  const len = arr.length;

  if (len >= 2) {
    const firstHalf = arr.slice(0, len / 2);
    const secondHalf = arr.slice(len / 2, len);

    return merge(
      comparatorFn,
      mergeSort(comparatorFn, firstHalf),
      mergeSort(comparatorFn, secondHalf),
    );
  } else {
    return arr.slice();
  }
}

export default mergeSort;