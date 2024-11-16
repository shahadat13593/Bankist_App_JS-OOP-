'use strict';

//  ! BANKIST APP

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

// ! ------ Account class ------

class Account {
  #owner;
  #username;
  #pin;
  #movements;
  #movementsDates;
  #interestRate;
  #currency;
  #locale;
  _balance = 0;

  constructor(
    owner,
    pin,
    movements,
    interestRate,
    movementsDates,
    currency,
    locale
  ) {
    this.#owner = owner;
    this.#pin = pin;
    this.#movements = movements;
    this.#interestRate = interestRate;
    this.#movementsDates = movementsDates;
    this.#currency = currency;
    this.#locale = locale;
    this.#createUsername();
  }

  #createUsername() {
    this.#username = this.#owner
      .toLowerCase()
      .split(' ')
      .map(cur => cur[0])
      .join('');
  }
  _addDate(value) {
    this.#movementsDates.push(value);
  }
  _deposit(value) {
    this.#movements.push(value);
    return this;
  }

  _withdraw(value) {
    this.#movements.push(-value);
    return this;
  }

  get _username() {
    return this.#username;
  }
  _checkPin(inputPin) {
    return this.#pin === inputPin;
  }

  get _movements() {
    return this.#movements;
  }
  get _movementsDates() {
    return this.#movementsDates;
  }
  get _interestRate() {
    return this.#interestRate;
  }

  get _currency() {
    return this.#currency;
  }
  get _locale() {
    return this.#locale;
  }

  welcomeMessage() {
    labelWelcome.textContent = `Welcome back, ${this.#owner.split(' ')[0]}!`;
  }
}

// ! ------ App Architecture ------

class App {
  #accounts = [];
  #currentAccount;
  #transferAcc;
  sorted = false;
  _time = 300;
  #timerInterval;
  // tick;
  constructor() {
    // ! Initialize the accounts
    this.#initial();

    // ! Attaching event handlers
    btnLogin.addEventListener('click', this.#login.bind(this));
    btnTransfer.addEventListener('click', this.#transferMoney.bind(this));
    btnLoan.addEventListener('click', this.#requestLoan.bind(this));
    btnClose.addEventListener('click', this.#closeAccount.bind(this));
    btnSort.addEventListener('click', this.#sortMovements.bind(this));
  }

  static closeMessage() {
    labelWelcome.textContent = `Log in to get started`;
  }

  #handlingFloatingPointNumber(value) {
    return Intl.NumberFormat(this.#currentAccount._locale, {
      style: 'currency',
      currency: this.#currentAccount._currency,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // ! ------ Initialize two Accounts ------
  #initial() {
    // ! Account 1
    const acc1 = new Account(
      'Shahadat Hossain',
      7878,
      [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
      1.2,
      [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
      ],
      'USD',
      'en-US'
    );
    this.#accounts.push(acc1);

    // ! ------ Account 2 ------
    const acc2 = new Account(
      'Raiyan Khan',
      1359,
      [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
      1.5,
      [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
      ],
      'BDT',
      'bn'
    );

    this.#accounts.push(acc2);
  }

  // !  ------  show movements ------
  #displayMovement(acc) {
    containerMovements.innerHTML = '';

    const movs = this.sorted
      ? acc._movements.slice().sort((a, b) => b - a)
      : acc._movements;
    movs.forEach((cur, i) => {
      const type = cur > 0 ? 'deposit' : 'withdrawal';
      containerMovements.insertAdjacentHTML(
        'afterbegin',
        `
      <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
          i + 1
        } ${type}</div>
          <div class="movements__date">${this.#dateFormat(
            acc._movementsDates[i]
          )}</div>
          <div class="movements__value">${this.#handlingFloatingPointNumber(
            cur
          )}</div>
        </div>`
      );
    });
  }

  // !  ------  total balance ------
  #calcAndDisplayBalance(acc) {
    this.#currentAccount._balance = acc._movements.reduce(
      (acc, cur) => acc + cur,
      0
    );
    labelBalance.textContent = this.#handlingFloatingPointNumber(
      this.#currentAccount._balance
    );
  }

  // !  ------  summary ------

  #summary(acc) {
    const income = acc._movements.reduce(
      (acc, cur) => (cur > 0 ? acc + cur : acc),
      0
    );
    labelSumIn.textContent = this.#handlingFloatingPointNumber(income);

    const out = acc._movements.reduce(
      (acc, cur) => (cur < 0 ? acc + cur : acc),
      0
    );
    labelSumOut.textContent = this.#handlingFloatingPointNumber(out);

    const interest = acc._movements.reduce(
      (sum, cur) => (cur > 0 ? sum + (cur * acc._interestRate) / 100 : sum),
      0
    );
    labelSumInterest.textContent = this.#handlingFloatingPointNumber(interest);
  }
  // !   Update UI
  #updateUI(acc) {
    this.#displayMovement(acc);
    this.#calcAndDisplayBalance(acc);
    this.#summary(acc);
  }

  // !  ------  Login ------
  #login(e) {
    e.preventDefault();
    const userName = inputLoginUsername.value;
    const userPin = +inputLoginPin.value;
    if (!userName || !userPin) return;

    this.#currentAccount = this.#accounts.find(
      acc => acc._username === userName
    );
    if (this.#currentAccount._checkPin(userPin)) {
      // ! Clear inputs
      this.#clearInput(inputLoginUsername, inputLoginPin);
      inputLoginPin.blur();

      // ! Make UI visible
      containerApp.style.opacity = 100;
      this.#currentAccount.welcomeMessage();

      // ! Update UI
      this.#updateUI(this.#currentAccount);
      this.#currentDate();

      // ! clock
      setInterval(() => {
        this.#currentDate();
      }, 1000);

      // ! Reset timer
      if (this.#timerInterval) {
        clearInterval(this.#timerInterval);
      }

      // ! Timer
      this._time = 300;
      this.#timerInterval = this.#timer();
    }
  }

