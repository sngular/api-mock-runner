import OpenApiMocker from "open-api-mocker";
import cloneGitRepository from "./services/clone-git-repository.js";
import { input, confirm } from "@inquirer/prompts";
import * as fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const main = async () => {
  const config = {
    repoUrl: await input({ message: "Enter the repo url" }),
    dirPath: await input({ message: "Enter the directory path" }),
    addToGitIgnore: await confirm({
      message: "Do you want to add .api-mock-runner to .gitignore?",
    }),
    saveConfig: await confirm({ message: "Do you want to save the config?" }),
  };

  console.table(config);

  if (config.saveConfig) {
    const filePath = `${__dirname}/.apimockrc`;
    fs.writeFile(filePath, JSON.stringify(config), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Config saved");
      }
    });
  }

  const testRepoSSH = "git@gitlab.sngular.com:os3/manatee/sirenia.git"; // TODO: replace by user input
  const testRepoHTTPS = "https://gitlab.sngular.com/os3/manatee/sirenia.git"; // TODO: replace by user input
  await cloneGitRepository(config.repoUrl || testRepoSSH);

  const openApiMocker = new OpenApiMocker({
    port: 5000,
    schema: schemas[0].filePath,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
};

main();
