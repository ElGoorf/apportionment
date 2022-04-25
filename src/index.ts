/**
 * The result of a divisor method calculation. With low or rounded numbers it is plausible that no working method can be found.
 *
 *
 * If a successful result is found, the object will be nested inside an `exact` value, otherwise the closest above-and-below results will be wrapped in `low` and `high` values.
 *
 * @typedef {Object} DivisorMethodResult
 * @property {{
 *  standardDivisor: {number}; the divisor generated in step 1 of calculation (sum of all counts divided by the indivisible)
 *  exact?: {
 *   modifiedDivisor: number; the first divisor found which produced a working result
 *   quotients: number[];
 *   apportionment: number[];
 *  }
 *  low?: {
 *   modifiedDivisor: number; the closest divisor which yields the total allocation below what is available
 *   quotients: number[]; quotients if this modified divisor is used
 *   apportionment: number[]; final allocation if this modified divisor is used
 *  }
 *  high?: {
 *   modifiedDivisor: number; the closest divisor which yields the total allocation above what is available
 *   quotients: number[]; quotients if this modified divisor is used
 *   apportionment: number[]; final allocation if this modified divisor is used
 *  }
 * }}
 */

interface DivisorMethodResponseData {
  modifiedDivisor: number;
  quotients: number[];
  apportionment: number[];
}

interface DivisorMethodResultExact {
  exact: DivisorMethodResponseData;
}

interface DivisorMethodResultRough {
  low: DivisorMethodResponseData;
  high: DivisorMethodResponseData;
}

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};
type Either<T, U> = Only<T, U> | Only<U, T>;

type DivisorMethodResult = Either<
  DivisorMethodResultExact,
  DivisorMethodResultRough
> & {
  standardDivisor: number;
  preAllocation: number[];
};

type RemainderMethodResult = {
  divisor: number,
  quotients: number[],
  preAllocation: number[],
  remainders: number[],
  preAllocationSum: number,
  preAllocationLeftOver: number,
  leftOverAllocation: number[],
  apportionment: number[],
};

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
): { quotients: number[]; apportionment: number[] } {
  const quotients = getQuotients(populations, divisor);
  return {
    quotients,
    apportionment: quotients.map(method),
  };
}

function adjustDivisor(
  populations: number[],
  seats: number,
  method: (x: number) => number
): DivisorMethodResult {
  sanityCheck(populations, seats);
  const standardDivisor = getDivisor(populations, seats);
  const preAllocation = fillSeats(populations, standardDivisor, method).apportionment;
  let modifiedDivisor = standardDivisor;
  let divMax;
  let divMin;
  let filledSeats;
  let apportionment;
  let quotients;
  let allocationResultLow;
  let allocationResultHigh;

  while (filledSeats !== seats) {
    let change = false;
    let allocationResult = fillSeats(populations, modifiedDivisor, method);
    ({ quotients, apportionment } = allocationResult);
    filledSeats = sum(apportionment);
    if (seats > filledSeats) {
      if (divMax !== modifiedDivisor) {
        change = true;
        divMax = modifiedDivisor;
        allocationResultLow = allocationResult;
      }
      if (typeof divMin !== "undefined") {
        modifiedDivisor = (modifiedDivisor + divMin) / 2;
      } else {
        modifiedDivisor = modifiedDivisor / 2;
      }
    } else if (seats < filledSeats) {
      if (divMin !== modifiedDivisor) {
        change = true;
        divMin = modifiedDivisor;
        allocationResultHigh = allocationResult;
      }
      if (typeof divMax !== "undefined") {
        modifiedDivisor = (modifiedDivisor + divMax) / 2;
      } else {
        modifiedDivisor = modifiedDivisor * 2;
      }
    }
    if (!change && seats !== filledSeats) {
      return {
        standardDivisor,
        preAllocation,
        low: {
          modifiedDivisor: divMax,
          ...allocationResultLow,
        },
        high: {
          modifiedDivisor: divMin,
          ...allocationResultHigh,
        },
      };
    }
  }

  return {
    standardDivisor,
    preAllocation,
    exact: {
      modifiedDivisor,
      quotients,
      apportionment,
    },
  };
}

function sanityCheck(populations, seats) {
  if (populations.some(isNaN) || isNaN(seats)) {
    throw new Error("Every input must be a number.");
  }
  if (seats === 0) {
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
 * @returns {{
 *  divisor: number; the divisor generated in step 1 of calculation (sum of all counts divided by the indivisible)
 *  quotients: number[]; the quotients generated in step 2 of calculation (each count divided by divisor)
 *  preAllocation: number[]; guaranteed minimum number of seats in step 3 of calculation (quotients rounded down)
 *  remainders: number[];  the remainder of each quotient after being rounded down
 *  preAllocationSum: number; total sum of pre-allocations
 *  preAllocationLeftOver: number; remaining number of indivisibles after pre-allocation
 *  leftOverAllocation: number[];  how left-overs should be distributed, in order of highest-remainder
 *  apportionment: number[]; the final result
 * }}
 */
function hamilton(populations: number[], seats: number):RemainderMethodResult {
  sanityCheck(populations, seats);
  const divisor = getDivisor(populations, seats);
  const quotients = getQuotients(populations, divisor);
  const preAllocation = quotients.map(Math.floor);
  const remainders = quotients.map((q, i) => q - preAllocation[i]);
  const sortedRemainders = remainders
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r - a.r);
  const preAllocationSum = sum(preAllocation);
  const preAllocationLeftOver = seats - preAllocationSum;

  const leftOverAllocation = quotients.map(() => 0);
  const apportionment = [...preAllocation];
  for (let i = 0; i < preAllocationLeftOver; i++) {
    const i2 = sortedRemainders[i].i;
    leftOverAllocation[i2] = 1;
    apportionment[i2] += 1;
  }

  return {
    divisor,
    quotients,
    preAllocation,
    remainders,
    preAllocationSum,
    preAllocationLeftOver,
    leftOverAllocation,
    apportionment,
  };
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
 * @returns {DivisorMethodResult}
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

console.log('huh', jefferson([6000, 4000, 2000, 1000], 10))

export { hamilton, jefferson, adams, webster, huntingtonHill };
