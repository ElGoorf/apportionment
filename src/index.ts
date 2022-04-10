function sum(a: number[]): number {
  return a.reduce((a, n) => a + n, 0);
}

function getDivisor(populations: number[], seats: number): number {
  return sum(populations) / seats;
}

function getQuotients(populations: number[], divisor: number): number[] {
  return populations.map((pop) => pop / divisor);
}

function fillSeats(
  populations: number[],
  divisor: number,
  method: (x: number) => number
): number[] {
  const quotients = getQuotients(populations, divisor);
  return quotients.map(method);
}

function adjustDivisor(
  populations: number[],
  seats: number,
  method: (x: number) => number
): number[] {
  sanityCheck(populations, seats)
  let divisor = getDivisor(populations, seats);
  let divMax;
  let divMin;
  let filledSeats;
  let allocation;

  while (filledSeats !== seats) {
    let change = false;
    allocation = fillSeats(populations, divisor, method);
    filledSeats = sum(allocation);
    if (seats > filledSeats) {
      if (divMax !== divisor) {
        change = true;
        divMax = divisor;
      }
      if (typeof divMin !== "undefined") {
        divisor = (divisor + divMin) / 2
      } else {
        divisor = divisor / 2;
      }
    } else if (seats < filledSeats) {
      if (divMin !== divisor) {
        change = true;
        divMin = divisor;
      }
      if (typeof divMax !== "undefined") {
        divisor = (divisor + divMax) / 2
      } else {
        divisor = divisor * 2;
      }
    }
    if (!change && seats !== filledSeats) {
      throw new Error(JSON.stringify({
        divMin,
        divMax,
        low: fillSeats(populations, divMax, method),
        high: fillSeats(populations, divMin, method)
      }));
    }
  }

  return allocation;
}

function sanityCheck(populations, seats) {
  if(populations.some(isNaN) || isNaN(seats)) {
    throw new Error("Every input must be a number.");
  }
  if(seats === 0) {
    throw new Error("Cannot divide by 0 seats or other indivisibles.");
  }
}

/**
 * Returns the distribution of seats according to the Hamilton method.
 *
 * @Remarks
 * Method:
 * 1. Divides the combined population of all states by the number of seats to give a standard divisor.
 * 2. Divides each states population by the standard divisor to give each a quotient.
 * 3. Excess states are distributed in order of the highest remainder first.
 *
 *  Pros & Cons:
 * * Always satisfies Quota Rule; decimal numbers will never be rounded up or down beyond the nearest whole integer.
 * * Alabama Paradox; Changes to population, or the number of seats or states, has an inconsistent affect on the distribution of seats.
 *
 * @param {number[]} populations
 * @param {number} seats
 * @returns {number[]} seats for each state
 */
function hamilton(populations: number[], seats: number) {
  sanityCheck(populations, seats)
  const divisor = getDivisor(populations, seats);
  const quotients = getQuotients(populations, divisor);
  const allocation = quotients.map(Math.floor);
  const remainders = quotients
    .map((q, i) => ({ r: q - allocation[i], i }))
    .sort((a, b) => b.r - a.r);
  const unfilledSeats = seats - sum(allocation);

  for (let i = 0; i < unfilledSeats; i++) {
    const stateToFill = remainders[i].i;
    allocation[stateToFill] += 1;
  }

  return allocation;
}

/**
 * Returns the distribution of seats according to the Jefferson method.
 *
 * @remarks
 * Method:
 * 1. Divides the combined population of all states by the number of seats to give a standard divisor.
 * 2. Divides each states population by the standard divisor to give each a quotient.
 * 3. Rounds the quotients down.
 * 4. If there are excess seats, decrease the standard divisor and repeat from step 2.
 *
 * Pros & Cons:
 * * Favours bigger states.
 * * Violates Quota rules; Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
 * * Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the
 * distribution of seats.
 *
 * @param {number[]} populations
 * @param {number} seats
 * @returns {number[]} seats for each state
 */
function jefferson(populations: number[], seats: number) {
  return adjustDivisor(populations, seats, Math.floor);
}

/**
 * Returns the distribution of seats according to the Adams method.
 *
 * @remarks
 * Method:
 * 1. Divides the combined population of all states by the number of seats to give a standard divisor.
 * 2. Divides each states population by the standard divisor to give each a quotient.
 * 3. Rounds the quotients up.
 * 4. If there are excess seats, increase the standard divisor and repeat from step 2.
 *
 * Pros & Cons:
 * * Favours smaller states
 * * Violates Quota rules; Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
 * * Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the
 * distribution of seats.
 *
 * @param {number[]} populations
 * @param {number} seats
 * @returns {number[]} seats for each state
 */
function adams(populations: number[], seats: number) {
  return adjustDivisor(populations, seats, Math.ceil);
}

/**
 * Returns the distribution of seats according to the Webster method.
 *
 * @remarks
 * Method:
 * 1. Divides the combined population of all states by the number of seats to give a standard divisor.
 * 2. Divides each states population by the standard divisor to give each a quotient.
 * 3. Rounds the quotients up or down to the nearest whole number.
 * 4. If there is an excess or shortage of seats, increase or decrease divisor and repeat from step 2.
 *
 * Pros & Cons:
 * * Favours larger states, but with less bias than Jefferson's method.
 * * Violates Quota rules (but less frequently than Jefferson's method); Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
 * * Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the
 * distribution of seats.
 *
 * @param {number[]} populations
 * @param {number} seats
 * @returns {number[]} seats for each state
 */
function webster(populations: number[], seats: number) {
  return adjustDivisor(populations, seats, Math.round);
}

/**
 * Returns the distribution of seats according to the Huntington-Hill method.
 *
 * @remarks
 * Method:
 * 1. Divides the combined population of all states by the number of seats to give a standard divisor.
 * 2. Divides each states population by the standard divisor to give each a quotient.
 * 3. Converts each quotient to the geometric mean of its two adjacent whole numbers, and then rounds that result to it's nearest whole number.
 * 4. If there is an excess or shortage of seats, increase or decrease divisor and repeat from step 2.
 *
 * The geometric mean is the square-root of the product of two numbers (or cube-root of the product of three numbers, etc). For example, a seat with a quotient of 7.6 will be rounded up and down to 7 and 8. Sqrt(7 * 8) = 7.483...
 *
 * Pros & Cons:
 * * Favours larger states, but with less bias than Jefferson's method.
 * * Violates Quota rules (but less frequently than Jefferson's method); Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
 * * Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the
 * distribution of seats.
 *
 * @param {number[]} populations
 * @param {number} seats
 * @returns {number[]} seats for each state
 */
function huntingtonHill(populations: number[], seats: number) {
  return adjustDivisor(populations, seats, (n) =>
    Math.sqrt(Math.floor(n) * Math.ceil(n)) < n
      ? Math.floor(n) + 1
      : Math.floor(n)
  );
}

export { hamilton, jefferson, adams, webster, huntingtonHill };
