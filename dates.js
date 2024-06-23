// generate me a list of 16 weeks starting from september 2023 till july 2024
// should be based on this pattern :
/*
{
    week: 1,
    morning: [
      { day: "2024-01-03", course: null },
      { day: "2024-01-04", course: null },
      { day: "2024-01-05", course: null },
      { day: "2024-01-06", course: null },
      { day: "2024-01-07", course: null },
    ],
    evening: [
      { day: "2024-01-03", course: null },
      { day: "2024-01-04", course: null },
      { day: "2024-01-05", course: null },
      { day: "2024-01-06", course: null },
      { day: "2024-01-07", course: null },
    ],
  },
*/

const weeksData = [
    {
      week: 1,
      morning: [
        { day: "2023-09-04", course: null },
        { day: "2023-09-05", course: null },
        { day: "2023-09-06", course: null },
        { day: "2023-09-07", course: null },
        { day: "2023-09-08", course: null },
      ],
      evening: [
        { day: "2023-09-04", course: null },
        { day: "2023-09-05", course: null },
        { day: "2023-09-06", course: null },
        { day: "2023-09-07", course: null },
        { day: "2023-09-08", course: null },
      ],
    },
    {
      week: 2,
      morning: [
        { day: "2023-09-18", course: null },
        { day: "2023-09-19", course: null },
        { day: "2023-09-20", course: null },
        { day: "2023-09-21", course: null },
        { day: "2023-09-22", course: null },
      ],
      evening: [
        { day: "2023-09-18", course: null },
        { day: "2023-09-19", course: null },
        { day: "2023-09-20", course: null },
        { day: "2023-09-21", course: null },
        { day: "2023-09-22", course: null },
      ],
    },
    {
      week: 3,
      morning: [
        { day: "2023-10-02", course: null },
        { day: "2023-10-03", course: null },
        { day: "2023-10-04", course: null },
        { day: "2023-10-05", course: null },
        { day: "2023-10-06", course: null },
      ],
      evening: [
        { day: "2023-10-02", course: null },
        { day: "2023-10-03", course: null },
        { day: "2023-10-04", course: null },
        { day: "2023-10-05", course: null },
        { day: "2023-10-06", course: null },
      ],
    },
    {
      week: 4,
      morning: [
        { day: "2023-10-16", course: null },
        { day: "2023-10-17", course: null },
        { day: "2023-10-18", course: null },
        { day: "2023-10-19", course: null },
        { day: "2023-10-20", course: null },
      ],
      evening: [
        { day: "2023-10-16", course: null },
        { day: "2023-10-17", course: null },
        { day: "2023-10-18", course: null },
        { day: "2023-10-19", course: null },
        { day: "2023-10-20", course: null },
      ],
    },
    {
      week: 5,
      morning: [
        { day: "2023-11-06", course: null },
        { day: "2023-11-07", course: null },
        { day: "2023-11-08", course: null },
        { day: "2023-11-09", course: null },
        { day: "2023-11-10", course: null },
      ],
      evening: [
        { day: "2023-11-06", course: null },
        { day: "2023-11-07", course: null },
        { day: "2023-11-08", course: null },
        { day: "2023-11-09", course: null },
        { day: "2023-11-10", course: null },
      ],
    },
    {
      week: 6,
      morning: [
        { day: "2023-11-20", course: null },
        { day: "2023-11-21", course: null },
        { day: "2023-11-22", course: null },
        { day: "2023-11-23", course: null },
        { day: "2023-11-24", course: null },
      ],
      evening: [
        { day: "2023-11-20", course: null },
        { day: "2023-11-21", course: null },
        { day: "2023-11-22", course: null },
        { day: "2023-11-23", course: null },
        { day: "2023-11-24", course: null },
      ],
    },
    {
      week: 7,
      morning: [
        { day: "2023-12-04", course: null },
        { day: "2023-12-05", course: null },
        { day: "2023-12-06", course: null },
        { day: "2023-12-07", course: null },
        { day: "2023-12-08", course: null },
      ],
      evening: [
        { day: "2023-12-04", course: null },
        { day: "2023-12-05", course: null },
        { day: "2023-12-06", course: null },
        { day: "2023-12-07", course: null },
        { day: "2023-12-08", course: null },
      ],
    },
    {
      week: 8,
      morning: [
        { day: "2023-12-18", course: null },
        { day: "2023-12-19", course: null },
        { day: "2023-12-20", course: null },
        { day: "2023-12-21", course: null },
        { day: "2023-12-22", course: null },
      ],
      evening: [
        { day: "2023-12-18", course: null },
        { day: "2023-12-19", course: null },
        { day: "2023-12-20", course: null },
        { day: "2023-12-21", course: null },
        { day: "2023-12-22", course: null },
      ],
    },
    {
      week: 9,
      morning: [
        { day: "2024-01-15", course: null },
        { day: "2024-01-16", course: null },
        { day: "2024-01-17", course: null },
        { day: "2024-01-18", course: null },
        { day: "2024-01-19", course: null },
      ],
      evening: [
        { day: "2024-01-15", course: null },
        { day: "2024-01-16", course: null },
        { day: "2024-01-17", course: null },
        { day: "2024-01-18", course: null },
        { day: "2024-01-19", course: null },
      ],
    },
    {
      week: 10,
      morning: [
        { day: "2024-01-29", course: null },
        { day: "2024-01-30", course: null },
        { day: "2024-01-31", course: null },
        { day: "2024-02-01", course: null },
        { day: "2024-02-02", course: null },
      ],
      evening: [
        { day: "2024-01-29", course: null },
        { day: "2024-01-30", course: null },
        { day: "2024-01-31", course: null },
        { day: "2024-02-01", course: null },
        { day: "2024-02-02", course: null },
      ],
    },
    {
      week: 11,
      morning: [
        { day: "2024-02-12", course: null },
        { day: "2024-02-13", course: null },
        { day: "2024-02-14", course: null },
        { day: "2024-02-15", course: null },
        { day: "2024-02-16", course: null },
      ],
      evening: [
        { day: "2024-02-12", course: null },
        { day: "2024-02-13", course: null },
        { day: "2024-02-14", course: null },
        { day: "2024-02-15", course: null },
        { day: "2024-02-16", course: null },
      ],
    },
    {
      week: 12,
      morning: [
        { day: "2024-03-04", course: null },
        { day: "2024-03-05", course: null },
        { day: "2024-03-06", course: null },
        { day: "2024-03-07", course: null },
        { day: "2024-03-08", course: null },
      ],
      evening: [
        { day: "2024-03-04", course: null },
        { day: "2024-03-05", course: null },
        { day: "2024-03-06", course: null },
        { day: "2024-03-07", course: null },
        { day: "2024-03-08", course: null },
      ],
    },
    {
      week: 13,
      morning: [
        { day: "2024-03-18", course: null },
        { day: "2024-03-19", course: null },
        { day: "2024-03-20", course: null },
        { day: "2024-03-21", course: null },
        { day: "2024-03-22", course: null },
      ],
      evening: [
        { day: "2024-03-18", course: null },
        { day: "2024-03-19", course: null },
        { day: "2024-03-20", course: null },
        { day: "2024-03-21", course: null },
        { day: "2024-03-22", course: null },
      ],
    },
    {
      week: 14,
      morning: [
        { day: "2024-04-08", course: null },
        { day: "2024-04-09", course: null },
        { day: "2024-04-10", course: null },
        { day: "2024-04-11", course: null },
        { day: "2024-04-12", course: null },
      ],
      evening: [
        { day: "2024-04-08", course: null },
        { day: "2024-04-09", course: null },
        { day: "2024-04-10", course: null },
        { day: "2024-04-11", course: null },
        { day: "2024-04-12", course: null },
      ],
    },
    {
      week: 15,
      morning: [
        { day: "2024-04-22", course: null },
        { day: "2024-04-23", course: null },
        { day: "2024-04-24", course: null },
        { day: "2024-04-25", course: null },
        { day: "2024-04-26", course: null },
      ],
      evening: [
        { day: "2024-04-22", course: null },
        { day: "2024-04-23", course: null },
        { day: "2024-04-24", course: null },
        { day: "2024-04-25", course: null },
        { day: "2024-04-26", course: null },
      ],
    },
    {
      week: 16,
      morning: [
        { day: "2024-05-06", course: null },
        { day: "2024-05-07", course: null },
        { day: "2024-05-08", course: null },
        { day: "2024-05-09", course: null },
        { day: "2024-05-10", course: null },
      ],
      evening: [
        { day: "2024-05-06", course: null },
        { day: "2024-05-07", course: null },
        { day: "2024-05-08", course: null },
        { day: "2024-05-09", course: null },
        { day: "2024-05-10", course: null },
      ],
    },
  ];


// export the data so i can use it in other files
export default weeksData;