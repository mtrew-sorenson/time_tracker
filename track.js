const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { table } = require("table");

const HOURS_IN_A_DAY = 8;
const SPINNER_DURATION_IN_MS = 500;

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const categories = config.categories
const JIRA_PROJECT_KEY = config.JIRA_PROJECT_KEY || "JIRA";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getCurrentMonthFileName = () => {
  const now = new Date();
  return `entries_${now.getFullYear()}_${now.getMonth() + 1}.csv`;
};

const initializeCSV = (
  filePath,
  workDaysInMonth,
  scheduledPtoDays,
  maxMonthlyHours
) => {
  if (!fs.existsSync(filePath)) {
    const header = `Working Days in Month,${workDaysInMonth}\nScheduled PTO Days,${scheduledPtoDays}\nMax Monthly Hours,${maxMonthlyHours}\nDate,Category,Task Description,Task Type,Hours,Entry Type\n`;
    fs.writeFileSync(filePath, header);
  }
};

const updateCSV = (entries, callback) => {
  const filePath = getCurrentMonthFileName();

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    const lines = data.split("\n");

    // Get the headers
    const workDaysLine = lines[0];
    const scheduledPtoLine = lines[1];
    const maxHoursLine = lines[2];

    let workDaysInMonth = 0;
    let scheduledPtoDays = 0;
    let maxMonthlyHours = 0;

    if (workDaysLine && scheduledPtoLine && maxHoursLine) {
      const [_, workDaysStr] = workDaysLine.split(",");
      const [__, scheduledPtoDaysStr] = scheduledPtoLine.split(",");
      const [___, maxHoursStr] = maxHoursLine.split(",");

      workDaysInMonth = parseInt(workDaysStr);
      scheduledPtoDays = parseInt(scheduledPtoDaysStr);
      maxMonthlyHours = parseFloat(maxHoursStr);

      if (
        isNaN(workDaysInMonth) ||
        isNaN(maxMonthlyHours) ||
        isNaN(scheduledPtoDays)
      ) {
        console.error("Error parsing header information from the CSV.");
        return;
      }
    }

    // Now, write the CSV file
    let csvContent = "";

    // Write headers
    csvContent += `Working Days in Month,${workDaysInMonth}\n`;
    csvContent += `Scheduled PTO Days,${scheduledPtoDays}\n`;
    csvContent += `Max Monthly Hours,${maxMonthlyHours}\n`;
    csvContent += `Date,Category,Task Description,Task Type,Hours,Entry Type\n`;

    // Write entries
    entries.forEach((entry) => {
      csvContent += `${entry.date},${entry.category},${entry.taskDescription},${entry.taskType},${entry.hours},${entry.entryType}\n`;
    });

    // Write the CSV file
    fs.writeFileSync(filePath, csvContent);

    if (callback) {
      callback();
    }
  } else {
    console.error(
      "Error: Monthly data not initialized. Please restart the script."
    );
    if (callback) {
      callback();
    }
  }
};

/**
 * Displays data from the current month's CSV file, including task hours, time off hours,
 * and a summary of hours by category. If no data is available, it logs a message and optionally
 * returns to the main menu.
 *
 * @param {boolean} [returnToMenu=true] - Whether to return to the main menu after displaying data.
 * @returns {void|Array<Object>} - Returns an array of entries if returnToMenu is false, otherwise returns void.
 */
