# Apportionment

The mathematical art of fairly distributing indivisibles amongst recipients when the numbers don't divide perfectly, with many real-life applications, for example:
* Representative seats per political state
* Students per classroom
* Workers per shift
* Supplying stock to retailers
* Slices of pizza per person

There is no perfect solution which will make all recipients happy, but there are different methods (mostly created for the US voting system) which can be used to be as fair as possible in different ways.

## Live demo
Features real-time code snippet generation; check it out!

https://apportionment.hdv.dev

## More info
* Video: [Matt Parker AKA Stand-up Maths: "Why it's mathematically impossible to share fair"](https://www.youtube.com/watch?v=GVhFBujPlVo)
* Video Playlist: [Mathispower4u: Apportionment](https://www.youtube.com/watch?v=w_0XwyXgJvk&list=PLROOIV7hGpZhAz0LNyZVUOXtlVA3QioGA)
* Reading: [Census.gov](https://www.census.gov/history/www/reference/apportionment/methods_of_apportionment.html)
* Reading: [Mathematical Association of America](https://www.maa.org/press/periodicals/convergence/apportioning-representatives-in-the-united-states-congress-introduction)
* Reading: [LibreTexts: Maths in Society](https://math.libretexts.org/Bookshelves/Applied_Mathematics/Math_in_Society_(Lippman)/04%3A_Apportionment)

# Example
Note that functions use the same params and work in the same way. Given a number of indivisibles (eg. states), an array of recipients (eg. population per state) will be mapped to a share of the indivisibles.

```js
import {hamilton, webster} from "apportionment";

// populations of five states
const populations = [21878, 9713, 4167, 3252, 1065];

// get apportionment when 44 seats are available
const apportionment = hamilton(populations, 44);
console.log(apportionment); // output: [24, 11, 5, 3, 1]

// with same populations, get apportionment when a seat is removed
const apportionment2 = hamilton(populations, 43);
console.log(apportionment2); // output: [24, 10, 4, 4, 1]

// try webster's method for the same population and seats
const apportionment3 = webster(populations, 43);
console.log(apportionment3) // output [24, 11, 4, 3, 1]
```

## Error handling
Sometimes the math works out such that a particular method can't find a workable solution with the numbers given. This is probably caused by too many input numbers sharing a high common factor with the divisor.

When this happens, an object will be thrown such as (you will need to `JSON.parse` it first):
```js
let w;
try{
    // we want to distribute 20 things
    w = webster([10, 5, 9, 1, 3, 2, 8], 20);
} catch (err) {
    const parsedErr = JSON.parse(err.message);
    console.log(parsedErr);

    /* output:
    { 
        // the closest two divisors
        divMin: 2, // will give out too many
        divMax: 2.0000000000000004, // won't give out enough

        // apportionment if divMax is used as the divisor
        low: [5,2,4,0,1,1,4], // (total 17, too low)

        // apportionment if divMin is used as the divisor
        high: [5,3,5,1,2,1,4] // (total 21, too high)
    }
    */
}

```

# Available Methods
**`hamilton(populations: number[], seats: number): number[]`**
1. Divides the combined population of all states by the number of seats to give a standard divisor.
2. Divides each states population by the standard divisor to give each a quotient.
3. Excess states are distributed in order of the highest remainder first.

Pros & Cons:
* Always satisfies Quota Rule; decimal numbers will never be rounded up or down beyond the nearest whole integer.
* Alabama Paradox; Changes to population, or the number of seats or states, has an inconsistent affect on the distribution of seats.

**`jefferson(populations: number[], seats: number): number[]`**
1. Divides the combined population of all states by the number of seats to give a standard divisor.
2. Divides each states population by the standard divisor to give each a quotient.
3. Rounds the quotients **down**.
4. If there are excess seats, **decrease** the standard divisor and repeat from step 2.

Pros & Cons:
* Favours **bigger** states.
* Violates Quota rules; Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
* Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the distribution of seats.

**`adams(populations: number[], seats: number): number[]`**
1. Divides the combined population of all states by the number of seats to give a standard divisor.
2. Divides each states population by the standard divisor to give each a quotient.
3. Rounds the quotients **up**.
4. If there are excess seats, **increase** the standard divisor and repeat from step 2.

Pros & Cons:
* Favours **smaller** states
* Violates Quota rules; Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
* Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the distribution of seats.

**`webster(populations: number[], seats: number): number[]`**
1. Divides the combined population of all states by the number of seats to give a standard divisor.
2. Divides each states population by the standard divisor to give each a quotient.
3. Rounds the quotients up or down to the nearest whole number.
4. If there is an excess or shortage of seats, increase or decrease divisor and repeat from step 2.

The geometric mean is the square-root of the product of two numbers (or cube-root of the product of three numbers, etc). For example, a seat with a quotient of 7.6 will be rounded up and down to 7 and 8. Sqrt(7 * 8) = 7.483...

Pros & Cons:
* Favours larger states, but with less bias than Jefferson's method.
* Violates Quota rules (but less frequently than Jefferson's method); Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
* Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the distribution of seats.

**`huntingtonHill(populations: number[], seats: number): number[]`**
1. Divides the combined population of all states by the number of seats to give a standard divisor.
2. Divides each states population by the standard divisor to give each a quotient.
3. Converts each quotient to the geometric mean of its two adjacent whole numbers, and then rounds that result to it's nearest whole number.
4. If there is an excess or shortage of seats, increase or decrease divisor and repeat from step 2.

The geometric mean is the square-root of the product of two numbers (or cube-root of the product of three numbers, etc). For example, a seat with a quotient of 7.6 will be rounded up and down to 7 and 8. Sqrt(7 * 8) = 7.483...

Pros & Cons:
* Favours larger states, but with less bias than Jefferson's method.
* Violates Quota rules (but less frequently than Jefferson's method); Sometimes a state's allocation of seats might be rounded up or down by 2 or more.
* Doesn't suffer Alabama Paradox; Changes to populations, or number of seats or states, has a consistent affect on the distribution of seats.

# Todos
Lownde's method
