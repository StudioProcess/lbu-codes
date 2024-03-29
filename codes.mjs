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

// Get <i>-style HTML for an icon name
// Note: valid styles are `md` and `ios`
function getIconHTML(name, style='') {
  let prefix = style !== '' ? style + '-' : '';
  // return `<ion-icon name="${prefix + name}"></ion-icon>`; // SVG icons
  return `<i class="icon ion-${prefix + name}"></i>`; // Font icons
}

const digits = {
  0: ['md-heart', '0xf308'],
  1: ['ios-moon', '0xf468'],
  2: ['md-flower', '0xf2f3'],
  3: ['ios-star', '0xf4b3'],
  4: ['ios-sunny', '0xf4b7'],
  5: ['md-play', '0xf357'],
  6: ['md-cloud', '0xf2c9'],
  7: ['ios-square', '0xf21a'],
  8: ['md-water', '0xf3a7'],
  9: ['ios-happy', '0xf192'],
};

// Get plain text character for a digit
function characterForDigit(d) {
  let hex = digits[d][1];
  let cp = parseInt(hex, 16); // the 16 is not actually necessary when using hex formatted as 0xABCD
  return String.fromCodePoint(cp);
}

function getDigitHTMLCopyPaste(d) {
  return `<i class="icon">${characterForDigit(d)}</i>`; // Font icons
}

// Get <i>-style HTML for a code
function codeToHTML(code, style='') { // eslint-disable-line no-unused-vars
  let out = '';
  for (let n of code) {
    out += getIconHTML( digits[n][0], style ) + ' ';
  }
  return out;
}

// Get HTML that produces copy/pastable output
function codeToHTMLCopyPaste(code) {
  let out = '';
  for (let d of code) {
    out += getDigitHTMLCopyPaste(d);
  }
  return out;
}

// Get plain text for a code
function codeToText(code) { // eslint-disable-line no-unused-vars
  let out = '';
  for (let d of code) {
    out += characterForDigit( d );
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

function uploadCodes(data) {
  // Initialize Firebase
  if (!window.firebase.apps.length) {
    const config = {
      apiKey: "AIzaSyCdr0kpTbsED6du_p-RulO_m4L7aglFoio",
      projectId: "salt-84770",
    };
    window.firebase.initializeApp(config);
  }
  
  const db = window.firebase.firestore();
  db.settings( {timestampsInSnapshots: true} );
  const batch = db.batch();
  
  for (let key of Object.keys(data)) {
    batch.set( db.doc('codes/' + key), {number: data[key]} );
  }
  
  batch.commit().then(() => {
    console.log('Done uploading codes');
  }).catch(err => {
    console.log('Error uploading codes:', err);
  });
  // console.log(data);
}


(async function main() {
  
  const salt = await fetch('./_salt.txt').then(async res => {
    console.log(res);
    if (res.status != 200) {
      console.log('Note: No _salt.txt file. Using default salt.')
      return 'mysalt';
    }
    let text = await res.text();
    return text.trim();
  });
  
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
  
  // let codes = new Codes(9, 7, salt);
  // console.log(codes);
  // window.codes = codes;
  
  // let codes = new Codes(9, 6, salt, generatePermutationsNoReverse);
  let codes = new Codes(10, 6, salt, generatePermutationsNoReverseMaxRepetition(3));
  
  // Code Info
  let info = codes.info(321);
  console.log(info);
  let codeInfo = `Alphabet Size: ${info.n}<br>Code Length: ${info.k}<br>Codes: ${info.codesNeeded}<br>Chance to guess: ${info.chanceReadable}<br>Chance to guess (incl. reverse): 1/${Math.ceil(1/info.chance/2)}`;
  document.querySelector('#code_info').innerHTML = codeInfo;
  
  // Alphabet Info
  let al = '';
  al += '<tr>' + Object.keys(digits).filter(x => x<codes.n).reduce((acc, i) => {
    return acc += `<td>${i}</td>`;
  }, '') + '</tr>';
  al += '<tr>' + Object.keys(digits).filter(d => d<codes.n).reduce((acc, d) => {
    return acc += `<td>${codeToHTMLCopyPaste(d)}</td>`;
  }, '') + '</tr>';
  document.querySelector('#alphabet').innerHTML = al;
  
  // Code list
  const n = 321;
  let html = '<thead><tr><td>No.</td><td>Code</td><td>Icons</td></tr></thead>';
  let csv = '"Number","Code","Icons"\n', csv_rev = '"Number","Code","Icons"\n';
  let hash = {};
  let hash_flipped = {};
  let array = ['0_0_0_0_0_0'];
  for (let i=1; i<=n; i++) {
    let code = codes.encode(i);
    let code_rev = [...code];
    code_rev.reverse();
    let icons = codeToHTMLCopyPaste(code);
    let iconsText = codeToText(code);
    html += `<tr><td>${i}</td><td>${code}</td><td class="icons">${icons}</td></tr>\n`;
    csv += `"${i}","${code.toString()}","${iconsText}"\n`;
    csv_rev += `"${i}","${code_rev.toString()}","${iconsText}"\n`;
    
    hash[`${code.join('_')}`] = i;
    hash_flipped[`${code.slice().reverse().join('_')}`] = i; // add flipped code
    
    array[i] = code.join('_');
  }
  document.querySelector('#codes').innerHTML = html;
  console.log("CSV:"); console.log(csv);
  // console.log("CSV (REVERSE):"); console.log(csv_rev);
  console.log("JSON:"); console.log( JSON.stringify(array) );
  
  // // Upload to firebase (max 500 per call)
  // uploadCodes(hash);
  // uploadCodes(hash_flipped);
})();
