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

const badNumSeats = 20;
const badPopulations = [9, 5, 9, 1, 3, 5, 8];

test("hamilton", (t) => {
  t.deepEquals(
    hamilton(Object.values(shapes), 43),
    {
      divisor: 931.9767441860465,
      quotients: [
        23.47483468496569, 10.421933873986276, 4.4711416094822205,
        3.489357454772302, 1.1427323767935123,
      ],
      preAllocation: [23, 10, 4, 3, 1],
      remainders: [
        0.47483468496568904, 0.42193387398627635, 0.4711416094822205,
        0.4893574547723021, 0.14273237679351225,
      ],
      preAllocationSum: 41,
      preAllocationLeftOver: 2,
      leftOverAllocation: [1, 0, 0, 1, 0],
      apportionment: [24, 10, 4, 4, 1],
    },
    "Matt Parker: Hamilton-Hill Example 1"
  );
  t.deepEquals(
    hamilton(Object.values(shapes), 44),
    {
      divisor: 910.7954545454545,
      quotients: [
        24.020761072988147, 10.66430442919526, 4.57512164691204,
        3.5705053025577045, 1.1693075483468498,
      ],
      preAllocation: [24, 10, 4, 3, 1],
      remainders: [
        0.020761072988147333, 0.6643044291952602, 0.5751216469120397,
        0.5705053025577045, 0.1693075483468498,
      ],
      preAllocationSum: 42,
      preAllocationLeftOver: 2,
      leftOverAllocation: [0, 1, 1, 0, 0],
      apportionment: [24, 11, 5, 3, 1],
    },
    "Matt Parker: Hamilton-Hill Example 2"
  );
  t.deepEquals(
    hamilton(populations, numSeats),
    {
      divisor: 594.1,
      quotients: [
        4.30903888234304, 5.579868708971554, 1.6748022218481737,
        8.436290186837233,
      ],
      preAllocation: [4, 5, 1, 8],
      remainders: [
        0.30903888234303967, 0.5798687089715537, 0.6748022218481737,
        0.4362901868372333,
      ],
      preAllocationSum: 18,
      preAllocationLeftOver: 2,
      leftOverAllocation: [0, 1, 1, 0],
      apportionment: [4, 6, 2, 8],
    },
    "census.gov: Hamilton-Hill example"
  );
  t.end();
});

test("jefferson", (t) => {
  t.deepEquals(
    jefferson(Object.values(shapes), 43),
    {
      standardDivisor: 931.9767441860465,
      preAllocation: [ 23, 10, 4, 3, 1 ],
      exact: {
        modifiedDivisor: 881.0092659883721,
        quotients: [
          24.832882972525688, 11.024855668349117, 4.729802694328299,
          3.6912211091806166, 1.2088408614014012,
        ],
        apportionment: [24, 11, 4, 3, 1],
      },
    },
    "Matt Parker: Jefferson Example"
  );
  t.deepEquals(
    jefferson(populations, numSeats),
    {
      standardDivisor: 594.1,
      preAllocation: [ 4, 5, 1, 8 ],
      exact: {
        modifiedDivisor: 519.8375000000001,
        quotients: [
          4.924615865534902, 6.376992810253203, 1.9140596821121982,
          9.64147449924255,
        ],
        apportionment: [4, 6, 1, 9],
      },
    },
    "census.gov: Jefferson example"
  );
  t.deepEquals(
    jefferson(badPopulations, badNumSeats),
    {
      standardDivisor: 2,
      preAllocation: [ 4, 2, 4, 0, 1, 2, 4 ],
      low: {
        modifiedDivisor: 1.666666666666667,
        quotients: [
          5.3999999999999995, 2.9999999999999996, 5.3999999999999995,
          0.5999999999999999, 1.7999999999999996, 2.9999999999999996,
          4.799999999999999,
        ],
        apportionment: [5, 2, 5, 0, 1, 2, 4],
      },
      high: {
        modifiedDivisor: 1.6666666666666667,
        quotients: [
          5.3999999999999995, 3, 5.3999999999999995, 0.6, 1.7999999999999998, 3,
          4.8,
        ],
        apportionment: [5, 3, 5, 0, 1, 3, 4],
      },
    },
    "Jefferson with no workable solution"
  );
  t.end();
});

test("adams", (t) => {
  t.deepEquals(
    adams(Object.values(shapes), 43),
    {
      standardDivisor: 931.9767441860465,
      preAllocation: [ 24, 11, 5, 4, 2 ],
      exact: {
        modifiedDivisor: 1019.3495639534885,
        quotients: [
          21.462705997682914, 9.528625256216023, 4.08790090009803,
          3.1902696729346753, 1.044783887354068,
        ],
        apportionment: [22, 10, 5, 4, 2],
      },
    },
    "Matt Parker: Adams Example"
  );
  t.deepEquals(
    adams(badPopulations, badNumSeats),
    {
      standardDivisor: 2,
      preAllocation: [ 5, 3, 5, 1, 2, 3, 4 ],
      low: {
        modifiedDivisor: 2.5,
        quotients: [3.6, 2, 3.6, 0.4, 1.2, 2, 3.2],
        apportionment: [4, 2, 4, 1, 2, 2, 4],
      },
      high: {
        modifiedDivisor: 2.4999999999999996,
        quotients: [
          3.6000000000000005, 2.0000000000000004, 3.6000000000000005,
          0.4000000000000001, 1.2000000000000002, 2.0000000000000004,
          3.2000000000000006,
        ],
        apportionment: [4, 3, 4, 1, 2, 3, 4],
      },
    },
    "Adams with no workable solution"
  );
  t.end();
});

