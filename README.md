# Apportionment

## TLDR

Installation: 

`npm install apportionment`

Example code:

```js
import {hamilton, webster} from "apportionment";

// populations of five states
const populations = [21878, 9713, 4167, 3252, 1065];

// get apportionment when 44 seats are available, using Hamilton Method
const result = hamilton(populations, 44);
console.log(result.apportionment); // => [24, 11, 5, 3, 1], how to distribute the 44 seats among the states (in same order as input)
                                   // result object does contain more data, see docs for details. 

// with same populations, get apportionment when a seat is removed
console.log(hamilton(populations, 43).apportionment); // => [24, 10, 4, 4, 1]

// try Webster Method for the same population and seats
console.log(webster(populations, 43).apportionment); // => [24, 11, 4, 3, 1]                                                      
```

[Version 1](https://www.npmjs.com/package/apportionment/v/1.0.9) has a simpler output format which contains just the result. Version 2 (this, current) has a more verbose output which includes the working-out steps, primarily to help with educational applications or debugging.

## Live demo
Side-by-side comparison of different apportionment methods. Features real-time code snippet generation.

https://apportionment.hdv.dev

## What is apportionment?

The mathematical art of fairly distributing indivisibles amongst recipients when the numbers don't divide perfectly, with many real-life applications, for example:
* Representative seats per political state
* Students per classroom
* Workers per shift
* Supplying stock to retailers
* Different types of pizza to buy for a party

There is no perfect solution which will make all recipients happy, but there are different methods (mostly created for the US voting system) which can be used to be as fair as possible in different ways.

Apportionment is most commonly discussed on the topic of US politics, hence all the examples in these docs will use that. Inputs will be with "population" counts, and "seats" being the indivisible (a single seat cannot be divided). To see how the other examples listed above can be set, please see the [live demo](https://apportionment.hdv.dev). 

### More info
Here are some good quality resources explaining the different apportionment methods. You can also check out the apportionment calculator which was built using this library, for a side-by-side comparison of different methods' results.

* Video: [Matt Parker AKA Stand-up Maths: "Why it's mathematically impossible to share fair"](https://www.youtube.com/watch?v=GVhFBujPlVo)
* Video Playlist: [Mathispower4u: Apportionment](https://www.youtube.com/watch?v=w_0XwyXgJvk&list=PLROOIV7hGpZhAz0LNyZVUOXtlVA3QioGA)
* Reading: [Census.gov](https://www.census.gov/history/www/reference/apportionment/methods_of_apportionment.html)
* Reading: [Mathematical Association of America](https://www.maa.org/press/periodicals/convergence/apportioning-representatives-in-the-united-states-congress-introduction)
* Reading: [LibreTexts: Maths in Society](https://math.libretexts.org/Bookshelves/Applied_Mathematics/Math_in_Society_(Lippman)/04%3A_Apportionment)

All these links are external and not managed by this author. If a link is broken please submit a PR to fix it.

## How to use
There are two categories of apportionment method covered in this library. Note they all have the same input parameters, but the output object will be different depending on the category.

|              | Largest-Remainder Methods                                                            | Divisor Methods                                                                                  |
| ------------ | :----------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| \----------- | \----------------------------------------------------------------------------------- | \----------------------------------------------------------------------------------------------- |
| **Pros**     | Guaranteed to always give a conclusive result                                        | Immune from "Alabama", "New States", and "Population" Paradoxes                                  |
|              | Always satisfies Quota Rule (1)                                                      | Variety of methods allows for different biases                                                   |
| \----------- | \----------------------------------------------------------------------------------- | \----------------------------------------------------------------------------------------------- |
| **Cons**     | Susceptible to "Population", "Alabama", and "New States" Paradoxes (2)               | Might fail to give a conclusive result for rounded or small numbers                              |
|              | Limited (no) ability to adjust bias                                                  | Doesn't always satisfy Quota Rule                                                                |
| \----------- | \----------------------------------------------------------------------------------- | \----------------------------------------------------------------------------------------------- |
| **Best for** | When working with rounded small numbers and absolutely must have a conclusive result | Working with data that changes over time (change in results are proportional to change of input) |

1. **[Quota Rule](https://en.wikipedia.org/wiki/Quota_rule)** means the quotient can only be rounded to nearest adjacent number; eg. 4.7 can only be rounded down to 4 or up to 5. With the Hamilton Method, rounding may exceed these bounds, 4.7 might round up to 6 for example. 
2. **["Population", "Alabama", and "New States" Paradoxes](https://en.wikipedia.org/wiki/Apportionment_paradox)**, are examples of changes to population, or the number of seats or states, having an inconsistent affect on the distribution of seats.

Note that no method can satisfy the quota rule while being immune to the paradoxes mentioned, according to the [Balinski-Young Impossibility Theorem](https://en.wikipedia.org/wiki/Apportionment_paradox#Balinski%E2%80%93Young_theorem).

**Overall I recommend using Divisor Methods**, especially if your input data changes over time, as the immunity to the Alabama Paradox and others means that the changes to the inputs will yield consistent and therefore perceptively fair changes to the result. 
If the majority of your data is rounded to 2 significant figures or fewer, the divisor methods might fail to yield a conclusive result; this is the **only case** for which I'd recommend **Largest-Remainder Methods** instead.

### Largest-Remainder Methods

#### Functions

Right now we only have one example of a Largest-Remainder Method, hence it is commonly synonymous directly with "Hamilton Method". For more detail how the function works, please see [More info] above.

| Method   | Function                                          | Bias          | Summary                                                                     |
| :------- | :------------------------------------------------ | :------------ | :-------------------------------------------------------------------------- |
| Hamilton | `hamilton(counts: number[], indivisible: number)` | Larger states | Round down and distribute remaining seats to states with highest remainders |

#### Output

All functions in this category will output a flat object:

```typescript
{
    divisor:               number,   // The standard divisor
    quotients:             number[], // Quotients for each count given
    preAllocation:         number[], // Minimum guaranteed seats
    remainders:            number[], // Remainders after pre-allocation is subtraced from quotients
    preAllocationSum:      number,   // Total number of pre-allocated seats
    preAllocationLeftOver: number,   // Total number of seats remaining after pre-allocation
    leftOverAllocation:    number[], // Allocation of remaining seats
    apportionment:         number[], // Final result of allocation
}
```

#### Example
```js
import {hamilton} from "apportionment"

const numSeats = 20;                             // 20 seats to apportion
const populations = [2560, 3315, 995, 5012];     // populations of 4 states
const result = hamilton(populations, numSeats); 
console.log(result.apportionment);               // => [4, 6, 2, 8]
                                                 // how to distribute the 20 seats according to the Hamilton Method

// If you want to see the working out (for debugging or academic purposes), you have the rest of the object available:
console.log(result);
/*
=> {
    // The result of (2560 + 3315 + 995 + 5012) / 20:
    divisor: 594.1,

    // Each of [2560, 3315, 995, 5012] divided by the divisor (594.1):
    quotients: [4.30903888234304, 5.579868708971554, 1.6748022218481737, 8.436290186837233],

    // Each of the quotients rounded down to give a guaranteed pre-allocation amount of seats:
    preAllocation: [4, 5, 1, 8],

    // What's left after rounding down:
    remainders: [0.30903888234303967, 0.5798687089715537, 0.6748022218481737, 0.4362901868372333],

    // The total number of seats pre-allocated, and the number of seats left over:
    preAllocationSum: 18,
    preAllocationLeftOver: 2,

    // How to allocate the remaining seats (distribute 1-by-1 in order of highest remainder first):
    leftOverAllocation: [0, 1, 1, 0],

    // Final apportionment:
    apportionment: [4, 6, 2, 8],
}
*/
```

### Largest-Average (aka "Divisor") Methods

#### Functions
Note that all of these functions have the same input parameters, only the name changes depending on the method you wish to use. For more details about how each function differs, please see [More info] above.

| Method          | Function                                                | Bias                                                                                 | Summary                                                         |
|---------------- |-------------------------------------------------------- | ------------------------------------------------------------------------------------ | :-------------------------------------------------------------- |
| Jefferson       | `jefferson(counts: number[], indivisible: number)`      | Larger states                                                                        | Lowers divisor while rounding quotients down                    |
| Adams           | `adams(counts: number[], indivisible: number)`          | Smaller states                                                                       | Raises divisor while rounding quotients up                      |
| Webster         | `webster(counts: number[], indivisible: number)`        | Larger states, but less severely than Jefferson, and less likely to break Quota Rule | Adjusts divisor until rounded quotients to nearest whole number |
| Huntington-Hill | `huntingtonHill(counts: number[], indivisible: number)` | Larger states, but less severely than Webster                                        | Webster with geometric mean of each quotient                    |

#### Output
Note again that each of the functions in this category will return the same object, which can have be of two shapes, depending on if a workable result was found or not.

1. A successful calculation will yield a workable result wrapped in an `exact` value, eg:

```typescript
{
    standardDivisor:     number,    // standard divisor
    preAllocation:       number,    // initial apportionment as a result of using the standard divisor
    exact: {
        modifiedDivisor: number,    // first divisor found which yields a workable result (other divisors are possible)
        quotients:       number[],  // quotients produced by the working modified divisor
        apportionment:    umber[],  // final allocation produced by using the working modified divisor
    },
}
```

2. If your input numbers are rounded to 2 significant figures or fewer, there is a strong possibility that the selected Divisor Method algorithm might not be able to produce a workable result. In this case, the function will return the above and below closest divisors wrapped in a `low` and `high` value:

```typescript
{
    standardDivisor:     number,    // standard divisor
    preAllocation:       number,    // initial apportionment as a result of using the standard divisor
    low: {
        modifiedDivisor: number,    // divisor which yields the closest possible apportionment without overshooting what is available
        quotients:       number[],  // quotients produced by the working modified divisor
        apportionment:   number[],  // final allocation produced by using the working modified divisor (the sum will be too low, ie some seats left over)
    },
    high: {
        modifiedDivisor: number,    // divisor which yields the closest possible apportionment to overshoot by the smallest amount possible
        quotients:       number[],  // quotients produced by the working modified divisor
        apportionment:   number[],  // final allocation produced by using the working modified divisor (the sum will be too high, ie uses up more seats than what are available)
    },
}
```

You may find that a set of inputs may break one method but work with another method, however it can also happen that for some inputs, none of the Divisor Methods will work at all.

#### Example

**Workable Result Found**

```typescript
import {jefferson} from "apportionment"

const numSeats = 20;                                       // 20 seats to apportion
const populations = [2560, 3315, 995, 5012];               // populations of 4 states
const result = jefferson(populations, numSeats); 
console.log(result.exact && result.exact.apportionment);   // => [4, 6, 1, 9]
                                                           // how to distribute the 20 seats according to the Jefferson Method

// If you want to see the working out (for debugging or academic purposes), you have the rest of the object available:
console.log(result);
/*
=> {
    // The result of (2560 + 3315 + 995 + 5012) / 20:
    standardDivisor: 594.1,
    
    // Allocation when using the standard divisor (4 + 5 + 1 + 8) = 18 (too low, so the divisor will be lowered until a workable answer is found)
    preAllocation: [ 4, 5, 1, 8 ],

    // "exact" means a divisor was found which gives a workable result
    exact: {
        // Using the Jefferson method, the divisor is decreased until...
        modifiedDivisor: 519.8375000000001,

        // ...the quotients are such that... 
        quotients: [4.924615865534902, 6.376992810253203, 1.9140596821121982, 9.64147449924255],

        // ...when they're rounded down, the sum matches the input number of seats, giving the final apportionment result:
        apportionment: [4, 6, 1, 9],

        // note that the modified divisor is just the first that the algorithm found, and that others will likely be available
    },
}
*/
```

**No Workable Result found**
```typescript
import {jefferson} from "apportionment"

const numSeats = 10;                                       // 10 seats to apportion
const populations = [6000, 4000, 2000, 1000];              // populations of 4 states, rounded to nearest thousand
const result = jefferson(populations, numSeats); 
console.log(result.exact && result.exact.apportionment);   // => undefined
                                                           // no working solution was found

// If you want to see the working out (for debugging or academic purposes), you have the rest of the object available:
console.log(result);
/*
=> {
    // The result of (6000 + 4000 + 2000 + 1000) / 10:
    standardDivisor: 1300,

    // Allocation when using the standard divisor (4 + 3 + 1 + 0) = 8 (too low, so the divisor will be lowered until a workable answer is found)
    preAllocation: [ 4, 3, 1, 0 ],

    // "low" means the sum of apportioned seats is lower than what is available (use this result if you're happy to have unused seats)
    low: {
        // With the divisor decreased to...
        modifiedDivisor: 1000.0000000000001,
        
        // ...the quotients are such that... 
        quotients: [
            5.999999999999999,
            3.9999999999999996,
            1.9999999999999998,
            0.9999999999999999
        ],

        // ...when they're rounded down, the sum is as close as possible without overshooting:
        apportionment: [ 5, 3, 1, 0 ] // sum = 9, meaning 1 seat is unused when divisor is 1000.0000000000001.
    },

    // "high" means the sum of apportioned seats is higher than what is available (use this result if you're happy to add some extra seats)
    high: {
        // With the divisor decreased to...
        modifiedDivisor: 1000,
        
        // ...the quotients are such that... 
        quotients: [ 6, 4, 2, 1 ],

        // ...when they're rounded down, the sum is as close as possible with minimum overshooting:
        apportionment: [ 6, 4, 2, 1 ] // sum = 13, meaning 3 seats too many when divisor is 1000.
    }

    //  We can see that the input numbers are rounded to too few significant figures, 
    // causing the quotients to all end up with similar decimals, hence they all get rounded together in 
    // either direction no matter how tiny the change in divisor.
}
*/
```

# Todos

* Lownde's method
* Hamilton with Hare vs Droop methods

## Changelog

### v2.0.0 (current, "with-workings" branch) 
Expanded output of calculation to include individual steps instead of just the result. Eg:

```js
// previous (pre-2.0.0)
const populations = [21878, 9713, 4167, 3252, 1065];
const seats = 44;

// get apportionment when 44 seats are available
const apportionment = hamilton(populations, seats);
console.log(apportionment); 
// output: [24, 11, 5, 3, 1]

// current (2.0.0)
const apportionment2 = hamilton(populations, seats);
console.log(apportionment2);
/* output: 
{
  divisor: 910.7954545454545,
  quotients: [
    24.020761072988147,
    10.66430442919526,
    4.57512164691204,
    3.5705053025577045,
    1.1693075483468498
  ],
  preAllocation: [ 24, 10, 4, 3, 1 ],
  remainders: [
    0.020761072988147333,
    0.6643044291952602,
    0.5751216469120397,
    0.5705053025577045,
    0.1693075483468498
  ],
  preAllocationSum: 42,
  preAllocationLeftOver: 2,
  leftOverAllocation: [ 0, 1, 1, 0, 0 ],
  allocation: [ 24, 11, 5, 3, 1 ]
}
*/
```

If you don't need the calculation steps for your project and prefer the simpler output, feel free to use [v1](https://www.npmjs.com/package/apportionment/v/1.0.9).