const displayData = (returnToMenu = true) => {
  const filePath = getCurrentMonthFileName();

  if (!fs.existsSync(filePath)) {
    console.log("No data available for the current month.");
    if (returnToMenu) mainMenu();
    return;
  }

  const data = fs.readFileSync(filePath, "utf8");
  const lines = data.split("\n");

  let totalTaskHours = 0;
  let totalTimeOffHours = 0;
  let workDaysInMonth = 0;
  let scheduledPtoDays = 0;
  let maxMonthlyHours = 0;
  let categoryTotals = {};
  let tasks = [];
  let timeOffEntries = [];
  let entries = [];

  // Initialize categoryTotals
  categories.forEach(category => {
    categoryTotals[category] = {
      "Bug Fixing": 0,
      "New Development": 0,
    };
  });

  // Parse the CSV data
  const workDaysLine = lines[0];
  const scheduledPtoLine = lines[1];
  const maxHoursLine = lines[2];

  if (workDaysLine && scheduledPtoLine && maxHoursLine) {
    const [_, workDaysStr] = workDaysLine.split(",");
    const [__, scheduledPtoDaysStr] = scheduledPtoLine.split(",");
    const [___, maxHoursStr] = maxHoursLine.split(",");

    workDaysInMonth = parseInt(workDaysStr);
    scheduledPtoDays = parseInt(scheduledPtoDaysStr);
    maxMonthlyHours = parseFloat(maxHoursStr);

    if (
      isNaN(workDaysInMonth) ||
      isNaN(maxMonthlyHours) ||
      isNaN(scheduledPtoDays)
    ) {
      console.error("Error parsing header information from the CSV.");
      return;
    }
  }

  // Task entries start from line 4
  const taskLines = lines.slice(3);

  for (const line of taskLines) {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      continue;
    }

    // Skip the header line
    if (trimmedLine.startsWith("Date,Category")) {
      continue;
    }

    const columns = trimmedLine.split(",");

    // Ensure the line has exactly 6 columns
    if (columns.length !== 6) {
      continue; // Skip lines that are not entries
    }

    const [date, category, taskDescription, taskType, hoursStr, entryType] =
      columns;

    const hours = parseFloat(hoursStr);

    if (isNaN(hours)) {
      continue;
    }

    const entry = {
      date,
      category,
      taskDescription,
      taskType,
      hours,
      entryType,
    };

    entries.push(entry);

    if (entryType === "Task") {
      totalTaskHours += hours;
      tasks.push(entry);
      // Update category totals
      if (
        categoryTotals[category] &&
        categoryTotals[category][taskType] !== undefined
      ) {
        categoryTotals[category][taskType] += hours;
      } else {
        if (!categoryTotals[category]) {
          categoryTotals[category] = {};
        }
        if (!categoryTotals[category][taskType]) {
          categoryTotals[category][taskType] = 0;
        }
        categoryTotals[category][taskType] += hours;
      }
    } else if (entryType === "Time Off") {
      totalTimeOffHours += hours;
      timeOffEntries.push({ date, description: taskDescription, hours });
    }
  }

  const actualWorkingHours = maxMonthlyHours - totalTimeOffHours;

  // Display total hours
  console.log(`\nMax Monthly Hours: ${maxMonthlyHours}`);
  console.log(`Scheduled PTO Hours: ${scheduledPtoDays * HOURS_IN_A_DAY}`);
  console.log(`Total Time Off Hours (Unscheduled): ${totalTimeOffHours}`);
  console.log(`Actual Working Hours: ${actualWorkingHours}`);
  console.log(`Total Task Hours: ${totalTaskHours}`);
  console.log(
    `Percentage of Actual Working Hours Used: ${(
      (totalTaskHours / actualWorkingHours) *
      100
    ).toFixed(2)}%`
  );

  // Display summary table
  console.log("\n--- Summary ---\n");

  const summaryTable = [
    ["Category", "Hours", "Percentage of Actual Working Hours"],
  ];

  for (let category in categoryTotals) {
    for (let taskType in categoryTotals[category]) {
      const hours = categoryTotals[category][taskType];
      const percentage = actualWorkingHours
        ? ((hours / actualWorkingHours) * 100).toFixed(2)
        : "0.00";
      summaryTable.push([
        `${category} ${taskType}`,
        hours.toString(),
        percentage + "%",
      ]);
    }
  }

  console.log(table(summaryTable));

  // Display entries table
  console.log("\n--- All Entries ---\n");

  if (entries.length > 0) {
    const entriesTable = [
      ["Index", "Date", "Category", "Description", "Type", "Hours", "Entry Type"],
    ];

    entries.forEach((entry, index) => {
      entriesTable.push([
        index.toString(),
        entry.date,
        entry.category || "-",
        entry.taskDescription,
        entry.taskType || "-",
        entry.hours.toString(),
        entry.entryType,
      ]);
    });

    console.log(table(entriesTable));
  } else {
    console.log("No entries.");
  }

  if (returnToMenu) mainMenu();
  else return entries;

};
const askForAnotherAction = () => {
  displayLoadingAnimation(() => {
    console.log("\n*******");
    rl.question(
      "Do you want to perform another action? Enter 1 for yes, 2 for no:\n> ",
      (response) => {
        if (response === "1") {
          mainMenu();
        } else {
          console.log("Have a nice day!");
          rl.close();
        }
      }
    );
  });
};

