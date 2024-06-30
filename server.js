// server.js

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import weeksData from "./dates.js"; // Assurez-vous que dates.js exporte weeksData
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadDir = path.join(__dirname, 'download');
const filePath = path.join(downloadDir, 'result.csv');
app.use(bodyParser.json());
app.use(cors());

// Those are the constraints weights, they will be used to augment the priority of the courses based on the constraints they have
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

/**
 * This function will re-order the courses based on the new priorities
 * @param {*} courses 
 * @returns 
 */
function reOrderCourses(courses) {
  //copy the course array and sort it by priority so we don't modify the original array
  const sortedCourses = [...courses];
  sortedCourses.sort((a, b) => b.priority - a.priority);
  return sortedCourses;
}

/**
 * Takes courses and give it a priority based on constraints and weights
 * @param {*} courses 
 * @param {*} constraintsWeight 
 * @param {*} modifyPriorityFlag 
 */
function defineCoursePriority(
  courses,
  constraintsWeight,
  modifyPriorityFlag = false
) {
  // the more constaints it has, the higher the priority gets based on the constraintsWeight
  // the unique exception is the "mandatoryCourse", this one should augment the priority of the course referenced in the array
  // loop through the courses, but before that, we need to reset the priority of all the courses to 0
  courses.forEach((course) => (course.priority = 0));

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
  //if the flag is true, call the function to modify the priority of the courses already placed (WIP, may not stay)
  if (modifyPriorityFlag) {
    modifyPriority(courses, constraintsWeight);
  }
}

/**
 * this function will serve to modify priority of courses already placed based on the hours left to place and also if the course was a prio or not
 * @param {*} courses 
 * @param {*} constraintsWeight 
 */
