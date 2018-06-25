import './node_modules/seedrandom/seedrandom.js';
// pick p from n, with repetition, order irrelevant

// how to generate these combinations?
// how to shuffle the assignment based on a salt

/* 
  e.g.:
  
  n = 3 [a,b,c]
  p = 3
  
  0 aaa
  1 aab
  2 aac
  3 abb
  4 abc
  5 acc
  6 bbb
  7 bbc
  8 bcc
  9 ccc
  
*/


// Create an array of sequential integers starting at an offset
function seq(length, offset = 0) {
  let out = [];
  for (let i=0; i<length; i++) {
    out.push( i+offset );
  }
  return out;
}

// Prepend an item to all arrays given and return the resulting array of arrays
function prependToArrays(item, arrays) {
  return arrays.map(arr => {
    return Array.isArray(item) ? x.concat(arr) : [item].concat(arr);
  });
}

// Compute p-combinations of a set of n elements WITH repetition
function combinations(n, p, offset = 0) {
  if (p === 1) {
    return seq(n, offset).map(x => [x]);
  }
  
  let out = [];
  for (let i=0; i<n; i++) {
    let seti = prependToArrays(
      i+offset,
      combinations(n-i, p-1, i+offset)
    );
    out = out.concat(seti);
  }
  return out;
}

// Shuffle an array (mutating)
// Use time as seed when salt is falsy
function shuffle(array, salt = '') {
  let currentIndex = array.length, temporaryValue, randomIndex;
  if (salt) {
    Math.seedrandom(salt);
  }
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// Permutation array of sequential integers with inverse
function perm(length, salt = '') {
  let forward = shuffle(seq(length), salt);
  let inverse = forward.reduce( (acc, val, idx) => {
    acc[val] = idx;
    return acc;
  }, []);
  return { forward, inverse };
}

// Construct permutation function with inverse
class Perm {
  constructor(length, salt = '') {
    this.data = perm(length, salt);
  }
  get(idx) {
    return this.data.forward[idx];
  }
  inv(idx) {
    return this.data.inverse[idx];
  }
}

// Check if all elements of two arrays test equal (===)
function arraysEqual(a1, a2) {
  if (a1.length !== a2.length) { return false; }
  return a1.every((val, idx) => {
    return val === a2[idx];
  });
}

export class Codes {
  constructor(n, p, salt = 1) {
    this._n = n;
    this._p = p;
    this._salt = salt;
    this._comb = combinations(n, p); // Generate all possible combinations
    this._shuffle = new Perm(this._comb.length, salt); // Set up the shuffle permutation
  }
  get n() { return this._n; }
  get p() { return this._p; }
  get salt() { return this._salt; }
  get length() { return this._comb.length; }
  
  encode(integer) {
    if (integer < 0 || integer >= this._comb.length) { return undefined; }
    let idx = this._shuffle.get(integer);
    return this._comb[idx].slice();
  }
  
  decode(...code) { // code can be supplied as array or argument list
    if ( code.length >= 1 && Array.isArray(code[0]) ) {
      code = code[0];
    }
    let cc = code.slice().sort(); // Copy and normalize code (by sorting)
    // look it up
    let integer = -1;
    this._comb.every((val, idx) => {
      if (arraysEqual(val, cc)) {
        integer = idx;
        return false; // stop iterating
      }
      return true; // continue iterating
    });
    if (integer < 0) { return undefined; }
    return this._shuffle.inv(integer);
  }
  
  // Support Iterable interface (Gets all possible codes)
  *[Symbol.iterator]() {
    for (let i=0; i<this.length; i++) {
      yield this.encode(i);
    }
  }
}

function getIconHTML(name, style='md') {
  let prefix = style !== '' ? style + '-' : '';
  return `<ion-icon name="${prefix + name}"></ion-icon>`;
}

const icons = {
  0: 'heart',
  1: 'square',
  2: 'play',
  3: 'sunny',
  4: 'moon',
  5: 'star',
  6: 'water',
  7: 'flower',
  8: 'cloud'
};

function codeToHTML(code, style='md') {
  let out = '';
  for (let n of code) {
    out += getIconHTML( icons[n], style );
  }
  return out;
}

function factorial(n) {
  if (n < 0) return undefined;
  if (n === 0) return 1;
  return n * factorial(n-1);
}

// Number of p-Combinations of a set of n items WITH repetition
function numCombinations(n, p) {
  return factorial(n+p-1) / factorial(p) / factorial(n-1);
}

export function codeLength(codesNeeded, n, maxChanceToGuess=1/1000) {
  let l = 1; // current code length
  let codesTotal = 0;
  while (codesNeeded/codesTotal > maxChanceToGuess) {
    codesTotal = numCombinations(n, ++l);
  }
  return l;
}


(function main() {
  // Skip main() function when in Node
  if (typeof process !== 'undefined' && process.title === 'node') { return; } 
  
  let codes = new Codes(9, 4, 'salt');
  console.log(codes);
  window.codes = codes;
  
  console.log( codeLength(321, 10, 1/1000) ); // 13
  
  const n = 321;
  let html = '<thead><tr><td>No.</td><td>Code</td><td>MD Style</td><td>iOS Style</td></tr></thead>';
  for (let i=1; i<=n; i++) {
    let code = codes.encode(i);
    let html_md = codeToHTML(code, 'md');
    let html_ios = codeToHTML(code, 'ios');
    html += `<tr><td>${i}</td><td>${code}</td><td>${html_md}</td><td>${html_ios}</td></tr>\n`;
  }
  document.querySelector('#codes').innerHTML = html;
})();
