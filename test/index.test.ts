const test = require("tape");
const {
  hamilton,
  jefferson,
  adams,
  webster,
  huntingtonHill,
} = require("../src/index");

// Used for examples from US' census.gov: https://www.census.gov/history/www/reference/apportionment/methods_of_apportionment.html
const numSeats = 20;
const populations = [2560, 3315, 995, 5012];

// Used for examples from Matt Parker's video: https://www.youtube.com/watch?v=GVhFBujPlVo
const shapes = {
  "New Triangle": 21878,
  Circula: 9713,
  Squaryland: 4167,
  Octiana: 3252,
  "Rhombus Island": 1065,
};

test("hamilton", (t) => {
  t.deepEquals(
    hamilton(Object.values(shapes), 43),
    [24, 10, 4, 4, 1],
    "Matt Parker: Hamilton-Hill Example 1"
  );
  t.deepEquals(
    hamilton(Object.values(shapes), 44),
    [24, 11, 5, 3, 1],
    "Matt Parker: Hamilton-Hill Example 2"
  );
  t.deepEquals(
    hamilton(populations, numSeats),
    [4, 6, 2, 8],
    "census.gov: Hamilton-Hill example"
  );
  t.end();
});

test("jefferson", (t) => {
  t.deepEquals(
    jefferson(Object.values(shapes), 43),
    [24, 11, 4, 3, 1],
    "Matt Parker: Jefferson Example"
  );
  t.deepEquals(
    jefferson(populations, numSeats),
    [4, 6, 1, 9],
    "census.gov: Jefferson example"
  );
  t.end();
});

test("adams", (t) => {
  t.deepEquals(
    adams(Object.values(shapes), 43),
    [22, 10, 5, 4, 2],
    "Matt Parker: Adams Example"
  );
  t.end();
});

test("webster", (t) => {
  t.deepEquals(
    webster(populations, numSeats),
    [4, 6, 2, 8],
    "census.gov: Webster Example"
  );
  t.deepEquals(
    webster([365, 491, 253, 189, 284], 44),
    [10, 14, 7, 5, 8],
    "Mathispower4u: Webster Example 1"
  );
  t.deepEquals(
    webster([145, 270, 425, 500], 15),
    [2, 3, 5, 5],
    "Mathispower4u: Webster Example 2"
  );
  t.throws(
    () => webster([10, 5, 9, 1, 3, 2, 8], 20),
    {
      message: `{"divMin":2,"divMax":2.0000000000000004,"low":[5,2,4,0,1,1,4],"high":[5,3,5,1,2,1,4]}`,
    },
    "throws closest matches when result can't be found"
  );
  t.end();
});

test("huntingtonHill", (t) => {
  t.deepEquals(
    huntingtonHill(populations, numSeats),
    [4, 6, 2, 8],
    "census.gov: Huntington-Hill Example"
  );
  t.deepEquals(
    huntingtonHill([380, 240, 105, 55], 22),
    [10, 7, 3, 2],
    "Mathispower4u: Huntington-Hill Example"
  );
  t.end();
});

test("general errors", (t) => {
  t.throws(
    () => adams(["nope", 1, 2, 3, 4, 5, 6, 7, 8, 9], 10),
    { message: "Every input must be a number." },
    "Divisor methods error if populations array has text"
  );
  t.throws(
    () => adams([undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10),
    { message: "Every input must be a number." },
    "Divisor methods error if populations array has undefined"
  );
  t.throws(
    () => adams([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], undefined),
    { message: "Every input must be a number." },
    "Divisor methods error if seats is NaN"
  );
  t.throws(
    () => adams([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0),
    { message: "Cannot divide by 0 seats or other indivisibles." },
    "Divisor methods error if seats is Zero"
  );
  t.throws(
    () => hamilton(["nope", 1, 2, 3, 4, 5, 6, 7, 8, 9], 10),
    { message: "Every input must be a number." },
    "Hamilton method errors if populations array has text"
  );
  t.throws(
    () => hamilton([undefined, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10),
    { message: "Every input must be a number." },
    "Hamilton method errors if populations array has undefined"
  );
  t.throws(
    () => hamilton([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], undefined),
    { message: "Every input must be a number." },
    "Hamilton method errors if seats is NaN"
  );
  t.throws(
    () => hamilton([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 0),
    { message: "Cannot divide by 0 seats or other indivisibles." },
    "Hamilton method errors if seats is Zero"
  );
  t.end();
});
