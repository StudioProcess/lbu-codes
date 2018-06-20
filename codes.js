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

// Set of (0+offset ... n-1+offset)
function set(n, offset = 0) {
  let out = [];
  for (let i=0; i<n; i++) {
    out.push([i+offset]);
  }
  return out;
}

function appendSet(x, set) {
  return set.map(arr => {
    return Array.isArray(x) ? x.concat(arr) : [x].concat(arr);
  });
}

function combinations(n, p, offset = 0) {
  if (p === 1) {
    return set(n, offset);
  }
  
  let out = [];
  for (let i=0; i<n; i++) {
    let seti = appendSet(
      i+offset,
      combinations(n-i, p-1, i+offset)
    );
    out = out.concat(seti);
  }
  return out;
}

// Create an array of sequential integers starting at 0
function seq(length) {
  let out = [];
  for (let i=0; i<length; i++) {
    out.push(i);
  }
  return out;
}

// Shuffle an array (mutating)
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

// Permutation of sequential integers with inverse
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

(function main() {
  let c = combinations(3, 10);
  console.log(c);
  console.log(c.length);
  
  let p = new Perm(10, 'salt')
  console.log(p);
  console.log(p.get(0), p.inv(7));
})();
