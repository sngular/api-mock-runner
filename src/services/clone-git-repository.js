// TODO:
// - Refactor
// - console.logs
// - tests
// - doc

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const process = require("process");

const TEMP_FOLDER_NAME = ".api-mock-runner"; // TODO: extract to configuration file?

async function cloneSchemaRepo(repositoryURL) {
  resetTempDir();
  cloneRepository(repositoryURL);
  printDirectoryContent();
  await waitUserInput(); // FIXME: Temp until command line interface is finished
}

function resetTempDir() {
  removeTempDir();
  fs.mkdirSync(TEMP_FOLDER_NAME);
}

function removeTempDir() {
  if (fs.existsSync(TEMP_FOLDER_NAME)) {
    fs.rmSync(TEMP_FOLDER_NAME, { recursive: true });
  }
}

function cloneRepository(repositoryURL) {
  execSync(`git clone ${repositoryURL} .`, {
    cwd: path.resolve(process.cwd(), TEMP_FOLDER_NAME), // path to where you want to save the file
  });
}

function printDirectoryContent() {
  console.log("Directory content:"); // FIXME: console.log
  fs.readdirSync(TEMP_FOLDER_NAME).forEach((file) => {
    console.log(`  - ${file}`);
  });
}

async function waitUserInput() {
  const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const message = "Waiting user input to finish...";
  return new Promise((resolve) =>
    readLineInterface.question(message, answer => {
      readLineInterface.close();
      removeTempDir();
      resolve(answer);
    })
  );
}

module.exports = cloneSchemaRepo;
