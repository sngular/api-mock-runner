# Welcome to api-mock-runner 👋

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Run multiple mock servers from one or more [OpenAPI Specification](https://www.openapis.org/).

Schemas can be provided from a remote origin (https:// or git@) or a local path.

Remote and circular references are allowed.

## 📘 Usage

You can use api-mock-runner in a three different ways. All of them starts a CLI guided journey:

### 1. NPX (No installation needed)

```sh
npx @os3/api-mock-runner
```

### 2. Globally

```sh
sudo npm install --global @os3/api-mock-runner
```

To use: type `api-mock-runner` in the terminal.

### 3. Current project dev dependency

```sh
npm i --save-dev @os3/api-mock-runner
```

### Manual options

You could avoid CLI interaction by using `api-mock-runner` with flags.
To explore manual options, use -h flag:

```sh
npx @os3/api-mock-runner -h
```

```sh
Usage: api-mock-runner [options]

Options:
  -o, --origin <origin>          path or repo containing schemas
  -s, --schema [schemaPaths...]  path to schemas
  -p, --port [ports...]          port to serve each schema
  -r, --run-config               use saved config
  -h, --help                     display help for command
```

### Response selection

The application will return the first response found in the schema by default. To use another existing response, use `prefer` header with the content `statusCode=XXX` in the request.

```
prefer: statusCode=500
```

## Architectural Decision Record (ADR)

Here you can find [architectural decisions records](docs/adr/)

## ❤️ Special thanks

We would like to express our special thanks to [open-api-mocker](https://github.com/jormaechea/open-api-mocker), which is used to set up a mock server.
