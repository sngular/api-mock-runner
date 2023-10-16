# Welcome to api-mock-runner 👋

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Create mocks servers with its schemas

## Install

```sh
npm ci
```

## Usage

```sh
npm start
```

### Response selection

The application will return the first response by default. To use another existing response, use `prefer` header with the content `statusCode=XXX` in the request.

```
prefer: statusCode=500
```
