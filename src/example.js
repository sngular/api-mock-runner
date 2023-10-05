const OpenApiMocker = require("open-api-mocker");

const main = async () => {
  const openApiMocker = new OpenApiMocker({
    port: 5000,
    schema: `${__dirname}/../tests/schema-examples/basic.yaml`,
    watch: true,
  });

  await openApiMocker.validate();

  await openApiMocker.mock();
};

main();
