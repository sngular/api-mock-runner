import { input, confirm } from "@inquirer/prompts";
import * as fs from "node:fs";
import OpenApiMocker from "open-api-mocker";
import cloneGitRepository from "./services/clone-git-repository.js";
import findOasFromDir from "./services/find-oas-from-dir.js";

const testRepoSSH = "git@gitlab.sngular.com:os3/manatee/sirenia.git";
const testRepoHTTPS = "https://gitlab.sngular.com/os3/manatee/sirenia.git"; // TODO: replace by user input

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
    const filePath = `${process.cwd()}/.apimockrc`;
    fs.writeFile(filePath, JSON.stringify(config), (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log("Config saved");
      }
    });
  }

  await cloneGitRepository(config.repoUrl || testRepoSSH);

  const schemas = await findOasFromDir("./tests");

  const openApiMocker = new OpenApiMocker({
    port: 5000,
    schema: schemas[0].filePath,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
};

main();