  // !  ------  Transfer Money ------

  #transferMoney(e) {
    e.preventDefault();
    const transferUser = inputTransferTo.value;
    const transferAmount = +inputTransferAmount.value;
    if (!transferUser || !transferAmount) return;
    this.#transferAcc = this.#accounts.find(
      cur => cur !== this.#currentAccount && cur._username === transferUser
    );

    if (
      transferAmount > 0 &&
      transferAmount < this.#currentAccount._balance &&
      Number.isFinite(transferAmount)
    ) {
      // ! update money
      this.#currentAccount._withdraw(transferAmount);
      this.#transferAcc._deposit(transferAmount);

      setTimeout(() => {
        // ! update date
        this.#currentAccount._addDate(new Date().toISOString());
        this.#transferAcc._addDate(new Date().toISOString());

        // ! Update UI
        this.#updateUI(this.#currentAccount);
      }, 1500);
      // ! Clear inputs
      this.#clearInput(inputTransferTo, inputTransferAmount);
      inputTransferAmount.blur();

      // ! reset the timer
      this._time = 300;
    }
  }

  // ! ------ Request Loan ------

  #requestLoan(e) {
    e.preventDefault();
    const loanAmount = +inputLoanAmount.value;
    if (
      Number.isFinite(loanAmount) &&
      loanAmount > 0 &&
      this.#currentAccount._movements.some(cur => cur > cur * 0.1)
    ) {
      // ! update money
      this.#currentAccount._deposit(loanAmount);

      setTimeout(() => {
        // ! update date
        this.#currentAccount._addDate(new Date().toISOString());

        // ! Update UI
        this.#updateUI(this.#currentAccount);
      }, 1500);
      // !Clear inputs
      this.#clearInput(inputLoanAmount);
      inputLoanAmount.blur();

      // ! reset the timer
      this._time = 300;
    }
  }

  // ! ------ Delete Account ------
  #closeAccount(e) {
    e.preventDefault();
    const closeUsername = inputCloseUsername.value;
    const closePin = +inputClosePin.value;
    if (!closeUsername || !closePin) return;
    const closeAcc = this.#accounts.find(
      cur => cur._username === closeUsername
    );

    if (closeAcc._checkPin(closePin) && closeAcc === this.#currentAccount) {
      const index = this.#accounts.findIndex(
        cur => cur._username === closeUsername
      );
      this.#accounts.splice(index, 1);

      // ! Reset the current account
      this.#currentAccount = null;

      // ! Make UI Invisible
      containerApp.style.opacity = 0;
      App.closeMessage();
      // !Clear inputs
      this.#clearInput(inputCloseUsername, inputClosePin);
      inputClosePin.blur();
    }
  }

  // ! ------ Clear inputs ------
  #clearInput(...inputs) {
    inputs.forEach(cur => (cur.value = ''));
  }

  #sortMovements() {
    this.sorted = !this.sorted;
    this.#updateUI(this.#currentAccount);
  }

  // ! ------ current date ------

  #currentDate() {
    labelDate.textContent = Intl.DateTimeFormat(this._locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());
  }
  // ! ------ current date ------
  #dateFormat(date) {
    return Intl.DateTimeFormat(this._locale, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }

  #timer() {
    this.#timerInterval = () => {
      let min = Math.floor(this._time / 60)
        .toString()
        .padStart(2, 0);
      let sec = Math.floor(this._time % 60)
        .toString()
        .padStart(2, 0);

      labelTimer.textContent = `${min}:${sec}`;

      if (this._time <= 0) {
        clearInterval(starter);
        // ! Make UI Invisible
        containerApp.style.opacity = 0;
        App.closeMessage();
      }

      this._time--;
    };
    this.#timerInterval();
    const starter = setInterval(this.#timerInterval, 1000);
    return starter;
  }
}

const app = new App();
