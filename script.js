'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-10-05T23:36:17.929Z',
    '2021-10-07T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2021-09-03T16:33:06.386Z',
    '2021-10-02T14:43:26.374Z',
    '2021-09-07T18:49:59.371Z',
    '2021-10-07T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  //   const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  //instead of retruning the abover  we will use the internationalizing api 
  
  return new Intl.DateTimeFormat(locale).format(date);
};


const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date,acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 120;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;


// Expirment API

// const now3 = new Date();
// const options = {
  
//   hour: 'numeric',
//   minute: 'numeric',
//   day: 'numeric',
//   month: 'long',  // logs October
//   year: 'numeric',
//   weekday:'long'//logs monday etc
// }
// labelDate.textContent = new Intl.DateTimeFormat('en-UK',options).format(now3)
// const locale = navigator.language// this = logs ='en-UK'  so now you dont have to fine the  local manualy  and  now you can get it form the users browser

// above  is better than bellow 

// const now1 = new Date();
// const day = `${now1.getDate()}`.padStart(2,0);
// const month = `${now1.getMonth() + 1}`.padStart(2,0);
// const year = now1.getFullYear();
// const hour = now1.getHours();
// const min = now1.getMinutes();
// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;


btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // Create cuurent date and time 

    const now1 = new Date();  
    const options = {
  
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',  // logs October
  year: 'numeric',
}
labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale,options).format(now1)
//const locale = navigator.language// this = logs ='en-UK'  so now you dont have to fine the  local manualy  and  now you can get it form the users browser


 // options = pretyy much is config
 //.format() is where you p pass in the value you want to be formated = .format(date)   
// and the loacale /en-UK = is where you specify the which countrys format you want ]


// const day = `${now1.getDate()}`.padStart(2,0);
// const month = `${now1.getMonth() + 1}`.padStart(2,0);
// const year = `${now1.getFullYear()}`.padStart(2,0);;
// const hour = `${now1.getHours()}`.padStart(2,0);;
// const min = now1.getMinutes();
// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer()
    // Update UI
    updateUI(currentAccount);
  }
});


btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

///////////////////////////////////////
// Converting and Checking Numbers
console.log(23 === 23.0);

// Base 10 - 0 to 9. 1/10 = 0.1. 3/10 = 3.3333333
// Binary base 2 - 0 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log(Number('23'));
console.log(+'23'); // converts string in to intger exactly the same  as above (allot cleaner)


// Parsing
console.log(Number.parseInt('30px', 10)); // logs 30 and gets rid of "px" parse only works(does the type conversion) if it start with a number 
                                          // the parse in methods takes in another argument wher you need to state the base i.e base 10 whcih is the common one 
console.log(Number.parseInt('e23', 10)); // parseIn is for integers

console.log(Number.parseInt('  2.5rem  ')); //logs 2 you have to use th eparseFloat if you want ot display the whole decimal
console.log(Number.parseFloat('  2.5rem  '));// logs 2.5 // a go to method when trying to read a valuse from a string especialy from CSS

// console.log(parseFloat('  2.5rem  ')); // parsIn and ParsFloat are gloabl functions so you dont need to add the number before it 
                                           // however nowa days its more encourged to use the Number before it as it pprovides something called a "name space"

                                          
 // Check if value is NaN(not a number)
console.log(Number.isNaN(20)); //false
console.log(Number.isNaN('20'));//false
console.log(Number.isNaN(+'20X'));//true
console.log(Number.isNaN(23 / 0));//false however infinity also not a number thos isNaN is not good to use .Isfinite is best way to check if a value is not a number


// Checking if value is number
console.log(Number.isFinite(20));// true
console.log(Number.isFinite('20'));//false becouse '20' is not a number
console.log(Number.isFinite(+'20X'));// false = Nan
console.log(Number.isFinite(23 / 0));// flase becouse its Not a number

// checks if a number is a intger
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));

///////////////////////////////////////
// Math and Rounding
  // suareroot calculations
console.log(Math.sqrt(25)); 
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

// locates the maxium value = 23
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2)); // all these methods min/sqrt/max all do type conversion(converts string to number)
console.log(Math.max(5, 18, '23px', 11, 2));

// locates the minumum value = 2
console.log(Math.min(5, 18, 23, 11, 2));

console.log(Math.PI * Number.parseFloat('10px') ** 2); // calculate the are of a circel withe a radius of "10px"

console.log(Math.trunc(Math.random() * 6) + 1); // gives us a random number between 1-6
 
// As you know Math.trunk removes the decimal so 2.0 = 2 , 23.3 = 23

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...max
// console.log(randomInt(10, 20)); this function gives a arandom number between min and max

// Rounding integers
console.log(Math.round(23.3)); // rounds to the nearest intger = 23
console.log(Math.round(23.9));//=24

console.log(Math.ceil(23.3)); // always rounds up  = 24
console.log(Math.ceil(23.9));//=24 

console.log(Math.floor(23.3)); // always rounds down = 23
console.log(Math.floor('23.9'));//23 // also these methods also type conversoin
   // however floor and trunk cut of th edecimal types so theyre similiar in that aspect

console.log(Math.trunc(23.3));

// floor is better necouse not only does do twhat trunk does but it also rounds the negative number which makes it mor ecorrect 
  // beouse with negative number rounding works the other way round 
console.log(Math.trunc(-23.3)); // logs -23
console.log(Math.floor(-23.3)); // logs -24 

// Rounding decimals(float)
console.log((2.7).toFixed(0)); // toFixed will always return a string and not a number = '3'
console.log((2.7).toFixed(3)); //'2.700' adds 0 and till 3 decimal places
console.log((2.345).toFixed(2)); // '2.35' wants only 2 demial places so rounds up to the nearest 2 decimal places 
console.log(+(2.345).toFixed(2));//+ converted string to a number 

