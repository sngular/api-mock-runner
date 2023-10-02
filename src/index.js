const OpenApiMocker = require("open-api-mocker");
const cloneGitRepository = require("./services/clone-git-repository");

const main = async () => {
  const testRepoSSH = "git@gitlab.sngular.com:os3/manatee/sirenia.git"; // TODO: replace by user input
  const testRepoHTTPS = "https://gitlab.sngular.com/os3/manatee/sirenia.git"; // TODO: replace by user input
  await cloneGitRepository(testRepoSSH);

  const openApiMocker = new OpenApiMocker({
    port: 5000,
    schema: `${__dirname}/../tests/schema-examples/basic.yaml`,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
};

main();