test("webster", (t) => {
  t.deepEquals(
    webster(populations, numSeats),
    {
      standardDivisor: 594.1,
      preAllocation: [ 4, 6, 2, 8 ],
      exact: {
        modifiedDivisor: 594.1,
        quotients: [
          4.30903888234304, 5.579868708971554, 1.6748022218481737,
          8.436290186837233,
        ],
        apportionment: [4, 6, 2, 8],
      },
    },
    "census.gov: Webster Example"
  );
  t.deepEquals(
    webster([365, 491, 253, 189, 284], 44),
    {
      standardDivisor: 35.95454545454545,
      preAllocation: [ 10, 14, 7, 5, 8 ],
      exact: {
        modifiedDivisor: 35.95454545454545,
        quotients: [
          10.151706700379266, 13.65613147914033, 7.036662452591656,
          5.2566371681415935, 7.898862199747156,
        ],
        apportionment: [10, 14, 7, 5, 8],
      },
    },
    "Mathispower4u: Webster Example 1"
  );
  t.deepEquals(
    webster([145, 270, 425, 500], 15),
    {
      standardDivisor: 89.33333333333333,
      preAllocation: [ 2, 3, 5, 6 ],
      exact: {
        modifiedDivisor: 92.125,
        quotients: [
          1.5739484396200814, 2.9308005427408412, 4.613297150610584,
          5.4274084124830395,
        ],
        apportionment: [2, 3, 5, 5],
      },
    },
    "Mathispower4u: Webster Example 2"
  );
  t.deepEquals(
    webster(badPopulations, badNumSeats),
    {
      standardDivisor: 2,
      preAllocation: [ 5, 3, 5, 1, 2, 3, 4 ],
      low: {
        modifiedDivisor: 2.0000000000000004,
        quotients: [
          4.499999999999999, 2.4999999999999996, 4.499999999999999,
          0.4999999999999999, 1.4999999999999998, 2.4999999999999996,
          3.999999999999999,
        ],
        apportionment: [4, 2, 4, 0, 1, 2, 4],
      },
      high: {
        modifiedDivisor: 2,
        quotients: [4.5, 2.5, 4.5, 0.5, 1.5, 2.5, 4],
        apportionment: [5, 3, 5, 1, 2, 3, 4],
      },
    },
    "Webster with no workable solution"
  );
  t.end();
});

test("huntingtonHill", (t) => {
  t.deepEquals(
    huntingtonHill(populations, numSeats),
    {
      standardDivisor: 594.1,
      preAllocation: [ 4, 6, 2, 8 ],
      exact: {
        modifiedDivisor: 594.1,
        quotients: [
          4.30903888234304, 5.579868708971554, 1.6748022218481737,
          8.436290186837233,
        ],
        apportionment: [4, 6, 2, 8],
      },
    },
    "census.gov: Huntington-Hill Example"
  );
  t.deepEquals(
    huntingtonHill([380, 240, 105, 55], 22),
    {
      standardDivisor: 35.45454545454545,
      preAllocation: [ 11, 7, 3, 2 ],
      exact: {
        modifiedDivisor: 36.5625,
        quotients: [
          10.393162393162394, 6.564102564102564, 2.871794871794872,
          1.5042735042735043,
        ],
        apportionment: [10, 7, 3, 2],
      },
    },
    "Mathispower4u: Huntington-Hill Example"
  );
  t.deepEquals(
    huntingtonHill(badPopulations, badNumSeats),
    {
      standardDivisor: 2,
      preAllocation: [ 5, 3, 5, 1, 2, 3, 4 ],
      low: {
        modifiedDivisor: 2.041241452319315,
        quotients: [
          4.409081537009721, 2.449489742783178, 4.409081537009721,
          0.4898979485566356, 1.4696938456699067, 2.449489742783178,
          3.919183588453085,
        ],
        apportionment: [4, 2, 4, 1, 2, 2, 4],
      },
      high: {
        modifiedDivisor: 2.0412414523193148,
        quotients: [
          4.409081537009722, 2.4494897427831783, 4.409081537009722,
          0.4898979485566357, 1.4696938456699071, 2.4494897427831783,
          3.9191835884530857,
        ],
        apportionment: [4, 3, 4, 1, 2, 3, 4],
      },
    },
    "Huntington-Hill with no workable solution"
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
