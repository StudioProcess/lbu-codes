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
    return Array.isArray(item) ? item.concat(arr) : [item].concat(arr);
  });
}

// Compute k-Combinations of a set of n elements WITH repetition
function combinations(n, k, offset = 0) {
  if (k === 1) {
    return seq(n, offset).map(x => [x]);
  }
  
  let out = [];
  for (let i=0; i<n; i++) {
    let seti = prependToArrays(
      i+offset,
      combinations(n-i, k-1, i+offset)
    );
    out = out.concat(seti);
  }
  return out;
}

// Compute k-Permutations of a set of n elements WITH repetition
function permutations(n, k, offset=0) { // eslint-disable-line no-unused-vars
  if (k === 1) {
    return seq(n, offset).map(x => [x]);
  }
  let out = [];
  for (let i=0; i<n; i++) {
    let seti = prependToArrays(
      i+offset,
      permutations(n, k-1, offset)
    );
    out = out.concat(seti);
  }
  return out;
}

function isReverse(perm) {
  if ( perm.length <= 1 ) return false;
  if ( perm[0] < perm[perm.length-1] ) return false;
  if ( perm[0] > perm[perm.length-1] ) return true;
  // first and last are equal, length 2 or more
  return isReverse( perm.slice(1, perm.length-1) );
}

function removeReverses(perms) { // eslint-disable-line no-unused-vars
  return perms.filter(x => !isReverse(x));
}

function maxRepetition(perm) {
  let counts = [];
  for (let x of perm) {
    let c = counts[x];
    counts[x] = !c ? 1 : c+1;
  }
  return Math.max( ...Object.values(counts) );
}

