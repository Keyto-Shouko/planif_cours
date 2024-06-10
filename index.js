const { faker } = require("@faker-js/faker");
const fs = require("fs");

// ---------------------------------------- Fake Data Weeks ----------------------------------------

const weeksData = [
  {
    week: 1,
    morning: [
      { day: "2024-01-03", course: "test" },
      { day: "2024-01-04", course: null },
      { day: "2024-01-05", course: "Swift" },
      { day: "2024-01-06", course: "" },
      { day: "2024-01-07", course: "Morning Course 2" },
    ],
    evening: [
      { day: "2024-01-03", course: "test" },
      { day: "2024-01-04", course: "test" },
      { day: "2024-01-05", course: "Swift" },
      { day: "2024-01-06", course: "" },
      { day: "2024-01-07", course: "Evening Course 1" },
    ],
  },
  /*{
    week: 2,
    morning: [
      { day: "2024-01-10", course: null },
      { day: "2024-01-11", course: "test" },
      { day: "2024-01-12", course: "Morning Course 3" },
      { day: "2024-01-13", course: "Morning Course 4" },
      { day: "2024-01-14", course: "Morning Course 5" },
    ],
    evening: [
      { day: "2024-01-10", course: null },
      { day: "2024-01-11", course: "test" },
      { day: "2024-01-12", course: "test" },
      { day: "2024-01-13", course: "test" },
      { day: "2024-01-14", course: "Evening Course 2" },
    ],
  },*/
];

// ---------------------------------------- Fake Data Courses ----------------------------------------
const coursesData = [
  {
    name: "Anglais",
    constraints: {
      fixedDay: null, // jour de la semaine ou le cours doit avoir lieu si nécessaire, de 0 à 4 -> 0 étant lundi
      semester1Volume: 10.5, // volume horaire, multiple de 3.5 obligatoirement, semestre 1
      semester2Volume: 10.5, // volume horaire, multiple de 3.5 obligatoirement, semestre 2
      fullDay: false, //journée complète ou mi-journée
      dayPart: "morning", // partie de la journée ou le cours doit avoir lieux uniquement, n'est valide que si "fullDay" est false
      sections: ["devs"], // section qui doit être présente pour ce cours, permet de savoir si un cours est multi-section ou non
      mandatoryCourse: [], // cours qui doit avoir lieu avant le début de celui-ci
      consecutiveDays: false,
      hasPriority: 0, // si le cours est une priorité, il ne peut pas être déplacé
    },
    priority: 0,
  },
  {
    name: "Swift",
    constraints: {
      fixedDay: null,
      semester1Volume: 35,
      semester2Volume: 0,
      fullDay: true,
      dayPart: null,
      sections: ["devs", "UX"],
      mandatoryCourse: ["Anglais"], // cours qui doit avoir lieu avant le début de celui-ci
      consecutiveDays: false,
      hasPriority: 0, // si le cours est une priorité, il ne peut pas être déplacé
    },
    priority: 0,
  },
  {
    name: "Unity",
    constraints: {
      fixedDay: null,
      semester1Volume: 35,
      semester2Volume: 0,
      fullDay: true,
      dayPart: null,
      sections: ["devs"],
      mandatoryCourse: [], // cours qui doit avoir lieu avant le début de celui-ci
      consecutiveDays: false,
      hasPriority: 0, // si le cours est une priorité, il ne peut pas être déplacé
    },
    priority: 0,
  },
  {
    name: "MDSU",
    constraints: {
      fixedDay: 4,
      semester1Volume: 17.5,
      semester2Volume: 17.5,
      fullDay: false,
      dayPart: null,
      sections: ["Devs", "UX", "MID", "Markets"],
      mandatoryCourse: ["Tests"], // cours qui doit avoir lieu avant le début de celui-ci
      consecutiveDays: false,
      hasPriority: 0, // si le cours est une priorité, il ne peut pas être déplacé
    },
    priority: 0,
  },
  {
    name: "Tests",
    constraints: {
      fixedDay: 1,
      semester1Volume: 35,
      semester2Volume: 0,
      fullDay: true,
      dayPart: null,
      sections: ["devs"],
      mandatoryCourse: [], // cours qui doit avoir lieu avant le début de celui-ci
      consecutiveDays: true,
      hasPriority: 0, // si le cours est une priorité, il ne peut pas être déplacé
    },
    priority: 0,
  },
];

// ---------------------------------------- Weight of constraints ----------------------------

const constraintsWeight = {
  fullDay: 2,
  dayPart: 5,
  sections: 4,
  mandatoryCourse: 15,
  fixedDay: 20,
  semester1Volume: 0,
  semester2Volume: 0,
  consecutiveDays: 25,
  hasPriority: 0,
};

// ---------------------------------------- Functions ----------------------------------------

function reOrderCourses(courses) {
  //copy the course array and sort it by priority so we don't modify the original array
  const sortedCourses = [...courses];
  sortedCourses.sort((a, b) => b.priority - a.priority);
  return sortedCourses;
}

