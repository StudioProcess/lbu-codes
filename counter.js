
/* 
  http://bit.ly/2JsmYeU 
  <span 
    class="population-clock" 
    data-start-value="7550262101" 
    data-date="2017-07-01" 
    data-per-second="2.62">
  </span>

*/

const startDate = '2017-07-01';
const startValue = 7550262101;
const perSecond = 2.62;

/* TODO: difference to reference:
  they: 7.630.729.260
  me:   7,630,710,462
*/
export function current() {
  let start = new Date(startDate);
  return startValue + (Date.now() - start.getTime()) / 1000 * perSecond;
}

export function currentFormatted(locale = 'en') {
  return current().toLocaleString(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  });
}

export function attach(selector, updatePeriod = 1000, locale = 'en') {
  const target = document.querySelector(selector);
  let int = setInterval(() => {
    target.textContent = currentFormatted(locale);
  }, updatePeriod);
}

(function main()  {
  attach('#counter');
})();
