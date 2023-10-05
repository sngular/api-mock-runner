import { input, confirm } from "@inquirer/prompts";
import * as fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const run = async () => {
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
    // Save config
    // create an .apimockrc file on the root of the project
    const filePath = `${__dirname}/.apimockrc`;
    fs.writeFile(filePath, JSON.stringify(config), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Config saved");
      }
    });
  }
};

run();
