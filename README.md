# Time Tracking Script

This script is a Node.js-based application for tracking work hours, tasks, and time off during the month. It allows users to enter tasks associated with Jira tickets, categorize tasks, and record both scheduled and unscheduled time off. Data is stored in a CSV file, making it easy to analyze your productivity.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Running the Script](#running-the-script)
  - [Main Menu Options](#main-menu-options)
- [Data Storage](#data-storage)
- [Tips](#tips)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Task Entry**: Log tasks with associated Jira tickets, descriptions, categories, types, and hours worked.
- **Time Off Entry**: Record scheduled or unscheduled time off, like PTO or sick days.
- **Custom Categories**: Define your own categories (e.g., VRI, VRS) via a configuration file.
- **Monthly Summary**: View summaries of hours worked, time off taken, and the percentage of working hours used.
- **Data Editing**: Edit or delete existing entries.
- **Data Persistence**: Data is saved in a CSV file for each month, allowing you to track work history.

## Prerequisites

- **Node.js**: Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/timetracker.git
   cd timetracker
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

## Configuration

Before running the script, you need to set up the configuration file.

1. **Create a `config.json` File**:

   In the root directory of the project, create a file named `config.json` with the following structure:

   ```json
   {
     "categories": ["VRI", "VRS"],
     "JIRA_PROJECT_KEY": "JIRA"
   }
   ```

   - **categories**: An array of categories to use for classifying tasks. You can customize this list to fit your needs.
   - **JIRA_PROJECT_KEY**: Your Jira project key to be prefixed to all ticket numbers.

2. **Customize the Configuration**:
   - **Categories**: Modify the categories array to match the types of work you want to track.
   - **JIRA_PROJECT_KEY**: Update the Jira project key to match your actual project.

## Usage

### Running the Script

To start the script, navigate to the project directory and run:

```bash
node script.js
```

### Main Menu Options

Upon running the script, you will see a main menu with the following options:

```
Please select an option:
1: New Entry Today
2: New Entry on Date
3: View Data
4: Add Time Off
5: Edit an Entry
6: Delete an Entry
7: Quit
Enter your choice (1-7):
```

#### Option 1: New Entry Today
Log a new task entry for the current date.

- **Select Category**: Choose from the categories defined in your `config.json`.
- **Enter Jira Ticket Number**: Provide the ticket number without the project key.
- **Task Description**: Optionally add a description of the task.
- **Hours Worked**: Enter the number of hours worked.
- **Task Type**: Indicate whether it's "New Development" or "Bug Fixing".

#### Option 2: New Entry on Date
Log a new task for a specific date. Follow the same steps as Option 1, but you specify the date first.

#### Option 3: View Data
Display a summary of all logged data for the current month, including:

- **Max Monthly Hours**
- **Scheduled PTO Hours**
- **Total Time Off Hours**
- **Actual Working Hours**
- **Total Task Hours**
- **Summary Table** with hours categorized by type.

#### Option 4: Add Time Off
Record time off for a specific day:
- **Day of Time Off**: Specify the day.
- **Description**: Enter a description (e.g., "Sick Time").
- **Hours**: Provide the number of hours taken off.

#### Option 5: Edit an Entry
Modify an existing entry by selecting its index number.
- **Update Fields**: Change any value, such as date, category, hours, etc.

#### Option 6: Delete an Entry
Remove an entry from the data.
- **Confirm Deletion**: Type 'yes' to confirm.

#### Option 7: Quit
Exit the application.

## Data Storage

- **CSV Files**: The script stores data in CSV files named by year and month (`entries_YEAR_MONTH.csv`, e.g., `entries_2023_10.csv`).
- **Automatic Initialization**: When no CSV file exists for the current month, the script prompts for initial setup (e.g., working days, scheduled PTO days).

## Tips

- **Use Categories Wisely**: Customize categories in the `config.json` file to best suit your work tracking needs.
- **Backup CSV Files**: Regularly back up your CSV files to prevent data loss.
- **Git Ignore `.DS_Store`**: If you're on macOS, add `.DS_Store` to your `.gitignore` to avoid cluttering your version control.

  ```gitignore
  .DS_Store
  ```

- **Extending Functionality**: You can easily modify the script to include new features, such as additional task types or data exporting options.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**.
2. **Create a Feature Branch**:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**:

   ```bash
   git commit -m "Add YourFeature"
   ```

4. **Push to the Branch**:

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**.

## License

This project is licensed under the [MIT License](LICENSE).

---

*This script is intended to help with time tracking and should be used responsibly. Make sure your time reporting complies with your organization's policies.*

