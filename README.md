# qlik-sse

## Continuing from where [Miralem](https://github.com/miralemd) left off. The original repository can be found [here](https://github.com/miralemd/qlik-sse)

## [New User documentation here](https://docs.informatiqal.com/qlik-sse/)

`@informatiqal/qlik-sse` is an npm package that simplifies the creation of Qlik Server Side Extensions in nodejs.

Check out [Server Side Extension](https://github.com/qlik-oss/server-side-extension) for more info and how to get started from the Qlik side.

## Breaking change

After migrating to `grpc-js` and `protobuf.js` there is a small (but breaking) change when creating instance of a message.
Instead of `.buffer` property we now have to call `.finish()` method.

```javascript
//Old syntax
const tableDescription = q.sse.TableDescription.encode({
  fields: [
    { name: "Dim", dataType: q.sse.DataType.STRING },
    { name: "Value", dataType: q.sse.DataType.NUMERIC },
  ],
}).buffer;
```

```javascript
//New syntax
const tableDescription = q.sse.TableDescription.encode({
  fields: [
    { name: "Dim", dataType: q.sse.DataType.STRING },
    { name: "Value", dataType: q.sse.DataType.NUMERIC },
  ],
}).finish();
```

---

- [Getting started](#getting-started)
- [Concepts](./docs/concepts.md)
- [API documentation](./docs/api.md)

---

## Getting started

### Prerequisites

Before continuing, make sure you:

- have Node.js >= v8.0.0 installed
- can configure your Qlik installation

### Usage

Start by installing `@informatiqal/qlik-sse`:

```sh
npm install @informatiqal/qlik-sse
```

Next, create a file `foo.js`:

```js
import * as q from "@informatiqal/qlik-sse";
//or import { server, sse, sseServices } from "@informatiqal/qlik-sse";

// create an instance of the server
const s = q.server({
  identifier: "xxx",
  version: "0.1.0",
});

// register functions
s.addFunction(/* */);

// start the server
s.start({
  port: 50051,
  allowScript: true,
});
```

and then run it to start the SSE plugin server:

```sh
node foo.js
```

Configure the SSE in your Qlik installation by following [these instructions](https://github.com/qlik-oss/server-side-extension/blob/master/docs/configuration.md)

If you're running Qlik Sense Desktop (or Qlik Engine) locally, restart it after starting the SSE server to allow Qlik Engine to get the SSE plugin's capabilities.

Assuming you have named the plugin `sse`, you should now be able to use it's script functions in expressions:

```basic
sse.ScriptEval('return Math.random()*args[0]', sum(Sales));
```

You have now successfully created a Server Side Extension that can be used from within Qlik Sense or Qlik Core.

Take a look at some of the [examples](./examples) on how to add functionality to the SSE.

## Events

The package expose event emitter that emits couple of events - `info` and `error`

```javascript
import { server, emitter } from "@informatiqal/qlik-sse";

const s = server({
  identifier: "MySSE",
  version: "0.1.0",
});

emitter.on("info", (message) => {
  // do something with the info message
});

emitter.on("error", (message) => {
  // do something in case of error
});
```

## TODO

- Documentation
  - [x] API
  - [x] Explain function types `SCALAR`, `AGGREGATION` and `TENSOR`
  - [x] Table load
  - [ ] Documentation review + dedicated help/documentation page
- Examples
  - [ ] How to use tensorflow with qix data
  - Real use cases
    - [ ] linear regression
    - [x] k-means
    - ...
  - Full Qlik example
    - [x] configuring Qlik Engine to use SSEPlugin
    - [x] dockerized environment
    - [ ] loading data
    - [ ] expression calls
- Features
  - [x] Script evaluation
  - [x] SSL communication (certificate usage)
  - [ ] Error handling
- Code
  - [x] Convert to ES6
  - [ ] ~~Convert to TypeScript?~~ Just used JSDoc. No need to complicate things
  - [x] Build step
