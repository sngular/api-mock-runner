const { program } = require("commander");

program
  .requiredOption("-r,--repository-url <value>", "The URL of the repo or path")
  .option(
    "-s,--schemas-directory <value>",
    "Path/name of the schemas directory"
  )
  .option("-p, --port [number]", "Port to run the server on", 3000)
  .option(
    "-d,--delete-repo-directory",
    "Delete the repo directory after cloning"
  )
  .option("-a, --add-gitignore", "Add schemas repository to .gitignore");

const main = () => {
  program.parse(process.argv);
  const options = program.opts();
  console.table(options);
};

main();
