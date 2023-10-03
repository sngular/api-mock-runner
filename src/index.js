import OpenApiMocker from 'open-api-mocker';
import cloneGitRepository from './services/clone-git-repository.js';
import findOasFromDir from './services/find-oas-from-dir.js';

const main = async () => {
  const testRepoSSH = "git@gitlab.sngular.com:os3/manatee/sirenia.git"; // TODO: replace by user input
  const testRepoHTTPS = "https://gitlab.sngular.com/os3/manatee/sirenia.git"; // TODO: replace by user input
  await cloneGitRepository(testRepoSSH);

  const schemas = await findOasFromDir('./tests');

  console.log('Schemas found:');
  schemas.forEach(el => console.log(`-- ${el.filePath}`));

  const openApiMocker = new OpenApiMocker({
    port: 5000,
    schema: schemas[0].filePath,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
};

main();
