# Task and Time Management Script

## Overview

This script is a command-line tool designed for managing and tracking work hours, tasks, and time off during the current month. It maintains all data in a CSV file for easy access and manages:

- Daily work entries for VRI and VRS tasks.
- Scheduled and unscheduled time off.
- Calculation of total hours, including the percentage of productive time.
- Editing, deleting, and adding new entries.

The script follows a simple text-based user interface and utilizes file-based persistence for data storage.

## Features

- **Monthly Setup:** Initialize the month with the number of working days and scheduled PTO days.
- **Task Management:** Add new tasks, edit existing tasks, or delete any entries.
- **Time Off Management:** Manage both scheduled and unscheduled time off entries.
- **View Summary:** Display data including actual working hours, total task hours, and a summary of hours categorized by task type.

## Getting Started

### Prerequisites
- **Node.js**: Ensure that Node.js is installed on your system. This script uses standard Node.js modules such as `fs`, `readline`, and `path`.

### Installation
No specific installation is required. Simply clone or download the script and ensure you have Node.js installed.

### Running the Script
1. Open your terminal.
2. Navigate to the folder where the script is located.
3. Run the script using the following command:
   ```
   node your_script_name.js
   ```

The script will guide you through the setup and data entry process.

## Script Workflow

1. **Monthly Setup**
   - When running for the first time in a given month, you will be prompted to enter the number of working days and scheduled PTO days for the month.
   - The script calculates the maximum monthly working hours and creates a CSV file named `entries_<year>_<month>.csv` to store data.

2. **Main Menu**
   - After setup, the main menu presents options to perform different actions:
     1. **New Entry Today**: Adds a task entry for the current date.
     2. **New Entry on Date**: Adds a task entry for a specified date.
     3. **View Data**: Displays all data for the current month including task hours, time off hours, and a summary of task hours by category.
     4. **Add Time Off**: Adds a time off entry for a specified date.
     5. **Edit an Entry**: Allows editing of an existing entry.
     6. **Delete an Entry**: Deletes an existing entry.
     7. **Quit**: Exits the program.

## CSV File Structure
The data is stored in a CSV file named according to the year and month (e.g., `entries_2024_11.csv`). The CSV file format:

- **Headers**: The first few lines of the file represent metadata for the month.
  - `Working Days in Month`: The total number of workdays in the month.
  - `Scheduled PTO Days`: Number of scheduled days off (e.g., vacation).
  - `Max Monthly Hours`: Calculated as `(working days - scheduled PTO days) * 8 hours`.
- **Entries**: The rest of the file contains the work entries in the following format:
  - `Date`, `VRI/VRS`, `Task Description`, `Task Type`, `Hours`, `Entry Type`

## Functional Breakdown

### Adding Tasks
- Adds task details like **Date**, **VRI or VRS**, **Jira Ticket Number**, **Description**, **Hours Worked**, and **Task Type** (Bug Fixing or New Development).
- Stores this information in the CSV file.

### Viewing Data
- Shows total task hours, scheduled and unscheduled PTO, and the percentage of actual working hours used.
- Displays a summary of hours worked categorized by **VRI/VRS** and **Task Type**.

### Editing or Deleting Entries
- **Edit**: Select an entry by index and modify its details.
- **Delete**: Select an entry to remove it from the CSV file.

## Limitations
- **No Cloud Storage**: All data is saved locally in CSV files, making it vulnerable if the file is deleted or moved.
- **Manual Inputs**: Requires manual data entry each time, with limited automation.
- **Error Handling**: The script provides basic validation for numerical inputs but does not handle invalid dates or erroneous inputs comprehensively.

## Code Modules and Key Components
- **Node.js Modules**: Uses `fs` for file operations, `readline` for user interaction, and `path` for file path management.
- **Spinner Animation**: Displays a simple loading spinner during some processes to enhance user experience.
- **CSV Management**: Handles creating, reading, updating, and deleting CSV data, including headers and task entries.

## Usage Example
Run the script and choose option **1** to enter a task for today. The script will prompt you through entering the task's details such as **VRI/VRS**, **Jira ticket**, **description**, **hours worked**, and **type** (bug fixing or new development).

## FAQ

### How do I start a new month?
The script will automatically prompt you for monthly setup information the first time it is run in a new month.

### What happens if I make a mistake while entering hours?
You can edit any existing entry by selecting option **5** from the main menu.

### Can I use this script to manage multiple months?
The script creates separate CSV files for each month. You can keep multiple months' data as long as the CSV files are maintained.

## License
This script is provided under the MIT License. Feel free to use, modify, and distribute as you see fit.

## Contact
For any questions or suggestions regarding this script, please create an issue or reach out to me via Github.