const askQuestions = (date) => {
  displayLoadingAnimation(() => {
    console.log("\n*******");
    // Build the category selection prompt
    let categoryPrompt = "Select a category:\n";
    categories.forEach((category, index) => {
      categoryPrompt += `${index + 1}: ${category}\n`;
    });
    categoryPrompt += `Please enter your choice (1-${categories.length}):\n> `;
    rl.question(categoryPrompt, (categoryOption) => {
      const categoryIndex = parseInt(categoryOption) - 1;
      if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= categories.length) {
        console.error("Invalid category selected.");
        askForAnotherAction();
        return;
      }
      const selectedCategory = categories[categoryIndex];
      displayLoadingAnimation(() => {
        console.log("\n*******");
        rl.question("Enter the Jira ticket number:\n> ", (ticketNumber) => {
          const jiraTicket = `${JIRA_PROJECT_KEY}-` + ticketNumber;
          displayLoadingAnimation(() => {
            console.log("\n*******");
            rl.question(
              "Enter a description of the task you worked on (optional):\n> ",
              (description) => {
                const taskDescription =
                  jiraTicket + (description ? `: ${description}` : "");
                displayLoadingAnimation(() => {
                  console.log("\n*******");
                  rl.question(
                    "Enter the number of hours worked on this ticket:\n> ",
                    (hoursInput) => {
                      const hours = parseFloat(hoursInput);
                      if (isNaN(hours)) {
                        console.error("Invalid input for hours.");
                        askForAnotherAction();
                        return;
                      }
                      displayLoadingAnimation(() => {
                        console.log("\n*******");
                        rl.question(
                          "Was this new development or bug fixing?\n1: New Development\n2: Bug Fixing\nPlease enter your choice (1 or 2):\n> ",
                          (taskTypeOption) => {
                            const taskType =
                              taskTypeOption === "1"
                                ? "New Development"
                                : "Bug Fixing";
                            const entry = {
                              date: date,
                              category: selectedCategory,
                              taskDescription,
                              taskType,
                              hours,
                              entryType: "Task",
                            };
                            // Load existing entries
                            const entries = displayData(false);
                            entries.push(entry);
                            updateCSV(entries, () => {
                              console.log("Entry saved!");
                              // Display updated data
                              displayData(false);
                              askForAnotherAction();
                            });
                          }
                        );
                      });
                    }
                  );
                });
              }
            );
          });
        });
      });
    });
  });
};

const addTimeOff = () => {
  displayLoadingAnimation(() => {
    console.log("\n*******");
    rl.question("Enter the day of the time off (1-31):\n> ", (dayInput) => {
      const day = parseInt(dayInput);
      if (isNaN(day) || day < 1 || day > 31) {
        console.error("Invalid day. Please enter a number between 1 and 31.");
        mainMenu();
        return;
      }
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const formattedDate = date.toISOString().split("T")[0];
      displayLoadingAnimation(() => {
        console.log("\n*******");
        rl.question(
          "Enter a description for the time off (e.g., Sick Time, Unscheduled PTO):\n> ",
          (description) => {
            displayLoadingAnimation(() => {
              console.log("\n*******");
              rl.question(
                "Enter the number of hours to subtract:\n> ",
                (hoursInput) => {
                  const hours = parseFloat(hoursInput);
                  if (isNaN(hours)) {
                    console.error("Invalid input for hours.");
                    mainMenu();
                    return;
                  }
                  const entry = {
                    date: formattedDate,
                    category: "", // Not applicable
                    taskDescription: description,
                    taskType: "", // Not applicable
                    hours,
                    entryType: "Time Off",
                  };
                  // Load existing entries
                  const entries = displayData(false);
                  entries.push(entry);
                  updateCSV(entries, () => {
                    console.log("Entry saved!");
                    // Display updated data
                    displayData(false);
                    askForAnotherAction();
                  });
                }
              );
            });
          }
        );
      });
    });
  });
};

const editEntry = () => {
  displayLoadingAnimation(() => {
    console.log("\n*******");
    // Load existing entries
    const entries = displayData(false);
    if (!entries || entries.length === 0) {
      console.log("No entries available to edit.");
      mainMenu();
      return;
    }

    rl.question(
      "Enter the index number of the entry you want to edit:\n> ",
      (indexInput) => {
        const index = parseInt(indexInput);
        if (isNaN(index) || index < 0 || index >= entries.length) {
          console.error("Invalid index selected.");
          mainMenu();
          return;
        }

        const entryToEdit = entries[index];

        console.log("\n--- Editing Entry ---\n");
        console.log(
          `Date: ${entryToEdit.date}\nCategory: ${
            entryToEdit.category || "-"
          }\nDescription: ${entryToEdit.taskDescription}\nType: ${
            entryToEdit.taskType || "-"
          }\nHours: ${entryToEdit.hours}\nEntry Type: ${entryToEdit.entryType}`
        );

        if (entryToEdit.entryType === "Task") {
          editTaskEntry(entryToEdit, entries, index);
        } else if (entryToEdit.entryType === "Time Off") {
          editTimeOffEntry(entryToEdit, entries, index);
        } else {
          console.error("Unknown entry type.");
          mainMenu();
        }
      }
    );
  });
};

