const grpc = require("@grpc/grpc-js");
// const protoLoader = require("@grpc/proto-loader");
// const path = require("path");

// const protobuf = require("protobufjs");

const aaa = require("../assets/SSE_grpc_pb");
const aa1 = require("../assets/SSE_pb");

const funcs = require("./functions");
const { getEvaluateScript } = require("./script");

// const p = protobuf.loadSync(
//   path.resolve(__dirname, "..", "assets", "SSE.proto")
// );

// var AwesomeMessage = p.lookupType("qlik.sse.FunctionRequestHeader");

// const packageDefinition = protoLoader.loadSync(
//   path.resolve(__dirname, "..", "assets", "SSE.proto"),
//   { longs: String, enums: String, defaults: true, oneofs: true }
// );

// const { sse } = grpc.loadPackageDefinition(aaa);
const sse = grpc.loadPackageDefinition(aaa).qlik.sse;
// console.log(sse);
// const { sse } = grpc.load(path.resolve(__dirname, '..', 'assets', 'SSE.proto')).qlik;

const logFn = (level) => ({
  error: level >= 1 ? console.error : () => {},
  info: level >= 2 ? console.log : () => {},
});

/**
 * @param {object} config
 * @param {object|boolean} config.allowScript
 * @param {string} config.identifier
 * @param {object} config.ssl
 * @param {string} config.ssl.cert
 * @param {string} config.ssl.key
 * @param {number} [config.logLevel = 2] The log output level
 * @returns {server}
 */
const server = (config) => {
  const log = logFn(typeof config.logLevel === "number" ? config.logLevel : 2);
  const functions = funcs({ sse: aa1, grpc, log });

  const evaluateScript = getEvaluateScript({
    config,
    sse,
    grpc,
    log,
  });

  function getCapabilities(request, cb) {
    log.info(`Capabilities of plugin '${config.identifier}'`);
    log.info(`  AllowScript: ${!!config.allowScript}`);
    log.info("  Functions:");
    const type = {
      [aa1.DataType.NUMERIC]: "numeric",
      [aa1.DataType.STRING]: "string",
    };

    functions.list().forEach((f) => {
      log.info(
        `    ${f.name}(${f.params.map((p) => type[p.dataType])}) : ${
          type[f.returnType]
        }`
      );
    });

    let f = functions.list();

    //   {
    //     "functions": [
    //         {
    //             "params": [
    //                 {
    //                     "dataType": "NUMERIC",
    //                     "name": "first"
    //                 }
    //             ],
    //             "name": "color",
    //             "functionType": "TENSOR",
    //             "returnType": "STRING",
    //             "functionId": 1001
    //         }
    //     ],
    //     "allowScript": false,
    //     "pluginIdentifier": "infoVault",
    //     "pluginVersion": "0.1.0"
    // }

    const b = new aa1.Capabilities();
    b.setAllowscript(true);
    b.setPluginidentifier(config.identifier);
    b.setPluginversion(config.version);

    const blah = functions.list()[0];
    const f1 = new aa1.FunctionDefinition();
    f1.setFunctiontype(blah.functionType);
    f1.setReturntype(blah.returnType);
    f1.setName(blah.name);
    f1.setFunctionid(blah.functionId);

    const p = new aa1.Parameter();
    p.setDatatype(1);
    p.setName("first");

    const p1 = new aa1.Parameter();
    p1.setDatatype(1);
    p1.setName("second");

    f1.setParamsList([p, p1]);

    // const params = new aa1.

    b.setFunctionsList([f1]);

    cb(
      null,
      // new aa1.Capabilities()
      b
      // Buffer.from(
      //   JSON.stringify({
      //     allowScript: !!config.allowScript,
      //     functions: functions.list(),
      //     pluginIdentifier: config.identifier,
      //     pluginVersion: config.version,
      //   })
      // )
    );
  }

  let grpcServer;

  function start(startConfig = {}) {
    const port = startConfig.port || 50051;
    grpcServer = new grpc.Server();
    grpcServer.addService(sse.Connector.service, {
      evaluateScript,
      executeFunction: functions.execute,
      getCapabilities,
    });

    // if (!config.ssl)
    grpcServer.bindAsync(
      `0.0.0.0:${port}`,
      grpc.ServerCredentials.createInsecure(),
      () => {
        grpcServer.start();
      }
    );

    // if (config.ssl)
    //   grpcServer.bindAsync(
    //     `0.0.0.0:${port}`,
    //     grpc.ServerCredentials.createSsl(
    //       null,
    //       [
    //         {
    //           cert_chain: config.ssl.cert,
    //           private_key: config.ssl.key,
    //         },
    //       ],
    //       false
    //     ),
    //     () => {
    //       grpcServer.start();
    //     }
    //   );

    log.info(`Server listening on port ${port}`);
  }

  return {
    start,
    close() {
      return new Promise((resolve, reject) => {
        if (!grpcServer) {
          reject();
        }
        grpcServer.tryShutdown(resolve);
      });
    },
    addFunction: functions.add,
  };
};

module.exports = {
  server,
  sse,
  pb: aa1,
};
