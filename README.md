# Medical Lab Report Generation and Management Tool

![Python](https://img.shields.io/badge/HTML-blue.svg)
![Python](https://img.shields.io/badge/CSS-purple.svg)
![Python](https://img.shields.io/badge/JavaScript-orange.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A simple, modern, and portable desktop software application designed to be used offline in a single device to manage patient registration, create detailed lab reports, and generate invoices. It runs entirely in a web browser without needing an internet connection or any complex installation.

---

## Features

* **Complete Offline Functionality:** No internet connection is required. All data is saved locally.
* **Fully Portable:** The entire application, including all patient records, lives in a single folder that can be easily copied to another computer.
* **Patient Management:**
    * Register new patients with auto-generated unique IDs.
    * Search for existing patients by name or ID.
* **Dynamic Report Generation:**
    * Create new lab reports for patients based on a fully customizable list of tests from a `tests.csv` file.
    * A tabbed interface neatly organizes tests by category (e.g., HEMATOLOGY, BIOCHEMISTRY).
    * Supports various input types (text, dropdowns, text areas) and displays normal values alongside inputs.
* **Report Lifecycle:**
    * View cleanly formatted reports.
    * Edit existing reports with pre-filled data.
    * Print professional, compact reports formatted for A4 paper, complete with the lab's letterhead.
* **Flexible Billing:**
    * Automatically generate an invoice for any report.
    * Prices are pulled from the `tests.csv` file but can be overridden on a case-by-case basis directly in the UI.
    * The final invoice is also printable.
* **User-Friendly Interface:**
    * A clean, modern design.
    * Includes a Light/Dark theme toggle for user comfort.
    * Responsive layout for various screen sizes.

## Installation

This application requires **no installation**, but it must be hosted and run from Google Chrome or Microsoft Edge.

#### **Prerequisites**

* **Required Browser:** **Google Chrome**, **Microsoft Edge**, or another up-to-date Chromium-based browser.
    * *Note: Firefox has limited support for the required File System Access API and may not work correctly.*
* **Development Environment (Recommended):** Visual Studio Code with the **Live Server** extension OR if you have Python installed, simply run ```run.exe.bat``` and it will host a live instance.

#### **First-Time Use: Granting Folder Permission**

The very first time you try to save a new patient or search for existing patients, the application will ask for your permission to access a folder. This is a one-time setup step.

1.  When the folder selection dialog appears, navigate to and select the `data` folder located inside your `lab-report-app` directory.
2.  Click **"Allow"** or **"View files"**.

The browser will remember this permission, so you will not have to do this again.

## Customization

You can easily customize key aspects of the application.

#### **Editing Lab Tests, Prices, and Form Layout**

* Simply open the **`tests.csv`** file in any spreadsheet editor (like Microsoft Excel, Google Sheets, or even a text editor).
* You can add, remove, or edit any row to change the tests. The columns are:
    * `category`: The main tab name (e.g., HEMATOLOGY).
    * `sub_category`: The group heading within a tab (e.g., Complete Blood Count).
    * `test_name`: The specific name of the test.
    * `normal_values`: The normal value range to be displayed next to the input.
    * `input_type`: Can be `select` or `textarea`. Leave blank for a standard text box.
    * `options`: If `input_type` is `select`, provide the dropdown options separated by commas (e.g., `Negative,Positive`).
    * `price`: The default price for the test.

#### **Editing Lab Name, Address and Phone Number**

* Open index.html and uiManager.js, and find "A2Z Diagnostic Laboratory". There will be 2 instances of this in each file. Replace all the instances with your preferred name.
* Similarly, open index.html and uiManager.js, and find "+977 980-0000000". There will be a total of 3 instances, replace them with your preferred phone number.
* Similarly, find "123 Medical Lane" in those two files and replace the 3 instances that will show up with your preferred address. 

* To change the logo, replace the `logo.png` file in the `/assets` folder with your own logo.

## Screenshots

![A2Z_Lab_Demo_LandingPage](https://github.com/user-attachments/assets/e258c674-8e10-4d05-9976-ca067fb30989)

<img width="3900" height="1021" alt="A2Z_Lab_Demo_2" src="https://github.com/user-attachments/assets/8304b5cd-2669-454d-8f15-17be635680e2" />

![A2Z_Lab_Demo_45](https://github.com/user-attachments/assets/709d8edf-c455-422a-bdd9-889638c5958f)

<h1></h1>

**This README.md file has been improved for overall readability (grammar, sentence structure, and organization) using AI tools.*
