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

(function main() {
  let c = combinations(3, 10);
  console.log(c);
  console.log(c.length);
})();
