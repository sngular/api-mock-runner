# Welcome to api-mock-runner 👋

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Create mocks servers with its schemas

## Install

```sh
npm ci
```

## Usage

To start a guided configuration:

```sh
npx api-mock-runner
```

To explore options:

```sh
npx api-mock-runner -h
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

The application will return the first response by default. To use another existing response, use `prefer` header with the content `statusCode=XXX` in the request.

```
prefer: statusCode=500
```