///////////////////////////////////////
// The Remainder Operator
console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); // 8 = 2 * 3 + 2

console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0, 2, 4, 6
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    // 0, 3, 6, 9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});


///////////////////////////////////////
// Working with BigInt
console.log(2 ** 53 - 1); // finds the largest number can be stored by javascript besouse 64 bit only uses 53 bits the remainder is used for other things
console.log(Number.MAX_SAFE_INTEGER); // this also finds the largest 
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(4838430248342043823408394839483204n); // big int was introduced with ES6 you can now ad a "n" or use Bigint and we can store longer/bigger numbers numbers 
console.log(BigInt(48384302));

// Operations ( operation wont work with 2 different types i.e 20n+20)
console.log(10000n + 10000n); // = 200000n
console.log(36286372637263726376237263726372632n * 10000000n);
// console.log(Math.sqrt(16n)); // the Math Operation is not going to work 

const huge = 20289830237283728378237n;
const num = 23;
console.log(huge * BigInt(num)); // wont work with out converting num in to a Big Int you will get error "cant mix Bigint with other types"

// Exceptions // (Most exeptions work expet "===")
console.log(20n > 15); //  works fine 
console.log(20n === 20); // will get false becouse the "===" does not do type conversion
console.log(typeof 20n); // = Big int
console.log(20n == '20'); // will get true becouse ""=="" does type conversion as 20n is  = Bigint and 20 =int

console.log(huge + ' is REALLY big!!!'); // works and does Concatonate

// Divisions
console.log(11n / 3n); // = "3n" gets rid/cuts of the other numbers after the decimal = 3.33333335
console.log(10 / 3);// = 3.3333333335


///////////////////////////////////////
// Creating Dates

// Create a date

const now = new Date(); 
console.log(now);// logs the date now

console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));

// "2020-05-08T14:11:59.604Z" the"z"means the UTC = baiscaly the time with out anytime zone in london with out day light saving


console.log(new Date(2037, 10, 19, 15, 23, 5));// logs Thu Nov 19 2037 15:23:05 GMT+0000 (Greenwich Mean Time) as you can it logs november(11) even though we put 10 as the month this is becouse the month here
                                               // in javascript is zero based so january = 0 febuarey = 1 etc  
console.log(new Date(2037, 10, 31)); // javascript also auto corrects for example we know that novemer has only 30 days so this will log 1st December

console.log(new Date(0)); // date of unix time jan 1st 1970 at midnight
console.log(new Date(3 * 24 * 60 * 60 * 1000));// this houw you conver form days to milisecond 3 days x 24hours x 60 minutes x 60 seconds x 1000 miliseconds   = 3 days later after 1st jan =  Sun Jan 04 1970 01:00:00 GMT+0100 (Greenwich Mean Time)



// Working with dates
const future = new Date(2037, 10, 19, 15, 23); // 
console.log(future); // Thu Nov 19 2037 15:23:00 GMT+0000 (Greenwich Mean Time)
console.log(future.getFullYear());// always use getFullYear and not getYear =  2037

console.log(future.getMonth());// logs = 10  beocuse months are zero base should be 11
console.log(future.getDate()); //19 which is preeety much the day "wierd name " sjhould be GetDate
console.log(future.getDay());// 4 beocuse 0 = sunday and thurday = 4 
console.log(future.getHours());//15
console.log(future.getMinutes());//23
console.log(future.getSeconds());//0
console.log(future.toISOString());// formulates the date in to a string = 2037-11-19T15:23:00.000Z = normal standard 
console.log(future.getTime());// timeStap of the date which is basiclly the milisecond which has past since 1 jan 1970 = logs = 2142256980000

console.log(new Date(2142256980000)); // if you add the milisecond(timestamp) it will log the day its asscociated to = Thu Nov 19 2037 15:23:00 GMT+0000 (Greenwich Mean Time)

console.log(Date.now());// logs  timestamp of now 1633602491026 as in today 

future.setFullYear(2040); // sets the year to another year in this case november 19th 2040
console.log(future); // logs Mon Nov 19 2040 15:23:00 GMT+0000 (Greenwich Mean Time)

// you also have setDay , setMonth etc nand  all the sets also pefrom autocorrection


///////////////////////////////////////
// Operations With Dates
const future1 = new Date(2037, 10, 19, 15, 23);// r
console.log(+future1);// once you convert this into a number itsdisplayed like a time stamp = 2142256980000

// once trasnfered in to a timestamp (ms) we can now do opertaions/calculations with like below
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24); // Mat.abs mkaes sure we dont get back a negative , and the 
                                                   //calculation after it turns the ms in a day = 10

const days1 = calcDaysPassed(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(days1); // logs 10 days


// Internationalizing Numbers (Intl)
const num5 = 3884764.23;

const options = {
  style: 'currency', 
  unit: 'celsius', /// when style is set to ' currency then the unit is cpmpletly ignored nut you have to specify the currency 
  currency: 'EUR',
  // useGrouping: false, // pirints with out the seperators = $3884764.23
};

console.log('US:      ', new Intl.NumberFormat('en-US', options).format(num5));//US:       €3,884,764.23
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num5));//Germany:  3.884.764,23 €
console.log('Syria:   ', new Intl.NumberFormat('ar-SY', options).format(num5));//Syria:    ٣٬٨٨٤٬٧٦٤٫٢٣ €
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num5)//en-US €3,884,764.23
);



///////////////////////////////////////
// Timers

// setTimeout
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);


/// setInterval fires again and again in intervals( good if you want to run a function over and over again), while setTimeout only fires once.

// setInterval
// setInterval(function () {
//   const now = new Date();
//   console.log(now);
// }, 1000);

