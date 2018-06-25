import { Codes } from './codes.mjs';
import test from 'tape';
import 'seedrandom';


// Shuffle an array (mutating)
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
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

function factorial(n) {
  if (n < 0) return undefined;
  if (n === 0) return 1;
  return n * factorial(n-1);
}

function num(n, p) {
  return factorial(n+p-1) / factorial(p) / factorial(n-1);
}


function testCodes(codes) {
  test('Number of codes', t => {
    t.equals( codes.length, num(codes.n, codes.p) );
    t.end();
  });
  
  test('Check length of codes', t => {
    for (let c of codes) {
      t.equals(c.length, codes.p);
    }
    t.end();
  });
  
  test('Check range of code points', t => {
    for (let c of codes) {
      for (let cp of c) {
        t.assert(cp >= 0 && cp < codes.n);
      }
    }
    t.end();
  });
  
  test('Check decoding (method 1)', t => {
    Array.from(codes).forEach( (c, i) => {
      t.equals( codes.decode(c), i );
    });
    t.end();
  });
  
  test('Check decoding (method 2)', t => {
    for (let i=0; i<codes.length; i++) {
      let c = codes.encode(i);
      t.equals( codes.decode(c), i );
    }
    t.end();
  });
  
  test('Check decoding (method 3, argument list instead of array)', t => {
    for (let i=0; i<codes.length; i++) {
      let c = codes.encode(i);
      t.equals( codes.decode.apply(codes, c), i );
    }
    t.end();
  });
  
  test('Check decoding with reversed code', t => {
    for (let i=0; i<codes.length; i++) {
      let c = codes.encode(i).reverse();
      t.equals( codes.decode(c), i );
    }
    t.end();
  });
  
  test('Check decoding with shuffled code', t => {
    Math.seedrandom('seed');
    for (let i=0; i<codes.length; i++) {
      let c = shuffle( codes.encode(i) );
      t.equals( codes.decode(c), i );
    }
    t.end();
  });
}


(function main() {
  let codes = new Codes(9, 4, 'salt');
  testCodes(codes);
})();
