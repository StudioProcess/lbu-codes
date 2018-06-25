import { Codes } from './codes.mjs';
import test from 'tape';


function testCodes(codes) {
  test('Check decoding', t => {
    t.skip();
    t.end();
  });
}


(function main() {
  let codes = new Codes(9, 4, 'salt');
  testCodes(codes);
  
  // for (let c of codes) {
  //   console.log(c.length);
  // }
})();
