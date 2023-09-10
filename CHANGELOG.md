# Changelog

## 0.6.0 (2023-09-10)

- codebase converted to ESM

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