const editTaskEntry = (entry, entries, index) => {
  rl.question(
    `Enter new date (YYYY-MM-DD) or press Enter to keep [${entry.date}]:\n> `,
    (dateInput) => {
      const date = dateInput.trim() !== "" ? dateInput.trim() : entry.date;
      // Build the category selection prompt
      let categoryPrompt = `Select a category or press Enter to keep [${entry.category}]:\n`;
      categories.forEach((category, idx) => {
        categoryPrompt += `${idx + 1}: ${category}\n`;
      });
      categoryPrompt += `Please enter your choice (1-${categories.length}) or press Enter to keep:\n> `;
      rl.question(categoryPrompt, (categoryOption) => {
        let category;
        if (categoryOption.trim() === "") {
          category = entry.category;
        } else {
          const categoryIndex = parseInt(categoryOption) - 1;
          if (
            isNaN(categoryIndex) ||
            categoryIndex < 0 ||
            categoryIndex >= categories.length
          ) {
            console.error("Invalid category selected.");
            mainMenu();
            return;
          }
          category = categories[categoryIndex];
        }
        rl.question(
          `Enter the Jira ticket number or press Enter to keep [${entry.taskDescription.split(":")[0]}]:\n> `,
          (ticketNumber) => {
            const jiraTicket =
              ticketNumber.trim() !== ""
                ? `${JIRA_PROJECT_KEY}-` + ticketNumber.trim()
                : entry.taskDescription.split(":")[0];
            rl.question(
              `Enter a description of the task or press Enter to keep [${
                entry.taskDescription.split(":")[1] || ""
              }]:\n> `,
              (description) => {
                const taskDescription =
                  jiraTicket +
                  (description.trim() !== ""
                    ? `: ${description.trim()}`
                    : "");
                rl.question(
                  `Enter the number of hours worked or press Enter to keep [${entry.hours}]:\n> `,
                  (hoursInput) => {
                    const hours =
                      hoursInput.trim() !== ""
                        ? parseFloat(hoursInput)
                        : entry.hours;
                    if (isNaN(hours)) {
                      console.error("Invalid input for hours.");
                      mainMenu();
                      return;
                    }
                    rl.question(
                      `Was this new development or bug fixing?\n1: New Development\n2: Bug Fixing\nPress Enter to keep [${entry.taskType}]:\n> `,
                      (taskTypeOption) => {
                        let taskType;
                        if (taskTypeOption === "1") {
                          taskType = "New Development";
                        } else if (taskTypeOption === "2") {
                          taskType = "Bug Fixing";
                        } else {
                          taskType = entry.taskType;
                        }
                        // Update the entry
                        entries[index] = {
                          date,
                          category,
                          taskDescription,
                          taskType,
                          hours,
                          entryType: "Task",
                        };
                        updateCSV(entries, () => {
                          console.log("Entry updated!");
                          // Display updated data
                          displayData(false);
                          askForAnotherAction();
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    }
  );
};

const editTimeOffEntry = (entry, entries, index) => {
  rl.question(
    `Enter new date (YYYY-MM-DD) or press Enter to keep [${entry.date}]:\n> `,
    (dateInput) => {
      const date = dateInput.trim() !== "" ? dateInput.trim() : entry.date;
      rl.question(
        `Enter a description or press Enter to keep [${entry.taskDescription}]:\n> `,
        (description) => {
          const taskDescription =
            description.trim() !== "" ? description.trim() : entry.taskDescription;
          rl.question(
            `Enter the number of hours or press Enter to keep [${entry.hours}]:\n> `,
            (hoursInput) => {
              const hours =
                hoursInput.trim() !== "" ? parseFloat(hoursInput) : entry.hours;
              if (isNaN(hours)) {
                console.error("Invalid input for hours.");
                mainMenu();
                return;
              }
              // Update the entry
              entries[index] = {
                date,
                category: "", // Not applicable
                taskDescription,
                taskType: "", // Not applicable
                hours,
                entryType: "Time Off",
              };
              updateCSV(entries, () => {
                console.log("Entry updated!");
                // Display updated data
                displayData(false);
                askForAnotherAction();
              });
            }
          );
        }
      );
    }
  );
};

const deleteEntry = () => {
  displayLoadingAnimation(() => {
    console.log("\n*******");
    // Load existing entries
    const entries = displayData(false);
    if (!entries || entries.length === 0) {
      console.log("No entries available to delete.");
      mainMenu();
      return;
    }

    rl.question(
      "Enter the index number of the entry you want to delete:\n> ",
      (indexInput) => {
        const index = parseInt(indexInput);
        if (isNaN(index) || index < 0 || index >= entries.length) {
          console.error("Invalid index selected.");
          mainMenu();
          return;
        }

        const entryToDelete = entries[index];

        console.log("\n--- Entry to Delete ---\n");
        console.log(
          `Date: ${entryToDelete.date}\nCategory: ${
            entryToDelete.category || "-"
          }\nDescription: ${entryToDelete.taskDescription}\nType: ${
            entryToDelete.taskType || "-"
          }\nHours: ${entryToDelete.hours}\nEntry Type: ${entryToDelete.entryType}`
        );

        rl.question(
          "Are you sure you want to delete this entry? Enter 'yes' to confirm:\n> ",
          (confirmation) => {
            if (confirmation.toLowerCase() === "yes") {
              entries.splice(index, 1); // Remove the entry from the array
              updateCSV(entries, () => {
                console.log("Entry deleted!");
                // Display updated data
                displayData(false);
                askForAnotherAction();
              });
            } else {
              console.log("Deletion cancelled.");
              mainMenu();
            }
          }
        );
      }
    );
  });
};

// Function to display a simple loading animation
const displayLoadingAnimation = (callback) => {
  const spinnerFrames = ["|", "/", "-", "\\"];
  let i = 0;
  const spinner = setInterval(() => {
    process.stdout.write(
      `\r${spinnerFrames[i++ % spinnerFrames.length]} Loading...`
    );
  }, 100);

  // Duration of the animation (in milliseconds)
  setTimeout(() => {
    clearInterval(spinner);
    process.stdout.write("\r"); // Clear the line
    callback();
  }, SPINNER_DURATION_IN_MS); // Adjust the duration as needed
};

const mainMenu = () => {
  const filePath = getCurrentMonthFileName();

  if (!fs.existsSync(filePath)) {
    // Monthly setup
    console.log("Monthly setup: Please enter the following information.");
    rl.question(
      "Enter the number of working days in the month:\n> ",
      (workDaysInput) => {
        const workDaysInMonth = parseInt(workDaysInput);
        if (isNaN(workDaysInMonth)) {
          console.error("Invalid input for working days.");
          mainMenu(); // Retry
          return;
        }
        rl.question(
          "Enter the number of scheduled PTO days this month:\n> ",
          (scheduledPtoDaysInput) => {
            const scheduledPtoDays = parseInt(scheduledPtoDaysInput);
            if (isNaN(scheduledPtoDays)) {
              console.error("Invalid input for scheduled PTO days.");
              mainMenu(); // Retry
              return;
            }
            const maxMonthlyHours = (workDaysInMonth - scheduledPtoDays) * HOURS_IN_A_DAY;
            console.log(
              `Max monthly hours calculated as ${maxMonthlyHours} hours.`
            );
            // Initialize the CSV file, including scheduled PTO days
            initializeCSV(
              filePath,
              workDaysInMonth,
              scheduledPtoDays,
              maxMonthlyHours
            );
            // Now show the main menu options
            showMainMenuOptions();
          }
        );
      }
    );
  } else {
    showMainMenuOptions();
  }
};

const showMainMenuOptions = () => {
  console.log("\n*******");
  rl.question(
    "Please select an option:\n1: New Entry Today\n2: New Entry on Date\n3: View Data\n4: Add Time Off\n5: Edit an Entry\n6: Delete an Entry\n7: Quit\nEnter your choice (1-7):\n> ",
    (option) => {
      if (option === "1") {
        const today = new Date().toISOString().split("T")[0];
        askQuestions(today);
      } else if (option === "2") {
        displayLoadingAnimation(() => {
          console.log("\n*******");
          rl.question("Enter the day of the month (1-31):\n> ", (dayInput) => {
            const day = parseInt(dayInput);
            if (isNaN(day) || day < 1 || day > 31) {
              console.error(
                "Invalid day. Please enter a number between 1 and 31."
              );
              mainMenu();
              return;
            }
            const now = new Date();
            const date = new Date(now.getFullYear(), now.getMonth(), day);
            const formattedDate = date.toISOString().split("T")[0];
            askQuestions(formattedDate);
          });
        });
      } else if (option === "3") {
        displayData();
      } else if (option === "4") {
        addTimeOff();
      } else if (option === "5") {
        editEntry();
      } else if (option === "6") {
        deleteEntry();
      } else if (option === "7") {
        console.log("Have a nice day!");
        rl.close();
      } else {
        console.error("Invalid option selected.");
        mainMenu();
      }
    }
  );
};

mainMenu();
