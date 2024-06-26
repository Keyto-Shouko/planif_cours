// server.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import weeksData from "./dates.js"; // Assurez-vous que dates.js exporte weeksData

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Fake Data Courses
const coursesData = [
  // Ajoutez ici les données des cours (comme dans votre script initial)
];

const constraintsWeight = {
  fullDay: 5,
  dayPart: 2,
  sections: 0,
  mandatoryCourse: 7,
  fixedDay: 9,
  semester1Volume: 35,
  semester2Volume: 35,
  consecutiveDays: 10,
  hasPriority: 0,
};

function reOrderCourses(courses) {
  const sortedCourses = [...courses];
  sortedCourses.sort((a, b) => b.priority - a.priority);
  return sortedCourses;
}

function defineCoursePriority(
  courses,
  constraintsWeight,
  modifyPriorityFlag = false
) {
  courses.forEach((course) => (course.priority = 0));
  for (const course of courses) {
    let priority = 0;
    for (const constraint in course.constraints) {
      if (constraint === "mandatoryCourse") {
        for (const mandatoryCourse of course.constraints[constraint]) {
          const courseToAugment = courses.find(
            (c) => c.name === mandatoryCourse
          );
          courseToAugment.priority += constraintsWeight[constraint];
          if (courseToAugment.constraints.hasPriority !== -1) {
            courseToAugment.constraints.hasPriority += 1;
          }
        }
        course.constraints[constraint] = [];
      } else if (constraint === "sections") {
        const sections = course.constraints[constraint].length;
        priority += sections * constraintsWeight[constraint];
      } else if (constraint === "fullDay") {
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
        if (
          course.constraints[constraint] !== null &&
          course.constraints[constraint] !== false
        ) {
          priority += constraintsWeight[constraint];
        }
      }
    }
    course.priority += priority;
  }
  reOrderCourses(courses);
  if (modifyPriorityFlag) {
    modifyPriority(courses, constraintsWeight);
  }
}

function modifyPriority(courses, constraintsWeight) {
  for (const course of courses) {
    if (course.constraints.hasPriority > 0) {
      course.priority -=
        constraintsWeight.hasPriority * course.constraints.hasPriority;
      course.constraints.hasPriority = -1;
    }
    if (course.constraints.semester1Volume > 0) {
      const initialVolume = course.initialVolume1;
      const currentVolume = course.constraints.semester1Volume;
      const percentage = currentVolume / initialVolume;
      const weight = constraintsWeight.semester1Volume;
      course.priority -= Math.ceil(weight - weight * percentage);
    }
    if (course.constraints.semester2Volume > 0) {
      const initialVolume = course.initialVolume2;
      const currentVolume = course.constraints.semester2Volume;
      const percentage = currentVolume / initialVolume;
      const weight = constraintsWeight.semester2Volume;
      course.priority -= Math.ceil(weight - weight * percentage);
    }
  }
}

function defineCourseDay(weeksData, coursesData) {
  let reOrganizedCourses = reOrderCourses(coursesData);
  let weekIndex = 0;

  function placeCourse(course, week, dayIndex, partOfDay) {
    if (partOfDay === null || partOfDay === undefined) {
      console.log(
        "The partOfDay is null or undefined, this should not happen. Please check the data sent."
      );
      return;
    }
    if (weeksData[week][partOfDay][dayIndex].course === null) {
      weeksData[week][partOfDay][dayIndex].course = course.name;
      course.constraints.semester1Volume -= 3.5;
      if (course.constraints.semester1Volume <= 0) {
        const courseIndex = reOrganizedCourses.findIndex(
          (c) => c.name === course.name
        );
        if (courseIndex > -1) {
          reOrganizedCourses.splice(courseIndex, 1);
        }
      }
    }
  }

  while (reOrganizedCourses.length > 0 && weekIndex < weeksData.length) {
    for (let i = weekIndex; i < weeksData.length; i++) {
      const week = weeksData[i];

      for (const course of reOrganizedCourses) {
        const constraints = course.constraints;

        if (constraints.fixedDay !== null) {
          if (constraints.consecutiveDays) {
            if (constraints.fullDay) {
              if (
                week.morning[course.constraints.fixedDay].course === null &&
                week.evening[course.constraints.fixedDay].course === null &&
                week.morning[course.constraints.fixedDay + 1].course === null &&
                week.evening[course.constraints.fixedDay + 1].course === null
              ) {
                placeCourse(course, i, course.constraints.fixedDay, "morning");
                placeCourse(course, i, course.constraints.fixedDay, "evening");
                placeCourse(
                  course,
                  i,
                  course.constraints.fixedDay + 1,
                  "morning"
                );
                placeCourse(
                  course,
                  i,
                  course.constraints.fixedDay + 1,
                  "evening"
                );
              }
            } else {
              if (
                week[constraints.dayPart][course.constraints.fixedDay]
                  .course === null &&
                week[constraints.dayPart][course.constraints.fixedDay + 1]
                  .course === null
              ) {
                placeCourse(
                  course,
                  i,
                  course.constraints.fixedDay,
                  constraints.dayPart
                );
                placeCourse(
                  course,
                  i,
                  course.constraints.fixedDay + 1,
                  constraints.dayPart
                );
              }
            }
          } else if (constraints.fullDay) {
            placeCourse(course, i, constraints.fixedDay, "morning");
            placeCourse(course, i, constraints.fixedDay, "evening");
          } else {
            placeCourse(course, i, constraints.fixedDay, constraints.dayPart);
          }
        } else {
          for (let j = 0; j <= 5; j++) {
            let increasedWeekIndex = false;
            if (j === 5) {
              console.log("Couldn't place the course ", course.name);
              weekIndex++;
              increasedWeekIndex = true;
              break;
            }
            if (constraints.fullDay && constraints.consecutiveDays == false) {
              if (
                week.morning[j].course === null &&
                week.evening[j].course === null
              ) {
                placeCourse(course, i, j, "morning");
                placeCourse(course, i, j, "evening");
                if (increasedWeekIndex) {
                  weekIndex--;
                  increasedWeekIndex = false;
                }
              }
            } else if (constraints.fullDay && constraints.consecutiveDays) {
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
                if (increasedWeekIndex) {
                  weekIndex--;
                  increasedWeekIndex = false;
                }
              }
            } else {
              if (week[constraints.dayPart][j].course === null) {
                placeCourse(course, i, j, constraints.dayPart);
                if (increasedWeekIndex) {
                  weekIndex--;
                  increasedWeekIndex = false;
                }
              }
            }
          }
        }
      }
    }
  }
  return weeksData;
}

app.post("/api/planification", (req, res) => {
  const worksheet = req.body.worksheet;

  // Transform the worksheet to coursesData format if necessary

  defineCoursePriority(coursesData, constraintsWeight);
  const result = defineCourseDay(weeksData, coursesData);

  // Prepare the result as a response
  let csv = "Course Name,Days,Semester Volume Left\n";
  for (const course of coursesData) {
    let days = "";
    for (const week of result) {
      for (const day of week.morning) {
        if (day.course === course.name) {
          days += day.day + " ";
        }
      }
      for (const day of week.evening) {
        if (day.course === course.name) {
          days += day.day + " ";
        }
      }
    }
    if (days === "") {
      days = "Couldn't be placed";
    }
    csv += `${course.name},${days},${course.constraints.semester1Volume}\n`;
  }

  fs.writeFileSync("result.csv", csv);
  console.log(result);
  console.log("The result has been saved in the result.csv file.");

  res.json({ success: true, result });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
