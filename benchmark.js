const { performance } = require('perf_hooks');

function bubbleSort(input) {
  const arr = input.slice();
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}

function selectionSort(input) {
  const arr = input.slice();
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}

function insertionSort(input) {
  const arr = input.slice();
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function mergeSort(input) {
  if (input.length <= 1) return input.slice();
  const mid = Math.floor(input.length / 2);
  const left = mergeSort(input.slice(0, mid));
  const right = mergeSort(input.slice(mid));
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }
  while (i < left.length) merged.push(left[i++]);
  while (j < right.length) merged.push(right[j++]);
  return merged;
}

function quickSort(input) {
  const arr = input.slice();

  function sort(lo, hi) {
    if (lo >= hi) return;
    const pivot = arr[Math.floor((lo + hi) / 2)];
    let i = lo;
    let j = hi;
    while (i <= j) {
      while (arr[i] < pivot) i++;
      while (arr[j] > pivot) j--;
      if (i <= j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
        j--;
      }
    }
    if (lo < j) sort(lo, j);
    if (i < hi) sort(i, hi);
  }

  sort(0, arr.length - 1);
  return arr;
}

function cocktailSort(input) {
  const arr = input.slice();
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }

    if (!swapped) break;

    swapped = false;
    end--;

    for (let i = end; i > start; i--) {
      if (arr[i - 1] > arr[i]) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
        swapped = true;
      }
    }
    start++;
  }

  return arr;
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i - 1] > arr[i]) return false;
  }
  return true;
}

function makeRng(seed) {
  let x = seed >>> 0;
  return function rng() {
    x = (1664525 * x + 1013904223) >>> 0;
    return x / 0x100000000;
  };
}

function makeRandomArray(n, seed) {
  const rng = makeRng(seed);
  const arr = new Array(n);
  for (let i = 0; i < n; i++) {
    arr[i] = Math.floor(rng() * 100000);
  }
  return arr;
}

const algorithms = {
  Bubble: bubbleSort,
  Selection: selectionSort,
  Insertion: insertionSort,
  Merge: mergeSort,
  Cocktail: cocktailSort,
};

const sizes = [100, 500, 1000, 2000, 4000];
const trials = 15;
const warmupRuns = 3;

const results = {};
for (const name of Object.keys(algorithms)) {
  results[name] = {};
}

for (const n of sizes) {
  for (const name of Object.keys(algorithms)) {
    const samples = [];

    for (let w = 0; w < warmupRuns; w++) {
      const base = makeRandomArray(n, 20260412 + n * 31 + w * 997);
      algorithms[name](base);
    }

    for (let t = 0; t < trials; t++) {
      const base = makeRandomArray(n, 20260412 + n * 31 + t * 7);
      const t0 = performance.now();
      const sorted = algorithms[name](base);
      const t1 = performance.now();
      if (!isSorted(sorted)) {
        throw new Error(`${name} sort failed for n=${n}, trial=${t}`);
      }
      samples.push(t1 - t0);
    }

    samples.sort((a, b) => a - b);
    const median = samples[Math.floor(samples.length / 2)];
    results[name][n] = Number(median.toFixed(3));
  }
}

console.log(JSON.stringify({ sizes, trials, warmupRuns, metric: 'median(ms)', results }, null, 2));
