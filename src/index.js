import { input, confirm, select } from "@inquirer/prompts";
import * as fs from "node:fs";
import OpenApiMocker from "open-api-mocker";
import cloneGitRepository from "./services/clone-git-repository.js";
import findOasFromDir from "./services/find-oas-from-dir.js";

// TODO: extract to configuration file?
const RC_FILE_NAME = ".apimockrc";
const TEMP_FOLDER_NAME = ".api-mock-runner";

// TODO: Refactor steps to functions
const main = async () => {
  let config;

  const configFileExists = fs.existsSync(`${process.cwd()}/.apimockrc`);

  if (configFileExists) {
    const existingConfig = JSON.parse(
      fs.readFileSync(`${process.cwd()}/.apimockrc`)
    );
    console.table(existingConfig);
    const useExistingConfig = await confirm({
      message: "Do you want to use the existing config?",
    });

    // TODO: ask values to user if not using existing config
    if (useExistingConfig) config = existingConfig;
  } else {
    const schemasOrigin = await input({
      message: "Enter the repo url or relative path",
    });
    const initialPort = await input({
      message: "Enter the initial port",
      default: 1234,
      transformer: (value) => parseInt(value),
    });

    config = {
      schemasOrigin,
      initialPort,
    };
    // Create .apimockrc file
    const filePath = `${process.cwd()}/${RC_FILE_NAME}`;
    fs.writeFile(filePath, JSON.stringify(config), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Config saved");
      }
    });
    const addRcFileToGitignore = await confirm({
      message: `Add ${RC_FILE_NAME} to .gitignore?`,
    });
    if (addRcFileToGitignore) {
      // TODO: create function that validates if is already in gitignore
      fs.appendFile(
        `${process.cwd()}/.gitignore`,
        `\n${RC_FILE_NAME}`,
        (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`${RC_FILE_NAME} added to .gitignore`);
          }
        }
      );
    }
  }

  /*
   * NOTE: Regex explanation
   * - /^(git@|https:\/\/)/: This part of the regex specifies that the string must start with either "git@" or "https://".
   * - [^\s]+: This part ensures that there is at least one or more characters after "git@" or "https://". It matches any character except whitespace.
   * - (\.git)$: The regex ends with "\.git", ensuring that the string must end with ".git".
   */
  const isOriginRemoteRegex = /^(git@|https:\/\/)[^\s]+(\.git)$/;

  const isOriginRemote = isOriginRemoteRegex.test(config.schemasOrigin);

  if (isOriginRemote) {
    await cloneGitRepository(config.schemasOrigin);
    // TODO: DRY, create write to .gitignore function
    fs.appendFile(
      `${process.cwd()}/.gitignore`,
      `\n${TEMP_FOLDER_NAME}/$}`,
      (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`${TEMP_FOLDER_NAME} added to .gitignore`);
        }
      }
    );
  }

  const schemasDir = isOriginRemote ? TEMP_FOLDER_NAME : config.schemasOrigin;

  const schemas = await findOasFromDir(schemasDir);

  // TODO: change to checkboxes when multiple schemas are supported
  const selectedSchema = await select({
    message: "Select a schema",
    choices: schemas.map((schema) => {
      return { name: schema.fileName, value: schema.filePath };
    }),
  });

  const openApiMocker = new OpenApiMocker({
    port: config.initialPort,
    schema: selectedSchema,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
};

main();
