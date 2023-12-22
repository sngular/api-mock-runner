# ADR: Export Modules

## Status

Accepted

## Context

Creating stubs with ES Modules configuration can be challenging due to the read-only nature of ES Modules. This limitation prevents libraries like Sinon from effectively overwriting their behavior.

## Decision

The adopted solution is to export all functions in each module within a const object wrapper. By doing so, the read-only ES Module becomes the object, allowing libraries to stub and overwrite the object properties (module functions).

```
function foo() {}

export const myModule = { foo };
```

Classes and constants are exported as named exports

```
// Classes
export class MyClass {}

// Constants
export const myConst = { bar: 'foo' };
```

### Third-party libraries

For stubbing third-party libraries, we have chosen to use esmock as we do not have control over how they are exported. esmock provides a mechanism to overcome this limitation.

## Consequences

This approach ensures that the ES Modules can be effectively stubbed, providing flexibility in testing and development. However, it introduces a dependency on the esmock library for stubbing third-party modules. Developers should be aware of this dependency when working with the codebase.
