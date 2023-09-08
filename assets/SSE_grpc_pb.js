// GENERATED CODE -- DO NOT EDIT!

'use strict';
var SSE_pb = require('./SSE_pb.js');

function serialize_qlik_sse_BundledRows(arg) {
  if (!(arg instanceof SSE_pb.BundledRows)) {
    throw new Error('Expected argument of type qlik.sse.BundledRows');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_qlik_sse_BundledRows(buffer_arg) {
  return SSE_pb.BundledRows.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_qlik_sse_Capabilities(arg) {
  if (!(arg instanceof SSE_pb.Capabilities)) {
    throw new Error('Expected argument of type qlik.sse.Capabilities');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_qlik_sse_Capabilities(buffer_arg) {
  return SSE_pb.Capabilities.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_qlik_sse_Empty(arg) {
  if (!(arg instanceof SSE_pb.Empty)) {
    throw new Error('Expected argument of type qlik.sse.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_qlik_sse_Empty(buffer_arg) {
  return SSE_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}


// *
// The communication service provided between the Qlik engine and the plugin.
var ConnectorService = exports['qlik.sse.Connector'] = {
  // / A handshake call for the Qlik engine to retrieve the capability of the plugin.
getCapabilities: {
    path: '/qlik.sse.Connector/GetCapabilities',
    requestStream: false,
    responseStream: false,
    requestType: SSE_pb.Empty,
    responseType: SSE_pb.Capabilities,
    requestSerialize: serialize_qlik_sse_Empty,
    requestDeserialize: deserialize_qlik_sse_Empty,
    responseSerialize: serialize_qlik_sse_Capabilities,
    responseDeserialize: deserialize_qlik_sse_Capabilities,
  },
  // / Requests a function to be executed as specified in the header.
executeFunction: {
    path: '/qlik.sse.Connector/ExecuteFunction',
    requestStream: true,
    responseStream: true,
    requestType: SSE_pb.BundledRows,
    responseType: SSE_pb.BundledRows,
    requestSerialize: serialize_qlik_sse_BundledRows,
    requestDeserialize: deserialize_qlik_sse_BundledRows,
    responseSerialize: serialize_qlik_sse_BundledRows,
    responseDeserialize: deserialize_qlik_sse_BundledRows,
  },
  // / Requests a script to be evaluated as specified in the header.
evaluateScript: {
    path: '/qlik.sse.Connector/EvaluateScript',
    requestStream: true,
    responseStream: true,
    requestType: SSE_pb.BundledRows,
    responseType: SSE_pb.BundledRows,
    requestSerialize: serialize_qlik_sse_BundledRows,
    requestDeserialize: deserialize_qlik_sse_BundledRows,
    responseSerialize: serialize_qlik_sse_BundledRows,
    responseDeserialize: deserialize_qlik_sse_BundledRows,
  },
};