function modifyPriority(courses, constraintsWeight) {
  //loop through the courses
  for (const course of courses) {
    //check the courses constraints, if its hasPrioority is higer than 0, decreease its prio ny the weight x the hasPriority
    if (course.constraints.hasPriority > 0) {
      course.priority -=
        constraintsWeight.hasPriority * course.constraints.hasPriority;
      // also set it to -1 so we know this course is no longer a priority
      course.constraints.hasPriority = -1;
    }
    // check the semester volume, if it is over 0, decrase the priority by an ammount based on the difference between the initial volume and the current volume
    // the base wieght is 35, so we calculate an ammount like follow :
    // if the course had 10.5 hours initially, it means it can be placed 3 times, if it has 7 hours left, it means it can be placed 2 times
    // so it means it has been placed at 33%, thus we reduce the priority by 35 - 35 * 0.33 and we round up
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

// Helper function to place a course on a specific day and part of the day
function placeCourse(course, week, dayIndex, partOfDay, reOrganizedCourses) {
  //check the partOfDay, if it's null or undefined it means there is a problem with the data sent, so we return an error
  if (partOfDay === null || partOfDay === undefined) {
    console.log(
      "The partOfDay is null or undefined, this should not happen. Please check the data sent."
    );
    return;
  }

  if (course.constraints.semester1Volume <= 0) {
    // Remove course if its volume is 0 or less
    const courseIndex = reOrganizedCourses.findIndex(
      (c) => c.name === course.name
    );
    if (courseIndex > -1) {
      reOrganizedCourses.splice(courseIndex, 1);
    }
  } else {
    if (weeksData[week][partOfDay][dayIndex].course === null) {
      weeksData[week][partOfDay][dayIndex].course = course.name;
      course.constraints.semester1Volume -= 3.5;
    }
  }
}

/**
 * Place the courses on available weeks
 * @param {*} weeksData 
 * @param {*} coursesData 
 * @returns 
 */
function defineCourseDay(weeksData, coursesData) {
  //we first call the function to re-order the courses based on the new priorities
  let reOrganizedCourses = reOrderCourses(coursesData);
  // Initialize the week index
  let weekIndex = 0;

  

  // Main loop to place courses based on priorities and constraints
  while (reOrganizedCourses.length > 0 && weekIndex < weeksData.length) {
    for (let i = weekIndex; i < weeksData.length; i++) {
      // Get a week
      const week = weeksData[i];
      // loop through the courses
      for (const course of reOrganizedCourses) {
        // Get the course constraints
        const constraints = course.constraints;

        // Check fixedDay constraint
        if (constraints.fixedDay !== null) {
          // Handle consecutiveDays constraint
          if (constraints.consecutiveDays) {
            // Check if the consecutiveDays must be full ones
            if (constraints.fullDay) {
              // Check if the course can be placed on the fixed day and the next one
              if (
                week.morning[course.constraints.fixedDay].course === null &&
                week.evening[course.constraints.fixedDay].course === null &&
                week.morning[course.constraints.fixedDay + 1].course === null &&
                week.evening[course.constraints.fixedDay + 1].course === null
              ) {
                placeCourse(course, i, course.constraints.fixedDay, "morning", reOrganizedCourses);
                placeCourse(course, i, course.constraints.fixedDay, "evening", reOrganizedCourses);
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
              // Check if the course has consecutive days but not full days, also check if the morning/evening is available for both days
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
                  constraints.dayPart,
                  reOrganizedCourses
                );
                placeCourse(
                  course,
                  i,
                  course.constraints.fixedDay + 1,
                  constraints.dayPart,
                  reOrganizedCourses
                );
              }
            }
            // Here we don't check for consecutive days anymore, we check if the course can be placed on the fixed day
          } else if (constraints.fullDay) {
            // place the course on the whole day
            placeCourse(course, i, constraints.fixedDay, "morning", reOrganizedCourses);
            placeCourse(course, i, constraints.fixedDay, "evening", reOrganizedCourses);
          } else {
            //place the course on the fixed day and the part of the day
            placeCourse(course, i, constraints.fixedDay, constraints.dayPart, reOrganizedCourses);
          }
          // Below, we don't have a fixed day constraint
        } else {
          // Place course on the first available day, if no days were found then we increase the weekIndex by 1. Once the course is placed, we de-crease the weekIndex by 1
          for (let j = 0; j <= 5; j++) {
            let increasedWeekIndex = false;
            if (j === 5) {
              console.log("Couldn't place the course ", course.name);
              // If the course couldn't be placed, we go to the next week
              weekIndex++;
              increasedWeekIndex = true;
              break;
            }
            // Check if the course has a full day constraint and if it has no consecutive days
            if (constraints.fullDay && constraints.consecutiveDays == false) {
              if (
                week.morning[j].course === null &&
                week.evening[j].course === null
              ) {
                placeCourse(course, i, j, "morning", reOrganizedCourses);
                placeCourse(course, i, j, "evening", reOrganizedCourses);
                if (increasedWeekIndex) {
                  weekIndex--;
                  increasedWeekIndex = false;
                }
              }
              // Check if the course has a full day constraint and if it has consecutive days
            } else if (constraints.fullDay && constraints.consecutiveDays) {
              if (
                week.morning[j].course === null &&
                week.evening[j].course === null &&
                week.morning[j + 1].course === null &&
                week.evening[j + 1].course === null
              ) {
                placeCourse(course, i, j, "morning", reOrganizedCourses);
                placeCourse(course, i, j, "evening", reOrganizedCourses);
                placeCourse(course, i, j + 1, "morning", reOrganizedCourses);
                placeCourse(course, i, j + 1, "evening", reOrganizedCourses);
                if (increasedWeekIndex) {
                  weekIndex--;
                  increasedWeekIndex = false;
                }
              }
            } else {
              // Check if the course has a dayPart constraint
              if (week[constraints.dayPart][j].course === null) {
                placeCourse(course, i, j, constraints.dayPart, reOrganizedCourses);
                if (increasedWeekIndex) {
                  weekIndex--;
                  increasedWeekIndex = false;
                }
              }
            }
          }
        }

        // Recalculate priorities after placing courses
        let modifyPriorityFlag = true;
        defineCoursePriority(
          reOrganizedCourses,
          constraintsWeight,
          modifyPriorityFlag
        );
      }

      // Increment week index if the week is full
      if (
        week.morning.every((day) => day.course !== null) &&
        week.evening.every((day) => day.course !== null)
      ) {
        weekIndex++;
      }

      // If there are no more courses to place, break out of the loop
      if (reOrganizedCourses.length === 0) {
        break;
      }

      //if there is no more weeks to place the courses, break out of the loop
      if (weekIndex === weeksData.length) {
        break;
      }
    }
  }
  // return the weeksData with the courses placed
  return weeksData;
}

/**
 * This function will transform the worksheet data to a format that can be used by the algorithm
 * @param {*} worksheet 
 * @returns 
 */
function transformData(worksheet) {
  // Map the days to their index
  const daysMap = {
    lundi: 0,
    mardi: 1,
    mercredi: 2,
    jeudi: 3,
    vendredi: 4,
  };

  return worksheet.slice(1).map((row) => {
    const [moduleName, volumeS1, volumeS2, constraint] = row;

    let fullDay = false;
    let dayPart = null;
    let fixedDay = null;

    if (constraint) {
      const constraints = constraint
        .split(",")
        .map((c) => c.trim().toLowerCase());

      constraints.forEach((c) => {
        if (c === "jour plein") {
          fullDay = true;
          dayPart = null; // Ensure mutual exclusivity
        } else if (c === "matin") {
          if (!fullDay) dayPart = "morning";
        } else if (c === "après-midi") {
          if (!fullDay) dayPart = "afternoon";
        } else if (daysMap.hasOwnProperty(c)) {
          fixedDay = daysMap[c];
        }
      });
    }

    const constraints = {
      fixedDay: fixedDay,
      semester1Volume: volumeS1,
      semester2Volume: volumeS2,
      fullDay: fullDay,
      dayPart: dayPart,
      sections: [],
      mandatoryCourse: [],
      consecutiveDays: false,
      hasPriority: 0,
    };

    return {
      name: moduleName,
      constraints: constraints,
      initialVolume1: volumeS1,
      initialVolume2: volumeS2,
      firstScheduledDay: null,
      priority: 0,
    };
  });
}

/**
 * Transform a date string to French format (more readable)
 * @param {*} dateString 
 * @returns 
 */
function formatDateToFrench(dateString) {
  console.log("dateString", dateString);
  const [year, month, day] = dateString.split("-");
  console.log("month", month);
  console.log("day", day);
  console.log("year", year);
  const date = new Date(`${year}-${month}-${day}`);
  console.log("date", date);
  const options = { day: "numeric", month: "long", year: "numeric" };
  const frenchDate = new Intl.DateTimeFormat("fr-FR", options).format(date);

  return frenchDate;
}

// Define the API endpoint to receive the worksheet data and do the planification
app.post("/api/planification", (req, res) => {
  //reset the datas to their initial state
  let coursesData = [];
  let result = [];
  let csv = "";
  const worksheet = req.body.worksheet;
  //reset weeksData to its initial state
  weeksData.forEach((week) => {
    week.morning.forEach((day) => (day.course = null));
    week.evening.forEach((day) => (day.course = null));
  });
  // Log the received worksheet data to the console
  console.log("Received worksheet:", worksheet);
  // Transform the worksheet to coursesData format if necessary
  coursesData = transformData(worksheet);
  console.log("Transformed worksheet:", coursesData);
  result = defineCourseDay(weeksData, coursesData);

  // Prepare the result as a response
  csv = "Module;Dates;Heures restantes\n";
  for (const course of coursesData) {
    let days = [];
    for (const week of result) {
      for (const day of week.morning) {
        if (day.course === course.name) {
          days.push(formatDateToFrench(day.day));
        }
      }
      for (const day of week.evening) {
        if (day.course === course.name) {
          days.push(formatDateToFrench(day.day));
        }
      }
    }
    if (days.length === 0) {
      days = ["Couldn't be placed"];
    }
    const daysString = days.join(", ");
    csv += `"${course.name}";"${daysString}";${course.constraints.semester1Volume}\n`;
  }

  fs.writeFileSync(filePath, csv);
  console.log("CSV file has been generated successfully.");
  //We should not send the result as it is, it is better to send something similar to the csv file. So the modules with their attributed dates and hours left
  let resultToSend = [];

  for (const course of coursesData) {
    let days = [];

    for (const week of result) {
      for (const day of week.morning) {
        if (day.course === course.name) {
          days.push(day.day);
        }
      }
      for (const day of week.evening) {
        if (day.course === course.name) {
          days.push(day.day);
        }
      }
    }

    if (days.length === 0) {
      days.push("Couldn't be placed");
    }

    resultToSend.push({
      name: course.name,
      days: days, // Keep days as an array
      semester1Volume: course.constraints.semester1Volume,
    });
  }
  // log the result with all the dates etc
  //console.log("The result is:", result);
  res.json({ success: true, result: resultToSend });
});

// Serve the CSV file
app.get('/download', (req, res) => {
  console.log("Downloading file...");
  res.download(filePath, 'result.csv', (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