function removeRepetitions(perms, max=1) { // eslint-disable-line
  return perms.filter( x => maxRepetition(x) <= max );
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

function generateCombinationsWithRepetition(n, k) {
  return combinations(n, k);
}

function generatePermutationsNoReverse(n, k) {
  let codes = permutations(n, k);
  codes = removeReverses(codes);
  return codes;
}

function generatePermutationsNoReverseMaxRepetition(max) { // eslint-disable-line no-unused-vars
  return (n, k) => {
    let codes = generatePermutationsNoReverse(n, k);
    codes = removeRepetitions(codes, max);
    return codes;
  };
}

export class Codes {
  constructor(n, k, salt = 1, generate=generateCombinationsWithRepetition) {
    this._n = n;
    this._k = k;
    this._salt = salt;
    this._codes = generate(n, k, salt); // Generate array of codes
    this._shuffle = new Perm(this._codes.length, salt); // Set up the shuffle permutation
  }
  get n() { return this._n; }
  get k() { return this._k; }
  get salt() { return this._salt; }
  get length() { return this._codes.length; }
  
  encode(integer) {
    if (integer < 0 || integer >= this._codes.length) { return undefined; }
    let idx = this._shuffle.get(integer);
    return this._codes[idx].slice();
  }
  
  decode(...code) { // code can be supplied as array or argument list
    if ( code.length >= 1 && Array.isArray(code[0]) ) {
      code = code[0];
    }
    let cc = code.slice().sort(); // Copy and normalize code (by sorting)
    // look it up
    let integer = -1;
    this._codes.every((val, idx) => {
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
  
  info(codesNeeded=1) {
    return {
      codesTotal: this.length,
      codesNeeded,
      possibilities: Math.pow(this.n, this.k),
      chance: codesNeeded/Math.pow(this.n, this.k),
      chanceReadable: "1/" + Math.ceil(Math.pow(this.n, this.k)/codesNeeded),
      n: this.n,
      k: this.k
    };
  }
}

// Note: valid styles are `md` and `ios`
function getIconHTML(name, style='') {
  let prefix = style !== '' ? style + '-' : '';
  // return `<ion-icon name="${prefix + name}"></ion-icon>`; // SVG icons
  return `<i class="icon ion-${prefix + name}"></i>`; // Font icons
}

const icons = {
  0: 'md-heart',
  1: 'ios-moon',
  2: 'md-flower',
  3: 'ios-star',
  4: 'ios-sunny',
  5: 'md-play',
  6: 'md-cloud',
  7: 'ios-square',
  8: 'md-water',
  9: 'ios-happy',
};

function codeToHTML(code, style='') {
  let out = '';
  for (let n of code) {
    out += getIconHTML( icons[n], style ) + ' ';
  }
  return out;
}

function factorial(n) {
  if (n < 0) return undefined;
  if (n === 0) return 1;
  return n * factorial(n-1);
}

// Number of k-Combinations of a set of n items WITH repetition
function numCombinations(n, k) {
  return factorial(n+k-1) / factorial(k) / factorial(n-1);
}

// Number of k-Permutations of n items WITH repetition
function numPermutations(n, k) { // eslint-disable-line no-unused-vars
  return Math.pow(n, k);
}

// NOTE: codesTotal might not be the correct measure for calculating `chance`
export function codeLength(codesNeeded, n, maxChanceToGuess=1/1000, numFunc=numCombinations,) {
  let len = 1; // current code length
  let codesTotal = 0;
  while (codesNeeded/codesTotal > maxChanceToGuess) {
    codesTotal = numFunc(n, ++len);
  }
  let result = {
    codesNeeded,
    n,
    maxChanceToGuess,
    codesTotal,
    chance: codesNeeded/codesTotal,
    k: len
  };
  console.log(result);
  return len;
}


(function main() {
  // Skip main() function when in Node
  if (typeof process !== 'undefined' && process.title === 'node') { return; } 
  // let p = permutations(9, 7);
  // p = removeReverses(p);
  // // p = removeRepetitions(p, 6);
  // console.log(p.length, 321/p.length, "1/"+Math.ceil(p.length/321));
  // console.log(p);
  // console.log(removeRepetitions(p));
  
  // console.log( codeLength(321, 10, 1/10000, numCombinations) ); // 18
  // console.log( codeLength(321, 9, 1/10000, numPermutations) ); // 7
  
  // let codes = new Codes(9, 7, 'salt');
  // console.log(codes);
  // window.codes = codes;
  
  // let codes = new Codes(9, 6, 'salt', generatePermutationsNoReverse);
  let codes = new Codes(10, 6, 'salt', generatePermutationsNoReverseMaxRepetition(3));
  
  // Code Info
  let info = codes.info(321);
  console.log(info);
  let codeInfo = `Alphabet Size: ${info.n}<br>Code Length: ${info.k}<br>Codes: ${info.codesNeeded}<br>Chance to guess: ${info.chanceReadable}<br>Chance to guess (incl. reverse): 1/${Math.ceil(1/info.chance/2)}`;
  document.querySelector('#code_info').innerHTML = codeInfo;
  
  // Alphabet Info
  let al = '';
  al += '<tr>' + Object.keys(icons).filter(x => x<codes.n).reduce((acc, i) => {
    return acc += `<td>${i}</td>`;
  }, '') + '</tr>';
  al += '<tr>' + Object.entries(icons).filter(e => e[0]<codes.n).reduce((acc, e) => {
    return acc += `<td>${getIconHTML(e[1])}</td>`;
  }, '') + '</tr>';
  document.querySelector('#alphabet').innerHTML = al;
  
  // Code list
  const n = 321;
  let html = '<thead><tr><td>No.</td><td>Code</td><td>Icons</td></tr></thead>';
  let csv = '"Number","Code"\n', csv_rev = '"Code","Number"\n';
  for (let i=1; i<=n; i++) {
    let code = codes.encode(i);
    let icons = codeToHTML(code);
    html += `<tr><td>${i}</td><td>${code}</td><td>${icons}</td></tr>\n`;
    csv += `"${i}","${code.toString()}"\n`;
    csv_rev += `"${code.toString()}","${i}"\n`;
    code.reverse();
    csv_rev += `"${code.toString()}","${i}"\n`;
  }
  document.querySelector('#codes').innerHTML = html;
  console.log("CSV:"); console.log(csv);
  console.log("CSV (REVERSE):"); console.log(csv_rev);
})();
