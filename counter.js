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

// My original calculation
// export function current() {
//   let start = new Date(startDate);
//   return startValue + (Date.now() - start.getTime()) / 1000 * perSecond;
// }

// Calculation from http://bit.ly/2JsmYeU 
// The display there is wrong since it seems to ever only increment by 3 (instead of 2.62)
export function current() {
  let start = new Date(startDate);
  start.setHours(0); // Removes time zone difference (in my case 2)
  let diff = Math.round((new Date() - start)/1000) + 1;
  return Math.round(diff * perSecond + startValue);
}

export function currentFormatted(locale = 'en') {
  return current().toLocaleString(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  });
}

export function attach(selector, updatePeriod = 1000, locale = 'en') {
  const target = document.querySelector(selector);
  const updateCounter = () => {
    target.textContent = currentFormatted(locale);
  };
  let int = setInterval(updateCounter, updatePeriod);
  updateCounter();
}

(function main()  {
  attach('#counter');
})();
