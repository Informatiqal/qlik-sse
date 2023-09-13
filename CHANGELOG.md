# Changelog

## 0.6.6 (2023-09-13)

- The capability response emits each initial info as separate requests, instead of one big message

## 0.6.5 (2023-09-12)

- No more `console.log`. All messages are send via event emitter [Informatiqal/qlik-sse#8](https://github.com/Informatiqal/qlik-sse/issues/8)

## 0.6.4 (2023-09-12)

- type declarations should be available now [Informatiqal/qlik-sse#9](https://github.com/Informatiqal/qlik-sse/issues/9)
- added more type definitions

## 0.6.3 (2023-09-11)

- re-publish the package with type declarations

## 0.6.2 (2023-09-10)

- `sseServices` no longer exported. `sseServices` data is now part of `sse` variable (as it should be)
- updated readme with info about breaking change when creating instance of a message - instead of `.buffer` we have to call `finish()` method
- tests updated with the above change

## 0.6.1 (2023-09-10)

- no need to use `.values` for `sse.DataType` and `sse.FunctionType`. This makes the package backward compatible with the old version. Tested with [RobWunderlich/qcb-qlik-sse](https://github.com/RobWunderlich/qcb-qlik-sse)

## 0.6.0 (2023-09-10)

- codebase converted to ESM
- build step to create both ESM and CommonJS versions of the package

## 0.5.1 (2023-09-10)

- output the peer ip address
- included the ssl tools required to generate certificates. Copied the instructions from [qlik-oss/server-side-extension](https://github.com/qlik-oss/server-side-extension/tree/master/generate_certs_guide)

## 0.5.0 (2023-09-09)

- `ssl` option in the config. When provided (+ the required certificates) the server will be created with `createSsl` option. This will make the communication between the server and the client(s) secure
- correctly return errors during communication - `request.call.sendError` instead of `request.call.cancelWithStatus`. `request.call.sendError` is the new way of sending errors

## 0.4.1 (2023-09-08)

- migrated to `grpc-js`. The old `grpc` package is deprecated
- test cases are migrated to `vitest`

## 0.3.0 (2019-10-13)

### Features

- support table load
- handle async function
- add `close()` method on server
- FIX catch outer function errors
- FIX catch script errors

## 0.2.0 (2018-12-04)

- enable script evaluation

## 0.1.0 (2018-08-23)

Initial release