function defineCoursePriority(courses, constraintsWeight) {
  //here, i should augment the priority of the current course i'm analysing
  // the more constaints it has, the higher the priority gets based on the constaintsWeight
  // the unique exception is the "mandatoryCourse", this one should augment the priority of the course referenced in the array
  // loop through the courses
  for (const course of courses) {
    let priority = 0;
    // loop through the constaints
    for (const constraint in course.constraints) {
      // augment the priority based on the weight of the constraint
      if (constraint === "mandatoryCourse") {
        // loop through the mandatory courses
        for (const mandatoryCourse of course.constraints[constraint]) {
          // find the course in the courses array
          const courseToAugment = courses.find(
            (c) => c.name === mandatoryCourse
          );
          // augment the priority of the course
          courseToAugment.priority += constraintsWeight[constraint];
          // also set the hasPriority to true so we know this course is a priority, but only if it is not set to "noPrio"
          // if it's set to noPrio it means the course has already started and is no longer a priority
          if (courseToAugment.constraints.hasPriority !== -1) {
            courseToAugment.constraints.hasPriority += 1;
          }
        }
        //then remove the mandatoryCourse constraint from the course we're analysing
        course.constraints[constraint] = [];
      } else if (constraint === "sections") {
        // since every sections is separated by a comma, we need to split the string into an array so we know how many sections we have and augment the priority based on the number of sections
        const sections = course.constraints[constraint].length;
        priority += sections * constraintsWeight[constraint];
      } else if (constraint === "fullDay") {
        // if fullDay is true, then dayPart should be null
        // also if dayPart is not null, then fullDay should be false
        if (course.constraints[constraint] === true) {
          if (course.constraints["dayPart"] !== null) {
            console.log(
              "The course ",
              course.name,
              " has a fullDay constraint and a dayPart constraint, this is not possible."
            );
          } else {
            priority += constraintsWeight[constraint];
          }
        }
      } else if (constraint === "dayPart") {
        //same thing as above
        if (course.constraints[constraint] !== null) {
          if (course.constraints["fullDay"] === true) {
            console.log(
              "The course ",
              course.name,
              " has a fullDay constraint and a dayPart constraint, this is not possible."
            );
          } else {
            priority += constraintsWeight[constraint];
          }
        }
      } else {
        // if the constaint we are checking is null or undefined, we do not raise priority
        if (
          course.constraints[constraint] !== null &&
          course.constraints[constraint] !== false
        ) {
          priority += constraintsWeight[constraint];
        }
      }
    }
    //add the priority to the current course we're analysing
    course.priority += priority;
  }
  //re-order the courses based on the new priorities
  reOrderCourses(courses);
}

function defineCourseDay(weeksData, coursesData) {
  //we first call the function to re-order the courses based on the new priorities
  reOrderCourses(coursesData);
  // Initialize the week index
  let weekIndex = 0;

  // Helper function to place a course on a specific day and part of the day
  function placeCourse(course, week, dayIndex, partOfDay) {
    if (weeksData[week][partOfDay][dayIndex].course === null) {
      weeksData[week][partOfDay][dayIndex].course = course.name;
      course.constraints.semester1Volume -= 3.5;
      if (course.constraints.semester1Volume <= 0) {
        // Remove course if its volume is 0 or less
        const courseIndex = coursesData.findIndex(
          (c) => c.name === course.name
        );
        if (courseIndex > -1) {
          coursesData.splice(courseIndex, 1);
        }
      }
    }
  }

  // Main loop to place courses based on priorities and constraints
  while (coursesData.length > 0) {
    for (let i = weekIndex; i < weeksData.length; i++) {
      const week = weeksData[i];

      // Sort courses by priority
      //coursesData.sort((a, b) => b.priority - a.priority);

      for (const course of coursesData) {
        const constraints = course.constraints;

        // Check fixedDay constraint
        if (constraints.fixedDay !== null) {
          if (constraints.fullDay) {
            placeCourse(course, i, constraints.fixedDay, "morning");
            placeCourse(course, i, constraints.fixedDay, "evening");
          } else {
            placeCourse(course, i, constraints.fixedDay, constraints.dayPart);
          }
        } else {
          // Place course on the first available day
          for (let j = 0; j < 5; j++) {
            if (constraints.fullDay) {
              if (
                week.morning[j].course === null &&
                week.evening[j].course === null
              ) {
                placeCourse(course, i, j, "morning");
                placeCourse(course, i, j, "evening");
                break;
              }
            } else {
              if (week[constraints.dayPart][j].course === null) {
                placeCourse(course, i, j, constraints.dayPart);
                break;
              }
            }
          }
        }

        // Handle consecutiveDays constraint
        if (constraints.consecutiveDays) {
          for (let j = 0; j < 4; j++) {
            if (constraints.fullDay) {
              if (
                week.morning[j].course === null &&
                week.evening[j].course === null &&
                week.morning[j + 1].course === null &&
                week.evening[j + 1].course === null
              ) {
                placeCourse(course, i, j, "morning");
                placeCourse(course, i, j, "evening");
                placeCourse(course, i, j + 1, "morning");
                placeCourse(course, i, j + 1, "evening");
                break;
              }
            } else {
              if (
                week[constraints.dayPart][j].course === null &&
                week[constraints.dayPart][j + 1].course === null
              ) {
                placeCourse(course, i, j, constraints.dayPart);
                placeCourse(course, i, j + 1, constraints.dayPart);
                break;
              }
            }
          }
        }
      }

      // Increment week index if the week is full
      if (
        week.morning.every((day) => day.course !== null) &&
        week.evening.every((day) => day.course !== null)
      ) {
        weekIndex++;
      }

      // Recalculate priorities after placing courses
      defineCoursePriority(coursesData, constraintsWeight);

      // If there are no more courses to place, break out of the loop
      if (coursesData.length === 0) {
        break;
      }
    }
  }
}

//define course priority
defineCoursePriority(coursesData, constraintsWeight);
defineCourseDay(weeksData, coursesData);
